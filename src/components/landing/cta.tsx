import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Check } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function CTA() {
  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Plan comparison strip */}
        <div className="mb-16">
          <ScrollReveal variant="up" className="text-center mb-10">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Pricing</p>
            <h2 className="text-3xl font-bold text-text-primary mb-3">Start free. Upgrade when you&apos;re ready.</h2>
            <p className="text-text-secondary">No credit card needed to get started.</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                sub: "forever",
                color: "border-border",
                items: ["10 demo analyses/day", "BUY/SELL/HOLD signal", "Market type detection", "Demo confidence score", "No credit card needed"],
                cta: "Start Free",
                href: "/auth/register",
                variant: "secondary" as const,
                highlight: false,
                delay: 0,
              },
              {
                name: "Basic",
                price: "$4.99",
                sub: "per month",
                color: "border-primary/30",
                highlight: false,
                items: ["50 real AI analyses/month", "Price targets (24h / 7d / 30d)", "Ideal entry & exit points", "Bulls vs Bears meter", "Scan history + PDF export"],
                cta: "Get Basic",
                href: "/pricing",
                variant: "secondary" as const,
                delay: 100,
              },
              {
                name: "Pro",
                price: "$11.99",
                sub: "per month",
                color: "border-accent/40",
                highlight: true,
                items: ["120 real AI analyses/month", "8-indicator signal consensus", "RSI, MACD, Bollinger, momentum", "Options flow & Kelly sizing", "AI chat + price alerts"],
                cta: "Go Pro",
                href: "/pricing",
                variant: "primary" as const,
                delay: 200,
              },
            ].map(plan => (
              <ScrollReveal key={plan.name} variant="up" delay={plan.delay}>
                <div className={`relative p-5 rounded-2xl border bg-surface ${plan.color} ${plan.highlight ? "shadow-lg shadow-accent/10 gradient-border" : "glow-card"} h-full flex flex-col`}>
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold">Most Popular</span>
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-text-primary">{plan.name}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-text-primary">{plan.price}</span>
                      <span className="text-xs text-muted">/{plan.sub}</span>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-5 flex-1">
                    {plan.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-xs text-text-secondary">
                        <Check className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href}>
                    <Button variant={plan.variant} size="sm" className="w-full">
                      {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <p className="text-center text-xs text-muted mt-4">Annual plans available: Basic $50/yr · Pro $120/yr</p>
        </div>

        {/* Final CTA block */}
        <ScrollReveal variant="scale">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-surface to-accent/20 border border-primary/20 p-12 text-center scan-line">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none animate-float" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6 animate-pulse-glow">
                <Zap className="h-3.5 w-3.5" />
                Start for free — no credit card needed
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
                Your edge starts with one upload.
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto mb-8 text-lg">
                Join traders who scan smarter. Upload a screenshot, get your signal in seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="min-w-[220px]">
                    Analyze Your First Screenshot Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="secondary" size="lg">See All Plans</Button>
                </Link>
              </div>
              <p className="text-xs text-muted mt-6">
                By signing up you agree to our{" "}
                <Link href="/disclaimer" className="text-primary hover:underline animated-underline">Disclaimer</Link>.
                {" "}Not financial advice.
              </p>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
