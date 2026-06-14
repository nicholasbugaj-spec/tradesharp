export type Recommendation = "BUY" | "SELL" | "HOLD" | "NO_BET";

export type MarketType =
  | "sports_betting"
  | "prediction_market"
  | "crypto"
  | "stocks"
  | "financial"
  | "generic";

export type Plan = "basic" | "elite";

export interface PriceTarget {
  action: "BUY" | "SELL" | "HOLD";
  outcome: string;        // e.g. "Team A to win", "YES", "Over 2.5"
  currentOdds: string;    // e.g. "2.45" or "-110"
  targetEntry: string;    // best price to enter at
  targetExit: string;     // take profit level
  stopLoss: string;       // stop loss level
  edgePercent: string;    // e.g. "+8.3% edge"
  undervalued: boolean;
}

export interface AnalysisSignals {
  oddsValue?: string;
  impliedProbability?: string;
  trueEstimatedProbability?: string;
  lineMovement?: string;
  volumeIndicator?: string;
  marketSentiment?: string;
  keyFactors?: string[];
  undervaluedMarkets?: string[];
  priceTargets?: PriceTarget[];
}

export interface AnalysisResult {
  id: string;
  recommendation: Recommendation;
  confidence: number;
  reasoning: string;
  marketType: MarketType;
  signals: AnalysisSignals;
  createdAt: string;
}

export interface AnalysisResultWithUser extends AnalysisResult {
  userId: string;
  imageUrl: string;
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanDefinition {
  id: Plan;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  uploadsPerDay: number | null;
  features: PlanFeature[];
  stripePriceId?: string;
}

export interface UsageInfo {
  used: number;
  limit: number | null;
  plan: Plan;
}
