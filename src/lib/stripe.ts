import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

// Map plan IDs to Stripe Price IDs
export const STRIPE_PRICE_IDS: Record<string, string> = {
  basic: process.env.STRIPE_PRICE_BASIC ?? "",
  pro: process.env.STRIPE_PRICE_ELITE ?? "",
};

export function getPlanFromPriceId(priceId: string): string {
  for (const [plan, id] of Object.entries(STRIPE_PRICE_IDS)) {
    if (id === priceId) return plan;
  }
  return "basic";
}
