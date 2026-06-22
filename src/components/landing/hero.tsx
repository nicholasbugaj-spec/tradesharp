"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, TrendingUp, TrendingDown, Minus, BarChart2, Activity } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Animated demo scan that cycles through examples
const DEMO_SCANS = [
  {
    ticker: "BTC/USD",
    market: "₿ Crypto",
    rec: "BUY",
    confidence: 82,
    recColor: "text-green-400",
    recBg: "bg-green-500/10 border-green-500/30",
    barColor: "bg-green-500",
    quickTake: "BTC showing textbook accumulation — odds strongly favor a breakout within 48hrs.",
    bull: 74, bear: 26,
    rsi: 38, rsiLabel: "Oversold",
    signals: ["RSI oversold bounce", "Volume confirms move", "MACD bullish cross"],
  },
  {
    ticker: "NVDA",
    market: "📈 Stocks",
    rec: "BUY",
    confidence: 77,
    recColor: "text-green-400",
    recBg: "bg-green-500/10 border-green-500/30",
    barColor: "bg-green-500",
    quickTake: "NVDA breaking above 200-day MA on 3x volume — institutional accumulation confirmed.",
    bull: 68, bear: 32,
    rsi: 54, rsiLabel: "Neutral",
    signals: ["Golden cross forming", "Options flow bullish", "Breaking key resistance"],
  },
  {
    ticker: "Chiefs -3.5",
    market: "⚽ Sports",
    rec: "SELL",
    confidence: 71,
    recColor: "text-red-400",
    recBg: "bg-red-500/10 border-red-500/30",
    barColor: "bg-red-500",
    quickTake: "Chiefs line looks like a trap — sharp money is quietly on the Bills +3.5.",
    bull: 31, bear: 69,
    rsi: 68, rsiLabel: "Overbought",
    signals: ["Reverse line movement", "Sharp money fading", "Line value exists"],
  },
  {
    ticker: "ETH/USD",
    market: "₿ Crypto",
    rec: "HOLD",
    confidence: 58,
    recColor: "text-yellow-400",
    recBg: "bg-yellow-500/10 border-yellow-500/30",
    barColor: "bg-yellow-500",
    quickTake: "ETH at fair value — no edge right now, wait for a cleaner setup.",
    bull: 52, bear: 48,
    rsi: 51, rsiLabel: "Neutral",
    signals: ["Pattern near complete", "Momentum slowing", "Wait for breakout"],
  },
];

function AnimatedDemo() {
  const [scanIndex, setScanIndex] = useState(0);
  const [phase, setPhase] = useState<"scanning" | "result">("scanning");
  const [barWidth, setBarWidth] = useState(0);
  const [bullWidth, setBullWidth] = useState(0);

  const scan = DEMO_SCANS[scanIndex];

  useEffect(() => {
    // scanning → result after 1.2s
    setPhase("scanning");
    setBarWidth(0);
    setBullWidth(0);
    const t1 = setTimeout(() => {
      setPhase("result");
      // Animate bars
      setTimeout(() => setBarWidth(scan.confidence), 50);
      setTimeout(() => setBullWidth(scan.bull), 100);
    }, 1200);
    // Cycle to next scan every 5s
    const t2 = setTimeout(() => {
      setScanIndex(i => (i + 1) % DEMO_SCANS.length);
    }, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [scanIndex, scan.confidence, scan.bull]);

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden scan-line">
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 bg-background rounded-md px-3 py-1 text-xs text-muted text-center">
          tradesharp.app/dashboard
        </div>
      </div>

      <div className="p-5 space-y-4 min-h-[280px]">
        {phase === "scanning" ? (
          <div className="flex flex-col items-center justify-center h-48 gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">Analyzing {scan.ticker}...</p>
              <div className="flex gap-1 justify-center mt-2">
                {["Reading chart data", "Checking indicators", "Calculating edge"].map((t, i) => (
                  <span key={t} className="text-xs text-muted" style={{ animationDelay: `${i * 200}ms` }}>
                    {t}{i < 2 ? " →" : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-lg", scan.recBg, scan.recColor)}>
                {scan.rec === "BUY" ? <TrendingUp className="h-4 w-4" /> : scan.rec === "SELL" ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                {scan.rec}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">{scan.market}</p>
                <p className={cn("text-2xl font-black", scan.recColor)}>{scan.confidence}%</p>
              </div>
            </div>

            {/* Confidence bar */}
            <div>
              <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", scan.barColor)}
                  style={{ width: `${barWidth}%` }} />
              </div>
            </div>

            {/* Quick take */}
            <p className="text-xs text-text-secondary italic leading-relaxed border-l-2 border-primary/40 pl-2">
              &ldquo;{scan.quickTake}&rdquo;
            </p>

            {/* Bulls vs bears */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-400 font-bold">🐂 {scan.bull}%</span>
                <span className="text-red-400 font-bold">{scan.bear}% 🐻</span>
              </div>
              <div className="w-full h-3 bg-red-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${bullWidth}%` }} />
              </div>
            </div>

            {/* Signal pills */}
            <div className="flex flex-wrap gap-1.5">
              {scan.signals.map(s => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
                  ● {s}
                </span>
              ))}
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-muted font-mono">
                RSI {scan.rsi} · {scan.rsiLabel}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ticker tabs */}
      <div className="border-t border-border px-5 py-2 flex gap-2">
        {DEMO_SCANS.map((s, i) => (
          <button key={s.ticker} onClick={() => setScanIndex(i)}
            className={cn("text-xs px-2 py-1 rounded-md transition-all",
              i === scanIndex ? "bg-primary/20 text-primary font-semibold" : "text-muted hover:text-text-secondary"
            )}>
            {s.ticker}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const statsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.querySelectorAll(".reveal").forEach(child => child.classList.add("visible"));
        observer.unobserve(el);
      }
    }, { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <div className="animate-slide-right">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4 animate-pulse-glow">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered · Stocks · Crypto · Sports · Prediction Markets
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-text-primary leading-tight tracking-tight mb-3">
              Your AI{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary-light bg-clip-text text-transparent">
                Trading Edge
              </span>
              {" "}in Seconds
            </h1>

            <p className="text-base font-semibold italic bg-gradient-to-r from-accent to-primary-light bg-clip-text text-transparent mb-6">
              Premium advice without the premium price.
            </p>

            <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-lg">
              Upload any chart, betting line, or prediction market screenshot.
              Get instant <span className="text-text-primary font-semibold">BUY / SELL / HOLD</span> signals with
              confidence scores, price targets, and real-time indicators — powered by Claude AI.
            </p>

            {/* Market type pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { emoji: "₿", label: "Crypto", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/5" },
                { emoji: "📈", label: "Stocks", color: "text-green-400 border-green-500/30 bg-green-500/5" },
                { emoji: "⚽", label: "Sports Betting", color: "text-blue-400 border-blue-500/30 bg-blue-500/5" },
                { emoji: "🔮", label: "Prediction Markets", color: "text-purple-400 border-purple-500/30 bg-purple-500/5" },
                { emoji: "💹", label: "Forex / Futures", color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5" },
              ].map(m => (
                <span key={m.label} className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", m.color)}>
                  {m.emoji} {m.label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/auth/register">
                <Button size="lg" className="min-w-[180px]">
                  Start Free — No Card Needed
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="lg">
                  See Pricing
                </Button>
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap gap-5 text-xs text-muted">
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" />No credit card required</span>
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" />10 free scans/day</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-primary" />Results in &lt;10 seconds</span>
              <span className="flex items-center gap-1.5"><BarChart2 className="h-3.5 w-3.5 text-primary" />8 technical indicators</span>
            </div>
          </div>

          {/* Right — live demo */}
          <div className="lg:pl-4 animate-slide-left">
            <div className="mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse pulse-dot" />
              <span className="text-xs text-muted font-medium">Live demo — click any ticker to switch</span>
            </div>
            <div className="animate-float-slow">
              <AnimatedDemo />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div ref={statsRef} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 py-8 border-t border-b border-border">
          {[
            { value: "8", label: "Technical Indicators", sub: "per scan" },
            { value: "4", label: "Market Types", sub: "supported" },
            { value: "<10s", label: "Analysis Time", sub: "average" },
            { value: "$0", label: "To Start", sub: "no card needed" },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center reveal" style={{ transitionDelay: `${i * 100}ms` }}>
              <p className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-glow counter">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">{stat.label}</p>
              <p className="text-xs text-muted">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
