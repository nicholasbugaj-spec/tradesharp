"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ANALYSIS_PACKS, PLANS } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ShoppingCart, CheckCircle, Loader2, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function StoreContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      const packId = searchParams.get("pack");
      const pack = ANALYSIS_PACKS.find((p) => p.id === packId);
      setSuccessMsg(pack
        ? `🎉 ${pack.credits} analyses added to your account!`
        : "🎉 Purchase successful! Your analyses have been added.");
    }
  }, [searchParams]);

  async function handleBuyPack(packId: string) {
    if (status !== "authenticated") {
      router.push("/auth/register");
      return;
    }
    setLoading(packId);
    try {
      const res = await fetch("/api/stripe/pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
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

  const plan = (session?.user as { plan?: string })?.plan ?? "free";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <ShoppingCart className="h-4 w-4" />
          Analysis Store
        </div>
        <h1 className="text-4xl font-extrabold text-text-primary mb-3">
          Buy More Analyses
        </h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          Top up your account with extra analyses any time. Credits never expire and stack on top of your plan.
        </p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-8 p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3 text-green-400 max-w-lg mx-auto">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Current plan info */}
      <div className="mb-10 p-4 rounded-xl bg-surface border border-border flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm text-text-secondary">Current plan:</span>
          <span className="text-sm font-semibold text-text-primary capitalize">{plan}</span>
        </div>
        {plan === "free" && (
          <Link href="/pricing">
            <Button size="sm" variant="primary">Upgrade plan</Button>
          </Link>
        )}
      </div>

      {/* Analysis packs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {ANALYSIS_PACKS.map((pack) => (
          <Card
            key={pack.id}
            className={cn(
              "relative transition-all duration-200",
              pack.highlight
                ? "border-primary/50 shadow-xl shadow-primary/10"
                : "hover:border-border-light"
            )}
          >
            {pack.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="primary" className="px-3 py-1 text-xs font-semibold">
                  <Star className="h-3 w-3 mr-1" />
                  Best Value
                </Badge>
              </div>
            )}
            <CardContent className="p-7 flex flex-col items-center text-center">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
                pack.highlight ? "bg-primary/20" : "bg-surface-2"
              )}>
                <Zap className={cn("h-7 w-7", pack.highlight ? "text-primary" : "text-muted")} />
              </div>

              <h3 className="text-lg font-bold text-text-primary mb-1">{pack.name}</h3>
              <p className="text-4xl font-black text-text-primary mt-2 mb-1">{pack.priceLabel}</p>
              <p className="text-sm text-text-secondary mb-1">
                <span className="text-text-primary font-semibold">{pack.credits} analyses</span>
              </p>
              <p className="text-xs text-muted mb-6">
                ${(pack.price / pack.credits).toFixed(3)} per analysis
              </p>

              <Button
                variant={pack.highlight ? "primary" : "outline"}
                className="w-full"
                onClick={() => handleBuyPack(pack.id)}
                disabled={!!loading}
              >
                {loading === pack.id ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Redirecting...</>
                ) : (
                  <>Buy {pack.credits} Analyses — {pack.priceLabel}</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How credits work */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-text-primary text-center mb-6">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "1", title: "Buy a pack", desc: "Choose how many analyses you need and pay once — no subscription required." },
            { icon: "2", title: "Credits added instantly", desc: "Your analyses are added to your account the moment payment completes." },
            { icon: "3", title: "Never expire", desc: "Credits stack on top of your plan and never expire. Use them whenever you want." },
          ].map((step) => (
            <div key={step.icon} className="p-5 rounded-xl bg-surface border border-border text-center">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center mx-auto mb-3">
                {step.icon}
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">{step.title}</h3>
              <p className="text-xs text-text-secondary">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription upsell */}
      {plan === "free" && (
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center max-w-lg mx-auto">
          <p className="text-sm font-semibold text-text-primary mb-1">Want even more value?</p>
          <p className="text-xs text-text-secondary mb-4">A Basic plan at $4.99/mo gives you 50 analyses — that&apos;s cheaper than buying packs.</p>
          <Link href="/pricing">
            <Button variant="primary" size="sm">View Plans</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <StoreContent />
    </Suspense>
  );
}
