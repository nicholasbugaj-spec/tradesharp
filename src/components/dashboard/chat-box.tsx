"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, Send, Lock, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatBoxProps {
  analysisId: string;
  isPro: boolean;
}

const STARTER_QUESTIONS = [
  "What's the best position size?",
  "What would invalidate this thesis?",
  "What's the biggest risk here?",
  "Should I wait for a better entry?",
];

export function ChatBox({ analysisId, isPro }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messagesRemaining, setMessagesRemaining] = useState<number | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPro) { setLoadingHistory(false); return; }
    fetch(`/api/chat?analysisId=${analysisId}`)
      .then(r => r.json())
      .then(data => {
        setMessages(data.messages ?? []);
        setMessagesRemaining(data.messagesRemaining ?? 50);
      })
      .finally(() => setLoadingHistory(false));
  }, [analysisId, isPro]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setError("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, message: msg }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        // Remove the optimistic user message on error
        setMessages(prev => prev.slice(0, -1));
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        setMessagesRemaining(data.messagesRemaining);
      }
    } catch {
      setError("Network error. Please try again.");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-base font-bold text-text-primary mb-1">AI Follow-Up Chat</h3>
        <p className="text-sm text-text-secondary mb-4">
          Ask Claude anything about this analysis — position sizing, risk, scenarios, timing.
          <br />
          <span className="text-primary font-medium">Pro plan exclusive.</span>
        </p>
        <div className="flex flex-wrap gap-2 justify-center mb-5">
          {STARTER_QUESTIONS.map(q => (
            <span key={q} className="text-xs px-2.5 py-1 rounded-full bg-surface border border-border text-muted">{q}</span>
          ))}
        </div>
        <Link href="/pricing">
          <Button size="sm">Upgrade to Pro <ArrowRight className="h-3.5 w-3.5" /></Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary">Ask the AI</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">Pro</span>
        </div>
        {messagesRemaining !== null && (
          <span className="text-xs text-muted">{messagesRemaining} messages left this month</span>
        )}
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="h-4 w-4 text-muted animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <MessageSquare className="h-8 w-8 text-muted/40" />
            <p className="text-xs text-muted text-center">Ask anything about this analysis</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {STARTER_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-text-secondary hover:text-primary hover:border-primary/30 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-surface-2 border border-border text-text-primary rounded-tl-sm"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-2 border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <p className="text-xs text-danger text-center py-1">{error}</p>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask about position size, risk, timing..."
          disabled={loading || messagesRemaining === 0}
          className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-border text-text-primary text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 disabled:opacity-50"
        />
        <Button
          size="sm"
          onClick={() => send()}
          disabled={!input.trim() || loading || messagesRemaining === 0}
          className="px-3"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
