"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, ArrowRight, Upload, Zap, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "tradesharp_onboarding_done";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to TradeSharp! 👋",
    description: "You're 3 steps away from your first AI-powered market analysis. Let us show you how it works.",
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    target: null,
    position: "center" as const,
  },
  {
    id: "ticker",
    title: "Step 1 — Enter your ticker",
    description: "Type the stock, crypto, or team you want to analyze. E.g. \"BTC\", \"NVDA\", or \"Chiefs vs Bills\". This makes the AI way more accurate.",
    icon: <Zap className="h-6 w-6 text-yellow-400" />,
    target: "onboarding-ticker",
    position: "below" as const,
    tip: "Try: BTC, NVDA, TSLA, Chiefs vs Bills",
  },
  {
    id: "upload",
    title: "Step 2 — Drop your screenshot",
    description: "Upload a screenshot of any chart, sportsbook, or prediction market. We support DraftKings, TradingView, Coinbase, Polymarket, and more.",
    icon: <Upload className="h-6 w-6 text-primary" />,
    target: "onboarding-dropzone",
    position: "above" as const,
    tip: "JPG, PNG or WebP — max 10MB",
  },
  {
    id: "analyze",
    title: "Step 3 — Hit Analyze",
    description: "Click Analyze and get your full signal in under 10 seconds — BUY/SELL/HOLD, confidence score, 8 technical indicators, price targets, and live news.",
    icon: <TrendingUp className="h-6 w-6 text-green-400" />,
    target: "onboarding-analyze",
    position: "above" as const,
    tip: "Pro users also get AI follow-up chat",
  },
];

interface OnboardingTourProps {
  plan: string;
}

export function OnboardingTour({ plan }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay so page renders first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const current = STEPS[step];
    if (current.target) {
      const el = document.getElementById(current.target);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setTargetRect(null);
    }
  }, [step, visible]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isCenter = current.position === "center";
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 transition-opacity"
        onClick={dismiss}
      />

      {/* Highlight ring around target */}
      {targetRect && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-transparent transition-all duration-300"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Tooltip card */}
      {isCenter ? (
        // Centered welcome modal
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md bg-surface border border-primary/30 rounded-2xl shadow-2xl shadow-primary/20 p-7 animate-slide-up">
            <button onClick={dismiss} className="absolute top-4 right-4 text-muted hover:text-text-primary transition-colors">
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mx-auto mb-5">
              {current.icon}
            </div>

            <h2 className="text-xl font-bold text-text-primary text-center mb-2">{current.title}</h2>
            <p className="text-sm text-text-secondary text-center leading-relaxed mb-6">{current.description}</p>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {STEPS.map((_, i) => (
                <div key={i} className={cn("w-2 h-2 rounded-full transition-all",
                  i === step ? "bg-primary w-5" : i < step ? "bg-primary/50" : "bg-surface-2 border border-border"
                )} />
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={dismiss} className="flex-1">
                Skip tour
              </Button>
              <Button size="sm" onClick={next} className="flex-1">
                Let&apos;s go <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {plan === "free" && (
              <p className="text-xs text-muted text-center mt-4">
                Free plan: 10 demo scans/day ·{" "}
                <a href="/pricing" className="text-primary hover:underline" onClick={dismiss}>Upgrade for real AI →</a>
              </p>
            )}
          </div>
        </div>
      ) : (
        // Anchored tooltip
        <TooltipCard
          step={current}
          stepIndex={step}
          total={STEPS.length}
          targetRect={targetRect}
          onNext={next}
          onDismiss={dismiss}
          isLast={isLast}
        />
      )}
    </>
  );
}

function TooltipCard({
  step,
  stepIndex,
  total,
  targetRect,
  onNext,
  onDismiss,
  isLast,
}: {
  step: typeof STEPS[number];
  stepIndex: number;
  total: number;
  targetRect: DOMRect | null;
  onNext: () => void;
  onDismiss: () => void;
  isLast: boolean;
}) {
  const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
  const CARD_HEIGHT = 200;
  const CARD_WIDTH = 340;
  const GAP = 16;

  let top = 0;
  let left = 0;

  if (targetRect) {
    if (step.position === "below") {
      top = targetRect.bottom + scrollY + GAP;
    } else {
      top = targetRect.top + scrollY - CARD_HEIGHT - GAP;
    }
    left = Math.max(16, Math.min(
      targetRect.left + targetRect.width / 2 - CARD_WIDTH / 2,
      (typeof window !== "undefined" ? window.innerWidth : 800) - CARD_WIDTH - 16
    ));
  } else {
    top = 200 + scrollY;
    left = 200;
  }

  return (
    <div
      className="fixed z-50 pointer-events-auto animate-slide-up"
      style={{ top, left, width: CARD_WIDTH }}
    >
      <div className="bg-surface border border-primary/30 rounded-2xl shadow-2xl shadow-primary/20 p-5">
        {/* Arrow indicator */}
        <div className={cn(
          "absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-surface border-primary/30 rotate-45",
          step.position === "below"
            ? "-top-1.5 border-t border-l"
            : "-bottom-1.5 border-b border-r"
        )} />

        <button onClick={onDismiss} className="absolute top-3 right-3 text-muted hover:text-text-primary">
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {step.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary leading-tight">{step.title}</h3>
            {step.tip && (
              <span className="text-xs text-primary font-mono">{step.tip}</span>
            )}
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed mb-4">{step.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all",
                i === stepIndex ? "w-4 bg-primary" : i < stepIndex ? "w-1.5 bg-primary/50" : "w-1.5 bg-surface-2 border border-border"
              )} />
            ))}
          </div>
          <Button size="sm" onClick={onNext} className="gap-1 text-xs h-7 px-3">
            {isLast ? "Done!" : "Next"}
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
