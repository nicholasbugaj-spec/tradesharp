"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, ANNUAL_PRICES } from "@/lib/plans";
import { Check, X, Zap, Loader2, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { Plan } from "@/types";

const PROMO_END = new Date("2026-07-02T23:59:59Z").getTime();
const isPromoActive = () => Date.now() < PROMO_END;

interface PricingCardsProps {
  currentPlan?: Plan;
}

export function PricingCards({ currentPlan }: PricingCardsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);
  const planOrder: Plan[] = ["free", "basic", "pro"];
  const promoActive = isPromoActive();

  async function handleSubscribe(planId: Plan) {
    if (!session) {
      router.push("/auth/register");
      return;
    }
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, annual, promo: promoActive }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Something went wrong");
      }
    } catch {
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      {/* Monthly / Annual toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={cn("text-sm font-medium transition-colors", !annual ? "text-text-primary" : "text-muted")}>
          Monthly
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          role="switch"
          aria-checked={annual}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none",
            annual ? "bg-primary" : "bg-surface-2 border border-border"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200",
              annual ? "left-[22px]" : "left-0.5"
            )}
          />
        </button>
        <span className={cn("text-sm font-medium flex items-center gap-2 transition-colors", annual ? "text-text-primary" : "text-muted")}>
          Annual
          <span className="text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
            Save up to 15%
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {planOrder.map((planId) => {
          const plan = PLANS[planId];
          const isHighlighted = planId === "basic";
          const isCurrent = currentPlan === planId;
          const isLoading = loading === planId;
          const annualInfo = ANNUAL_PRICES[planId];

          const displayPrice = annual && annualInfo ? annualInfo.label : plan.priceLabel;
          const savingsLabel = annual && annualInfo
            ? planId === "basic" ? "Save 10%" : planId === "pro" ? "Save 15%" : null
            : null;

          return (
            <div
              key={planId}
              className={cn(
                "relative rounded-2xl border p-8 flex flex-col transition-all duration-200",
                isHighlighted
                  ? "bg-gradient-to-b from-primary/10 to-surface border-primary/40 shadow-xl shadow-primary/10 scale-[1.02]"
                  : "bg-surface border-border hover:border-border-light"
              )}
            >
              {isHighlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="primary" className="px-4 py-1 text-xs font-semibold">
                    <Zap className="h-3 w-3 mr-1" />Most Popular
                  </Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="success" className="px-3 py-1 text-xs">Current Plan</Badge>
                </div>
              )}
              {savingsLabel && !isCurrent && (
                <div className={cn("absolute -top-3", isHighlighted ? "right-4" : "right-4")}>
                  <Badge variant="success" className="px-3 py-1 text-xs font-bold">{savingsLabel}</Badge>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-text-primary mb-1">{plan.name}</h3>
                <p className="text-sm text-text-secondary mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-text-primary">
                    {displayPrice.replace("/mo", "").replace("/yr", "")}
                  </span>
                  <span className="text-sm text-muted">
                    {planId === "free" ? "" : annual ? "/year" : "/month"}
                  </span>
                </div>
                {annual && annualInfo && planId !== "free" && (
                  <p className="text-xs text-muted mt-1">
                    (${(annualInfo.price / 12).toFixed(2)}/mo billed annually)
                  </p>
                )}
                {promoActive && planId !== "free" && (
                  <div className="mt-3 flex items-center gap-2 bg-gradient-to-r from-green-500/15 to-emerald-500/10 border border-green-500/30 rounded-xl px-3 py-2">
                    <Gift className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-green-400">🎉 Limited Time — 1 Month FREE</p>
                      <p className="text-xs text-muted">Pay first month, next month on us</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                      feature.included
                        ? isHighlighted ? "bg-primary/20 text-primary" : "bg-success/10 text-success"
                        : "bg-surface-2 text-muted"
                    )}>
                      {feature.included ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                    <span className={cn("text-sm", feature.included ? "text-text-primary" : "text-muted line-through")}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <Button variant="secondary" disabled className="w-full">Current Plan</Button>
              ) : planId === "free" ? (
                <Link href="/auth/register">
                  <Button variant="secondary" className="w-full">Start for Free</Button>
                </Link>
              ) : (
                <Button
                  variant={isHighlighted ? "primary" : "outline"}
                  className="w-full"
                  onClick={() => handleSubscribe(planId)}
                  disabled={!!loading}
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Redirecting...</>
                  ) : currentPlan ? (
                    `Upgrade to ${plan.name}`
                  ) : promoActive ? (
                    `Get ${plan.name} + 1 Month Free 🎉`
                  ) : (
                    `Get ${plan.name} — ${displayPrice}`
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
