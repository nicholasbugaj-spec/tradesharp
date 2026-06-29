export type Recommendation = "BUY" | "SELL" | "HOLD";

export type MarketType =
  | "sports_betting"
  | "prediction_market"
  | "crypto"
  | "stocks"
  | "financial"
  | "generic";

export type Plan = "free" | "basic" | "pro";

export interface AnalysisPack {
  id: string;
  name: string;
  credits: number;
  price: number;       // in dollars
  priceLabel: string;
  stripePriceId?: string;
  highlight?: boolean;
}

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
  liquidity?: string;
  volumeSwings?: string;
  newsImpact?: string[];
  // New enhanced fields
  quickTake?: string;
  bullPercent?: number;
  bearPercent?: number;
  rsi?: number;
  macd?: string;
  bollingerBand?: string;
  trendStrength?: number;
  riskReward?: string;
  sharpMoney?: string;
  kellySize?: string;
  technicalRating?: string;
  momentumScore?: number;
  volatility?: string;
  supportLevel?: string;
  resistanceLevel?: string;
  signals3?: string[];
  // Stocks/Crypto specific
  movingAvg50?: string;
  movingAvg200?: string;
  maCrossSignal?: string;
  candlePattern?: string;
  chartPattern?: string;
  chartPatternSignal?: string;
  chartPatternTarget?: string;
  chartPatternInvalidation?: string;
  patternMaturity?: string;
  sectorSentiment?: string;
  fearGreedIndex?: number;
  fearGreedLabel?: string;
  fundingRate?: string;
  openInterestChange?: string;
  dominance?: string;
  earningsDate?: string;
  optionsFlow?: string;
  target24h?: string;
  target7d?: string;
  target30d?: string;
  signalConsensus?: Array<{ name: string; value: string; signal: "bull" | "bear" | "neutral" }>;
}

export interface AnalysisResult {
  id: string;
  recommendation: Recommendation;
  confidence: number;
  reasoning: string;
  marketType: MarketType;
  signals: AnalysisSignals;
  imageUrl?: string | null;
  starred?: boolean;
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
  uploadsPerMonth?: number;
  features: PlanFeature[];
  stripePriceId?: string;
}

export interface UsageInfo {
  used: number;
  limit: number | null;
  plan: Plan;
}
