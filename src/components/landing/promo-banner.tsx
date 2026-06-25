"use client";

import { useEffect, useState } from "react";
import { Zap, X } from "lucide-react";

// Promo ends July 2, 2026 (1 week from June 25)
const PROMO_END = new Date("2026-07-02T23:59:59Z").getTime();

function getTimeLeft() {
  const diff = PROMO_END - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

export function PromoBanner() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft || dismissed) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="relative bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient text-white">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Zap className="h-4 w-4 flex-shrink-0 fill-white" />
          <span>🎉 LIMITED TIME — Pay 1 month, get 1 month FREE on any plan!</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono bg-black/20 rounded-lg px-3 py-1 flex-shrink-0">
          <span>Ends in</span>
          <span className="font-bold ml-1">{timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s</span>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
