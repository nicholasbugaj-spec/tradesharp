import { AnalysisPack, Plan, PlanDefinition } from "@/types";

// Annual pricing: Basic 10% off ($4.99*12*0.9=$53.89), Pro 15% off ($11.99*12*0.85=$122.30)
export const ANNUAL_PRICES: Record<string, { price: number; label: string; stripePriceId: string }> = {
  basic: { price: 50, label: "$50/yr", stripePriceId: process.env.STRIPE_PRICE_BASIC_ANNUAL ?? "" },
  pro:   { price: 120, label: "$120/yr", stripePriceId: process.env.STRIPE_PRICE_PRO_ANNUAL ?? "" },
};

export const PLANS: Record<Plan, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "Free",
    description: "Try it out — demo analysis, no card required",
    uploadsPerDay: 10,
    features: [
      { text: "10 demo analyses per day", included: true },
      { text: "BUY/SELL/HOLD signal (demo)", included: true },
      { text: "Market type detection", included: true },
      { text: "Real AI analysis", included: false },
      { text: "Confidence score", included: false },
      { text: "Detailed reasoning", included: false },
      { text: "Price targets & entry points", included: false },
      { text: "Priority support", included: false },
    ],
  },
  basic: {
    id: "basic",
    name: "Basic",
    price: 4.99,
    priceLabel: "$4.99/mo",
    description: "Real AI signals with price targets & ideal entry points",
    uploadsPerDay: null, // enforced monthly instead
    uploadsPerMonth: 50,
    stripePriceId: "price_basic_monthly",
    features: [
      { text: "50 real AI analyses per month", included: true },
      { text: "BUY/SELL/HOLD signal", included: true },
      { text: "Confidence score & detailed reasoning", included: true },
      { text: "Price targets (24h / 7d / 30d)", included: true },
      { text: "Ideal entry & exit points", included: true },
      { text: "Support & resistance levels", included: true },
      { text: "Bulls vs Bears meter", included: true },
      { text: "Live news context injection", included: true },
      { text: "Scan history & PDF export", included: true },
      { text: "Premium indicators & AI chat", included: false },
      { text: "Priority support", included: false },
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 11.99,
    priceLabel: "$11.99/mo",
    description: "Institutional-grade indicators, AI chat & premium edge tools",
    uploadsPerDay: null,
    uploadsPerMonth: 120,
    stripePriceId: "price_pro_monthly",
    features: [
      { text: "120 real AI analyses per month", included: true },
      { text: "Everything in Basic", included: true },
      { text: "8-indicator signal consensus table", included: true },
      { text: "Bulls vs Bears meter", included: true },
      { text: "RSI, MACD, Bollinger Bands & momentum", included: true },
      { text: "Options flow & institutional activity", included: true },
      { text: "Fear & Greed index + funding rate (crypto)", included: true },
      { text: "Kelly Criterion position sizing", included: true },
      { text: "Sharp money % & line movement (sports)", included: true },
      { text: "AI follow-up chat (100 msgs/mo)", included: true },
      { text: "Price alerts (email, every 15 min)", included: true },
      { text: "Priority support", included: true },
    ],
  },
};

export const ANALYSIS_PACKS: AnalysisPack[] = [
  {
    id: "pack_10",
    name: "Starter Pack",
    credits: 10,
    price: 1.25,
    priceLabel: "$1.25",
    stripePriceId: process.env.STRIPE_PRICE_PACK_10 ?? "",
  },
  {
    id: "pack_30",
    name: "Value Pack",
    credits: 30,
    price: 2.99,
    priceLabel: "$2.99",
    highlight: true,
    stripePriceId: process.env.STRIPE_PRICE_PACK_30 ?? "",
  },
  {
    id: "pack_100",
    name: "Power Pack",
    credits: 100,
    price: 8.99,
    priceLabel: "$8.99",
    stripePriceId: process.env.STRIPE_PRICE_PACK_100 ?? "",
  },
];

export function getPlan(planId: string): PlanDefinition {
  return PLANS[planId as Plan] ?? PLANS.free;
}

export function getAnalysisPack(packId: string): AnalysisPack | undefined {
  return ANALYSIS_PACKS.find((p) => p.id === packId);
}

export function canUpload(plan: Plan, uploadsThisMonth: number, bonusCredits: number): boolean {
  if (plan === "free") return uploadsThisMonth < 10; // free uses daily-style limit
  const planDef = PLANS[plan];
  const monthlyLimit = planDef.uploadsPerMonth ?? 0;
  // Can upload if within monthly plan limit OR has bonus credits
  return uploadsThisMonth < monthlyLimit || bonusCredits > 0;
}

export function useRealAI(plan: Plan): boolean {
  return plan === "basic" || plan === "pro";
}

export function showConfidenceScore(plan: Plan): boolean {
  return plan === "basic" || plan === "pro";
}

export function showDetailedReasoning(plan: Plan): boolean {
  return plan === "basic" || plan === "pro";
}

export function showSignalBreakdown(plan: Plan): boolean {
  return plan === "basic" || plan === "pro";
}

export function showPremiumIndicators(plan: Plan): boolean {
  return plan === "pro";
}
