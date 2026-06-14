import { AnalysisPack, Plan, PlanDefinition } from "@/types";

export const PLANS: Record<Plan, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "Free",
    description: "Try it out — demo analysis, no card required",
    uploadsPerDay: 3,
    features: [
      { text: "3 demo analyses per day", included: true },
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
    description: "Real AI analysis every month",
    uploadsPerDay: null, // enforced monthly instead
    uploadsPerMonth: 50,
    stripePriceId: "price_basic_monthly",
    features: [
      { text: "50 real AI analyses per month", included: true },
      { text: "BUY/SELL/HOLD/NO BET signal", included: true },
      { text: "Market type detection", included: true },
      { text: "Real AI analysis", included: true },
      { text: "Confidence score", included: true },
      { text: "Detailed reasoning", included: true },
      { text: "Price targets & entry points", included: false },
      { text: "Priority support", included: false },
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 11.99,
    priceLabel: "$11.99/mo",
    description: "Full power for serious traders",
    uploadsPerDay: null,
    uploadsPerMonth: 120,
    stripePriceId: "price_pro_monthly",
    features: [
      { text: "120 real AI analyses per month", included: true },
      { text: "BUY/SELL/HOLD/NO BET signal", included: true },
      { text: "Market type detection", included: true },
      { text: "Real AI analysis", included: true },
      { text: "Confidence score", included: true },
      { text: "Detailed reasoning", included: true },
      { text: "Price targets & entry points", included: true },
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
    price: 10.00,
    priceLabel: "$10.00",
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
  if (plan === "free") return uploadsThisMonth < 3; // free uses daily-style limit
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
  return plan === "pro";
}
