"use client";

import { AnalysisResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getRecommendationBg,
  getConfidenceColor,
  getConfidenceBarColor,
  formatDate,
  cn,
} from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Ban,
  Lock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Target,
  AlertTriangle,
  DollarSign,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface AnalysisResultProps {
  result: AnalysisResult;
  showConfidence: boolean;
  showReasoning: boolean;
  showSignals: boolean;
}

function RecommendationIcon({ rec }: { rec: string }) {
  const props = { className: "h-8 w-8" };
  switch (rec) {
    case "BUY":
      return <TrendingUp {...props} />;
    case "SELL":
      return <TrendingDown {...props} />;
    case "HOLD":
      return <Minus {...props} />;
    case "NO_BET":
      return <Ban {...props} />;
    default:
      return <Minus {...props} />;
  }
}

export function AnalysisResultCard({
  result,
  showConfidence,
  showReasoning,
  showSignals,
}: AnalysisResultProps) {
  const [signalsExpanded, setSignalsExpanded] = useState(false);

  const recBg = getRecommendationBg(result.recommendation);
  const confColor = getConfidenceColor(result.confidence);
  const confBarColor = getConfidenceBarColor(result.confidence);

  return (
    <div className="animate-slide-up space-y-4">
      {/* Main result card */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Recommendation badge */}
            <div
              className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-2xl border flex-shrink-0",
                recBg
              )}
            >
              <RecommendationIcon rec={result.recommendation} />
              <div>
                <p className="text-xs font-medium opacity-70">Recommendation</p>
                <p className="text-2xl font-black tracking-wide">
                  {result.recommendation.replace("_", " ")}
                </p>
              </div>
            </div>

            {/* Confidence */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-text-secondary font-medium">
                  Confidence Score
                </p>
                {showConfidence ? (
                  <span className={cn("text-2xl font-black", confColor)}>
                    {result.confidence}%
                  </span>
                ) : (
                  <div className="relative">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-surface-2 blur-sm select-none">
                      {result.confidence}%
                    </span>
                  </div>
                )}
              </div>

              {showConfidence ? (
                <>
                  <div className="w-full h-3 bg-surface rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 ease-out",
                        confBarColor
                      )}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted mt-1.5">
                    <span>Weak</span>
                    <span>Moderate</span>
                    <span>Strong</span>
                  </div>
                </>
              ) : (
                <div className="relative">
                  {/* Blurred confidence bar */}
                  <div className="w-full h-3 bg-surface-2 rounded-full overflow-hidden blur-sm">
                    <div
                      className={cn("h-full rounded-full", confBarColor)}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                  {/* Upgrade overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Link href="/pricing">
                      <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                        <Lock className="h-3 w-3" />
                        Upgrade to see score
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-2 text-right flex-shrink-0">
              <div>
                <p className="text-xs text-muted">Market Type</p>
                <Badge variant="primary" className="mt-0.5 capitalize">
                  {{
                    sports_betting: "⚽ Sports Betting",
                    prediction_market: "🔮 Prediction Market",
                    crypto: "₿ Crypto",
                    stocks: "📈 Stocks",
                    financial: "💹 Financial",
                    generic: "📊 Market",
                  }[result.marketType] ?? result.marketType.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs text-muted">
                {formatDate(result.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reasoning */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-primary to-accent" />
            <h3 className="text-sm font-semibold text-text-primary">Analysis Reasoning</h3>
          </div>
          {showReasoning ? (
            <p className="text-sm text-text-secondary leading-relaxed">
              {result.reasoning}
            </p>
          ) : (
            <div className="relative">
              <p className="text-sm text-text-secondary leading-relaxed blur-sm select-none">
                {result.reasoning}
              </p>
              <div className="absolute inset-0 flex items-center justify-center bg-surface/40 backdrop-blur-[2px] rounded-lg">
                <div className="text-center">
                  <Lock className="h-5 w-5 text-muted mx-auto mb-2" />
                  <p className="text-xs text-text-secondary mb-2">
                    Upgrade to Pro to see detailed reasoning
                  </p>
                  <Link href="/pricing">
                    <Button size="sm" className="text-xs">
                      Upgrade to Pro
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Undervalued markets */}
      {result.signals?.undervaluedMarkets && result.signals.undervaluedMarkets.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-yellow-500 to-orange-500" />
              <Flame className="h-4 w-4 text-yellow-500" />
              <h3 className="text-sm font-semibold text-text-primary">Undervalued Markets</h3>
            </div>
            <ul className="space-y-2">
              {result.signals.undervaluedMarkets.map((market, i) => (
                <li key={i} className="flex items-start gap-2 p-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                  <span className="text-yellow-500 mt-0.5 flex-shrink-0">◆</span>
                  <span className="text-sm text-text-primary">{market}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Price targets */}
      {result.signals?.priceTargets && result.signals.priceTargets.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-primary to-accent" />
              <Target className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-text-primary">Price Targets & Entry Points</h3>
            </div>
            <div className="space-y-4">
              {result.signals.priceTargets.map((pt, i) => {
                const actionColor =
                  pt.action === "BUY"
                    ? "text-green-400 bg-green-500/10 border-green-500/30"
                    : pt.action === "SELL"
                    ? "text-red-400 bg-red-500/10 border-red-500/30"
                    : "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";

                return (
                  <div key={i} className="rounded-xl border border-border bg-surface-2 overflow-hidden">
                    {/* Header row */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded border", actionColor)}>
                          {pt.action}
                        </span>
                        <span className="text-sm font-medium text-text-primary">{pt.outcome}</span>
                        {pt.undervalued && (
                          <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded">
                            UNDERVALUED
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-primary">{pt.edgePercent}</span>
                    </div>

                    {/* Price grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
                      <div className="p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <DollarSign className="h-3 w-3 text-muted" />
                          <p className="text-xs text-muted">Current Price</p>
                        </div>
                        <p className="text-sm font-mono font-semibold text-text-primary">{pt.currentOdds}</p>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp className="h-3 w-3 text-green-400" />
                          <p className="text-xs text-muted">Enter At</p>
                        </div>
                        <p className="text-sm font-mono font-semibold text-green-400">{pt.targetEntry}</p>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Target className="h-3 w-3 text-primary" />
                          <p className="text-xs text-muted">Take Profit</p>
                        </div>
                        <p className="text-sm font-mono font-semibold text-primary">{pt.targetExit}</p>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <AlertTriangle className="h-3 w-3 text-red-400" />
                          <p className="text-xs text-muted">Stop Loss</p>
                        </div>
                        <p className="text-sm font-mono font-semibold text-red-400">{pt.stopLoss}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signal breakdown */}
      {showSignals && result.signals && (
        <Card>
          <CardContent className="p-5">
            <button
              onClick={() => setSignalsExpanded(!signalsExpanded)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-accent to-primary" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Signal Breakdown
                </h3>
              </div>
              {signalsExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted" />
              )}
            </button>

            {signalsExpanded && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                {result.signals.oddsValue && (
                  <div className="p-3 bg-surface-2 rounded-lg sm:col-span-2">
                    <p className="text-xs text-muted mb-1">Odds Value Summary</p>
                    <p className="text-sm text-text-primary">
                      {result.signals.oddsValue}
                    </p>
                  </div>
                )}
                {result.signals.impliedProbability && (
                  <div className="p-3 bg-surface-2 rounded-lg">
                    <p className="text-xs text-muted mb-1">Market Implied Probability</p>
                    <p className="text-sm text-text-primary font-mono">
                      {result.signals.impliedProbability}
                    </p>
                  </div>
                )}
                {result.signals.trueEstimatedProbability && (
                  <div className="p-3 bg-surface-2 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted mb-1">True Estimated Probability</p>
                    <p className="text-sm font-mono font-bold text-primary">
                      {result.signals.trueEstimatedProbability}
                    </p>
                  </div>
                )}
                {result.signals.lineMovement && (
                  <div className="p-3 bg-surface-2 rounded-lg">
                    <p className="text-xs text-muted mb-1">Line Movement</p>
                    <p className="text-sm text-text-primary">
                      {result.signals.lineMovement}
                    </p>
                  </div>
                )}
                {result.signals.volumeIndicator && (
                  <div className="p-3 bg-surface-2 rounded-lg">
                    <p className="text-xs text-muted mb-1">Volume</p>
                    <p className="text-sm text-text-primary">
                      {result.signals.volumeIndicator}
                    </p>
                  </div>
                )}
                {result.signals.marketSentiment && (
                  <div className="p-3 bg-surface-2 rounded-lg sm:col-span-2">
                    <p className="text-xs text-muted mb-1">Market Sentiment</p>
                    <p className="text-sm text-text-primary">
                      {result.signals.marketSentiment}
                    </p>
                  </div>
                )}
                {result.signals.keyFactors &&
                  result.signals.keyFactors.length > 0 && (
                    <div className="p-3 bg-surface-2 rounded-lg sm:col-span-2">
                      <p className="text-xs text-muted mb-2">Key Factors</p>
                      <ul className="space-y-1">
                        {result.signals.keyFactors.map((factor, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-text-primary"
                          >
                            <span className="text-primary mt-0.5">•</span>
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upgrade prompt for free plan */}
      {!showConfidence && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-text-primary">
              You&apos;re on the Free plan
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Upgrade to Pro to unlock confidence scores, detailed reasoning, and 50 analyses/day.
            </p>
          </div>
          <Link href="/pricing" className="flex-shrink-0">
            <Button size="sm">
              Upgrade
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
