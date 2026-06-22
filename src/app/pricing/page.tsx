import { PricingCards } from "@/components/pricing/pricing-cards";
import { DiscountCode } from "@/components/pricing/discount-code";
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

      <PricingCards currentPlan={currentPlan} />

      <DiscountCode />

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
