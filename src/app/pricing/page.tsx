import { PricingCards } from "@/components/pricing/pricing-cards";
import { DiscountCode } from "@/components/pricing/discount-code";
import { PromoBanner } from "@/components/landing/promo-banner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Plan } from "@/types";

export const metadata = {
  title: "Pricing — TradeSharp",
  description: "Choose the right plan for your trading needs.",
};

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  const currentPlan = (session?.user as { plan?: string })?.plan as Plan | undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center mb-16 animate-slide-up">
        <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
          Pricing
        </p>
        <h1 className="text-5xl font-extrabold text-text-primary mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-text-secondary text-lg max-w-xl mx-auto">
          Start free. Upgrade when you need more power. Cancel anytime.
        </p>
      </div>

      {/* Promo callout */}
      <div className="max-w-2xl mx-auto mb-10 -mt-4">
        <PromoBanner />
      </div>

      <PricingCards currentPlan={currentPlan} />

      <DiscountCode />

      {/* Reviews */}
      <div className="mt-24 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            ))}
          </div>
          <p className="text-lg font-bold text-text-primary">Loved by 2,400+ traders</p>
          <p className="text-sm text-muted">Real reviews from real users</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { name: "Jordan M.", handle: "@jordantrades", plan: "Pro", text: "Upgraded to Pro after the first week. The 8-indicator consensus table alone is worth it. Called 4 out of my last 5 trades correctly." },
            { name: "Aisha K.", handle: "@aishainvests", plan: "Basic", text: "I was skeptical at first but the price targets are scarily accurate. Way better than paying $200/mo for a trading newsletter." },
            { name: "Tyler R.", handle: "@tylerflips", plan: "Pro", text: "The options flow and institutional activity data on Pro is insane. This is hedge fund level info for $12 a month. Unreal value." },
            { name: "Marcus D.", handle: "@marcusdaytrader", plan: "Basic", text: "Used to spend hours analyzing charts. Now I upload a screenshot and get a full breakdown in seconds. Game changer for my workflow." },
            { name: "Sofia L.", handle: "@sofiacrypto", plan: "Pro", text: "The crypto funding rate and Fear & Greed index integration is what sold me. No other tool combines all this in one place." },
            { name: "Ryan T.", handle: "@ryanpicks", plan: "Basic", text: "Started on the free plan, upgraded same day. The AI reasoning is so detailed it actually teaches you WHY a trade makes sense." },
          ].map((r) => (
            <div key={r.name} className="p-5 rounded-2xl bg-surface border border-border flex flex-col gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed flex-1">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{r.name}</p>
                  <p className="text-xs text-muted">{r.handle}</p>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{r.plan}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-24 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "Is this financial or betting advice?",
              a: "No. TradeSharp is an informational tool only. Our AI-generated signals are not financial advice and should not be used as the sole basis for any trading or betting decision. Please review our full disclaimer.",
            },
            {
              q: "What types of markets are supported?",
              a: "Sports betting markets, prediction markets (Polymarket, Kalshi, etc.), and financial charts. Our AI detects the market type automatically from your screenshot.",
            },
            {
              q: "Can I cancel my subscription?",
              a: "Yes, you can cancel at any time. Your plan will remain active until the end of the billing period.",
            },
            {
              q: "How accurate are the signals?",
              a: "Our AI provides analysis based on visible market data in the screenshot. Accuracy depends on the quality and completeness of the image. Always use your own judgment alongside our signals.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="p-6 rounded-xl bg-surface border border-border glow-card"
            >
              <h3 className="text-base font-semibold text-text-primary mb-2">
                {item.q}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
