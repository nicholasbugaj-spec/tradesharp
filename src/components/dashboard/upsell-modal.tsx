"use client";

import { X, Zap, ArrowRight, Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface UpsellModalProps {
  plan: string;
  onClose: () => void;
}

export function UpsellModal({ plan, onClose }: UpsellModalProps) {
  const isFree = plan === "free";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md animate-slide-up">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">

            {/* Top gradient bar */}
            <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

            <div className="p-6">
              <button onClick={onClose} className="absolute top-5 right-5 text-muted hover:text-text-primary transition-colors">
                <X className="h-4 w-4" />
              </button>

              {/* Icon + headline */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-1">
                  {isFree ? "You've used all 10 free scans today" : "You've hit your monthly limit"}
                </h2>
                <p className="text-sm text-text-secondary">
                  {isFree
                    ? "Your free scans reset at midnight. Or get more right now:"
                    : "Your scans reset next month. Get more right now:"}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-5">

                {/* Quick pack buy */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">Scan Packs</p>
                        <p className="text-xs text-text-secondary">One-time purchase, never expire</p>
                        <div className="flex gap-2 mt-2">
                          {[
                            { label: "10 scans", price: "$1.25" },
                            { label: "30 scans", price: "$2.99", hot: true },
                            { label: "100 scans", price: "$10.00" },
                          ].map(pack => (
                            <span key={pack.label} className={cn(
                              "text-xs px-2 py-1 rounded-lg border",
                              pack.hot
                                ? "bg-primary/15 border-primary/40 text-primary font-semibold"
                                : "bg-surface border-border text-muted"
                            )}>
                              {pack.hot && "🔥 "}{pack.label} · {pack.price}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href="/store" onClick={onClose}>
                    <Button size="sm" variant="secondary" className="w-full mt-3 gap-1.5">
                      Browse Scan Packs <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>

                {/* Upgrade plan */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/25 hover:border-accent/40 transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">
                        {isFree ? "Upgrade to Basic or Pro" : plan === "basic" ? "Upgrade to Pro" : "Pro Plan"}
                      </p>
                      <p className="text-xs text-text-secondary mb-2">Monthly subscription — best value</p>
                      <div className="flex flex-col gap-1">
                        {isFree && (
                          <span className="text-xs text-text-secondary flex items-center gap-1">
                            <span className="text-green-400">✓</span> Basic: 50 real AI scans · <span className="font-semibold text-text-primary">$4.99/mo</span>
                          </span>
                        )}
                        <span className="text-xs text-text-secondary flex items-center gap-1">
                          <span className="text-green-400">✓</span> Pro: 120 real AI scans + AI chat · <span className="font-semibold text-text-primary">$11.99/mo</span>
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1">
                          <span className="text-green-400">✓</span> Annual: Basic $50/yr · Pro $120/yr
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href="/pricing" onClick={onClose}>
                    <Button size="sm" className="w-full gap-1.5">
                      See All Plans <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Wait option */}
              <button
                onClick={onClose}
                className="w-full text-xs text-muted hover:text-text-secondary transition-colors py-1"
              >
                {isFree ? "Wait for midnight reset →" : "I'll wait for next month →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
