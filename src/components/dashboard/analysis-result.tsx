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
  Lock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Target,
  AlertTriangle,
  DollarSign,
  Flame,
  Droplets,
  BarChart2,
  Newspaper,
  Activity,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ChatBox } from "./chat-box";

interface AnalysisResultProps {
  result: AnalysisResult;
  showConfidence: boolean;
  showReasoning: boolean;
  showSignals: boolean;
  isPro?: boolean;
}

function RecommendationIcon({ rec }: { rec: string }) {
  const props = { className: "h-8 w-8" };
  switch (rec) {
    case "BUY":   return <TrendingUp {...props} />;
    case "SELL":  return <TrendingDown {...props} />;
    case "HOLD":  return <Minus {...props} />;
    default:      return <Minus {...props} />;
  }
}

// Reusable collapsible section wrapper
function Section({
  title,
  icon,
  accentClass = "from-primary to-accent",
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accentClass?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <CardContent className="p-5">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full group"
        >
          <div className="flex items-center gap-2">
            <div className={cn("w-1 h-4 rounded-full bg-gradient-to-b", accentClass)} />
            {icon}
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          </div>
          {open
            ? <ChevronUp className="h-4 w-4 text-muted group-hover:text-text-primary transition-colors" />
            : <ChevronDown className="h-4 w-4 text-muted group-hover:text-text-primary transition-colors" />
          }
        </button>
        {open && <div className="mt-4 animate-fade-in">{children}</div>}
      </CardContent>
    </Card>
  );
}

export function AnalysisResultCard({
  result,
  showConfidence,
  showReasoning,
  showSignals,
  isPro = false,
}: AnalysisResultProps) {
  const recBg = getRecommendationBg(result.recommendation);
  const confColor = getConfidenceColor(result.confidence);
  const confBarColor = getConfidenceBarColor(result.confidence);
  const s = result.signals ?? {};
  const bullPct = s.bullPercent ?? 50;
  const bearPct = s.bearPercent ?? 50;

  return (
    <div className="animate-slide-up space-y-4">

      {/* ── Quick Take banner ── */}
      {s.quickTake && (
        <div className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/25 flex items-start gap-3">
          <span className="text-lg leading-none mt-0.5">⚡</span>
          <p className="text-sm font-semibold text-text-primary italic">&ldquo;{s.quickTake}&rdquo;</p>
        </div>
      )}

      {/* ── Main result card ── */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Recommendation badge */}
            <div className={cn("flex items-center gap-3 px-6 py-4 rounded-2xl border flex-shrink-0", recBg)}>
              <RecommendationIcon rec={result.recommendation} />
              <div>
                <p className="text-xs font-medium opacity-70">Recommendation</p>
                <p className="text-2xl font-black tracking-wide">{result.recommendation.replace("_", " ")}</p>
                {s.technicalRating && (
                  <p className="text-xs opacity-60 mt-0.5">{s.technicalRating}</p>
                )}
              </div>
            </div>

            {/* Confidence */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-text-secondary font-medium">Confidence Score</p>
                {showConfidence ? (
                  <span className={cn("text-2xl font-black", confColor)}>{result.confidence}%</span>
                ) : (
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-surface-2 blur-sm select-none">{result.confidence}%</span>
                )}
              </div>
              {showConfidence ? (
                <>
                  <div className="w-full h-3 bg-surface rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000 ease-out", confBarColor)} style={{ width: `${result.confidence}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted mt-1.5">
                    <span>Weak</span><span>Moderate</span><span>Strong</span>
                  </div>
                </>
              ) : (
                <div className="relative">
                  <div className="w-full h-3 bg-surface-2 rounded-full overflow-hidden blur-sm">
                    <div className={cn("h-full rounded-full", confBarColor)} style={{ width: `${result.confidence}%` }} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Link href="/pricing">
                      <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                        <Lock className="h-3 w-3" />Upgrade to see score<ArrowRight className="h-3 w-3" />
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
                  {{ sports_betting: "⚽ Sports Betting", prediction_market: "🔮 Prediction Market", crypto: "₿ Crypto", stocks: "📈 Stocks", financial: "💹 Financial", generic: "📊 Market" }[result.marketType] ?? result.marketType.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs text-muted">{formatDate(result.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Quick Signal Pills ── */}
      {s.signals3 && s.signals3.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {s.signals3.map((sig, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/25 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {sig}
            </span>
          ))}
          {s.riskReward && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/10 border border-green-500/25 text-green-400">
              R/R {s.riskReward}
            </span>
          )}
          {s.kellySize && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-500/10 border border-yellow-500/25 text-yellow-400">
              Kelly: {s.kellySize}
            </span>
          )}
        </div>
      )}

      {/* ── Bulls vs Bears + Indicators ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bull / Bear meter */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-green-400 to-red-400" />
              <TrendingUp className="h-4 w-4 text-muted" />
              <h3 className="text-sm font-semibold text-text-primary">Bulls vs Bears</h3>
            </div>
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-xs text-muted mb-0.5">Bulls</p>
                <p className="text-2xl font-black text-green-400">{bullPct}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted mb-0.5">Bears</p>
                <p className="text-2xl font-black text-red-400">{bearPct}%</p>
              </div>
            </div>
            <div className="w-full h-4 bg-red-500/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${bullPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted mt-1.5">
              <span>🐂 Bullish signals</span><span>Bearish signals 🐻</span>
            </div>
            {s.sharpMoney && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted mb-0.5">Sharp Money</p>
                <p className="text-xs font-semibold text-text-primary">{s.sharpMoney}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technical indicators grid */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-accent to-primary" />
              <Activity className="h-4 w-4 text-muted" />
              <h3 className="text-sm font-semibold text-text-primary">Technical Indicators</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {s.rsi !== undefined && (
                <div className="p-2.5 bg-surface-2 rounded-lg">
                  <p className="text-xs text-muted mb-1">RSI</p>
                  <p className={cn("text-lg font-black", s.rsi < 35 ? "text-green-400" : s.rsi > 65 ? "text-red-400" : "text-yellow-400")}>
                    {s.rsi}
                  </p>
                  <p className="text-xs text-muted">{s.rsi < 35 ? "Oversold" : s.rsi > 65 ? "Overbought" : "Neutral"}</p>
                </div>
              )}
              {s.trendStrength !== undefined && (
                <div className="p-2.5 bg-surface-2 rounded-lg">
                  <p className="text-xs text-muted mb-1">Trend Strength</p>
                  <div className="flex items-end gap-0.5 h-6 mt-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={cn("flex-1 rounded-sm", i < (s.trendStrength ?? 0) ? "bg-primary" : "bg-surface")}
                        style={{ height: `${40 + i * 6}%` }} />
                    ))}
                  </div>
                  <p className="text-xs text-muted mt-1">{s.trendStrength}/10</p>
                </div>
              )}
              {s.momentumScore !== undefined && (
                <div className="p-2.5 bg-surface-2 rounded-lg">
                  <p className="text-xs text-muted mb-1">Momentum</p>
                  <p className={cn("text-lg font-black", s.momentumScore > 60 ? "text-green-400" : s.momentumScore < 40 ? "text-red-400" : "text-yellow-400")}>
                    {s.momentumScore}
                  </p>
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${s.momentumScore}%` }} />
                  </div>
                </div>
              )}
              {s.macd && (
                <div className="p-2.5 bg-surface-2 rounded-lg">
                  <p className="text-xs text-muted mb-1">MACD</p>
                  <p className={cn("text-xs font-semibold leading-tight", s.macd.includes("Bullish") ? "text-green-400" : s.macd.includes("Bearish") ? "text-red-400" : "text-yellow-400")}>
                    {s.macd}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Key Levels + Volatility ── */}
      {(s.supportLevel || s.resistanceLevel || s.volatility || s.bollingerBand) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {s.supportLevel && (
            <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
              <p className="text-xs text-muted mb-1 flex items-center gap-1"><TrendingDown className="h-3 w-3 text-green-400" />Support</p>
              <p className="text-sm font-mono font-bold text-green-400">{s.supportLevel}</p>
            </div>
          )}
          {s.resistanceLevel && (
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
              <p className="text-xs text-muted mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3 text-red-400" />Resistance</p>
              <p className="text-sm font-mono font-bold text-red-400">{s.resistanceLevel}</p>
            </div>
          )}
          {s.volatility && (
            <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <p className="text-xs text-muted mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-yellow-400" />Volatility</p>
              <p className="text-xs font-semibold text-yellow-400">{s.volatility.split(" — ")[0]}</p>
              {s.volatility.includes(" — ") && <p className="text-xs text-muted mt-0.5">{s.volatility.split(" — ")[1]}</p>}
            </div>
          )}
          {s.bollingerBand && (
            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <p className="text-xs text-muted mb-1 flex items-center gap-1"><BarChart2 className="h-3 w-3 text-purple-400" />BB Signal</p>
              <p className="text-xs font-semibold text-purple-400 leading-tight">{s.bollingerBand}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Signal Consensus Table ── */}
      {s.signalConsensus && s.signalConsensus.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-green-400 to-red-400" />
              <Target className="h-4 w-4 text-muted" />
              <h3 className="text-sm font-semibold text-text-primary">Signal Consensus</h3>
              <div className="ml-auto flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-green-400"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />{s.signalConsensus.filter(x => x.signal === "bull").length} Bull</span>
                <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{s.signalConsensus.filter(x => x.signal === "bear").length} Bear</span>
                <span className="flex items-center gap-1 text-muted"><span className="w-2 h-2 rounded-full bg-muted inline-block" />{s.signalConsensus.filter(x => x.signal === "neutral").length} Neutral</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {s.signalConsensus.map((sig, i) => (
                <div key={i} className={cn("p-2.5 rounded-lg border",
                  sig.signal === "bull" ? "bg-green-500/5 border-green-500/20" :
                  sig.signal === "bear" ? "bg-red-500/5 border-red-500/20" :
                  "bg-surface-2 border-border"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted font-medium">{sig.name}</p>
                    <span className={cn("text-xs font-bold",
                      sig.signal === "bull" ? "text-green-400" :
                      sig.signal === "bear" ? "text-red-400" : "text-muted"
                    )}>
                      {sig.signal === "bull" ? "▲" : sig.signal === "bear" ? "▼" : "—"}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-tight truncate">{sig.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Multi-Timeframe Targets ── */}
      {(s.target24h || s.target7d || s.target30d) && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-primary to-accent" />
              <DollarSign className="h-4 w-4 text-muted" />
              <h3 className="text-sm font-semibold text-text-primary">Price Targets</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "24h Target", value: s.target24h, color: "text-yellow-400", bg: "bg-yellow-500/5 border-yellow-500/20" },
                { label: "7-Day Target", value: s.target7d, color: "text-primary", bg: "bg-primary/5 border-primary/20" },
                { label: "30-Day Target", value: s.target30d, color: "text-accent", bg: "bg-accent/5 border-accent/20" },
              ].map((t) => t.value ? (
                <div key={t.label} className={cn("p-3 rounded-xl border text-center", t.bg)}>
                  <p className="text-xs text-muted mb-1">{t.label}</p>
                  <p className={cn("text-sm font-bold font-mono", t.color)}>{t.value.split(" ")[0]}</p>
                  <p className="text-xs text-muted mt-0.5">{t.value.split(" ").slice(1).join(" ")}</p>
                </div>
              ) : null)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Stocks/Crypto specific panels ── */}
      {(s.movingAvg50 || s.candlePattern || s.earningsDate || s.optionsFlow || s.fundingRate || s.fearGreedIndex !== undefined) && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-400 to-primary" />
              <BarChart2 className="h-4 w-4 text-muted" />
              <h3 className="text-sm font-semibold text-text-primary">
                {(result.marketType === "crypto") ? "Crypto Metrics" : (result.marketType === "stocks") ? "Stock Metrics" : "Market Metrics"}
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {s.candlePattern && (
                <div className="p-3 bg-surface-2 rounded-lg">
                  <p className="text-xs text-muted mb-1">Candle Pattern</p>
                  <p className="text-sm font-semibold text-text-primary">{s.candlePattern}</p>
                </div>
              )}
              {s.movingAvg50 && (
                <div className="p-3 bg-surface-2 rounded-lg">
                  <p className="text-xs text-muted mb-1">MA 50</p>
                  <p className="text-sm font-mono font-semibold text-text-primary">{s.movingAvg50}</p>
                </div>
              )}
              {s.movingAvg200 && (
                <div className="p-3 bg-surface-2 rounded-lg">
                  <p className="text-xs text-muted mb-1">MA 200</p>
                  <p className="text-sm font-mono font-semibold text-text-primary">{s.movingAvg200}</p>
                </div>
              )}
              {s.maCrossSignal && (
                <div className="p-3 bg-surface-2 rounded-lg sm:col-span-2">
                  <p className="text-xs text-muted mb-1">MA Cross Signal</p>
                  <p className={cn("text-sm font-semibold", s.maCrossSignal.toLowerCase().includes("golden") || s.maCrossSignal.toLowerCase().includes("above") ? "text-green-400" : s.maCrossSignal.toLowerCase().includes("death") || s.maCrossSignal.toLowerCase().includes("below") ? "text-red-400" : "text-yellow-400")}>{s.maCrossSignal}</p>
                </div>
              )}
              {/* Crypto specific */}
              {s.fearGreedIndex !== undefined && (
                <div className="p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted mb-1">Fear & Greed</p>
                  <div className="flex items-center gap-2">
                    <p className={cn("text-xl font-black",
                      s.fearGreedIndex >= 75 ? "text-green-400" :
                      s.fearGreedIndex >= 55 ? "text-lime-400" :
                      s.fearGreedIndex >= 45 ? "text-yellow-400" :
                      s.fearGreedIndex >= 25 ? "text-orange-400" : "text-red-400"
                    )}>{s.fearGreedIndex}</p>
                    <div>
                      <p className={cn("text-xs font-bold",
                        s.fearGreedIndex >= 75 ? "text-green-400" :
                        s.fearGreedIndex >= 55 ? "text-lime-400" :
                        s.fearGreedIndex >= 45 ? "text-yellow-400" :
                        s.fearGreedIndex >= 25 ? "text-orange-400" : "text-red-400"
                      )}>{s.fearGreedLabel}</p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mt-2">
                    <div className={cn("h-full rounded-full",
                      s.fearGreedIndex >= 55 ? "bg-green-500" : s.fearGreedIndex >= 45 ? "bg-yellow-500" : "bg-red-500"
                    )} style={{ width: `${s.fearGreedIndex}%` }} />
                  </div>
                </div>
              )}
              {s.fundingRate && (
                <div className="p-3 bg-surface-2 rounded-lg">
                  <p className="text-xs text-muted mb-1">Funding Rate</p>
                  <p className="text-sm font-semibold text-text-primary">{s.fundingRate}</p>
                </div>
              )}
              {s.openInterestChange && (
                <div className="p-3 bg-surface-2 rounded-lg">
                  <p className="text-xs text-muted mb-1">Open Interest</p>
                  <p className="text-sm font-semibold text-text-primary">{s.openInterestChange}</p>
                </div>
              )}
              {s.dominance && (
                <div className="p-3 bg-surface-2 rounded-lg sm:col-span-2">
                  <p className="text-xs text-muted mb-1">BTC Dominance</p>
                  <p className="text-sm text-text-primary">{s.dominance}</p>
                </div>
              )}
              {/* Stocks specific */}
              {s.earningsDate && (
                <div className="p-3 bg-surface-2 rounded-lg sm:col-span-2">
                  <p className="text-xs text-muted mb-1">Earnings</p>
                  <p className="text-sm text-text-primary">{s.earningsDate}</p>
                </div>
              )}
              {s.optionsFlow && (
                <div className="p-3 bg-surface-2 rounded-lg sm:col-span-2">
                  <p className="text-xs text-muted mb-1">Options Flow</p>
                  <p className="text-sm text-text-primary">{s.optionsFlow}</p>
                </div>
              )}
              {s.sectorSentiment && (
                <div className="p-3 bg-surface-2 rounded-lg sm:col-span-2">
                  <p className="text-xs text-muted mb-1">Sector</p>
                  <p className="text-sm text-text-primary">{s.sectorSentiment}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Analysis Reasoning ── */}
      <Section
        title="Analysis Reasoning"
        icon={<BookOpen className="h-4 w-4 text-primary" />}
        accentClass="from-primary to-accent"
        defaultOpen={true}
      >
        {showReasoning ? (
          <p className="text-sm text-text-secondary leading-relaxed">{result.reasoning}</p>
        ) : (
          <div className="relative">
            <p className="text-sm text-text-secondary leading-relaxed blur-sm select-none">{result.reasoning}</p>
            <div className="absolute inset-0 flex items-center justify-center bg-surface/40 backdrop-blur-[2px] rounded-lg">
              <div className="text-center">
                <Lock className="h-5 w-5 text-muted mx-auto mb-2" />
                <p className="text-xs text-text-secondary mb-2">Upgrade to unlock detailed reasoning</p>
                <Link href="/pricing">
                  <Button size="sm" className="text-xs">Upgrade<ArrowRight className="h-3 w-3" /></Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ── Price Targets ── */}
      {result.signals?.priceTargets && result.signals.priceTargets.length > 0 && (
        <Section
          title="Price Targets & Entry Points"
          icon={<Target className="h-4 w-4 text-primary" />}
          accentClass="from-primary to-accent"
          defaultOpen={true}
        >
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
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded border", actionColor)}>{pt.action}</span>
                      <span className="text-sm font-medium text-text-primary">{pt.outcome}</span>
                      {pt.undervalued && (
                        <span className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded">
                          UNDERVALUED
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-primary">{pt.edgePercent}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
                    {[
                      { icon: <DollarSign className="h-3 w-3 text-muted" />, label: "Current Price", value: pt.currentOdds, color: "text-text-primary" },
                      { icon: <TrendingUp className="h-3 w-3 text-green-400" />, label: "Enter At", value: pt.targetEntry, color: "text-green-400" },
                      { icon: <Target className="h-3 w-3 text-primary" />, label: "Take Profit", value: pt.targetExit, color: "text-primary" },
                      { icon: <AlertTriangle className="h-3 w-3 text-red-400" />, label: "Stop Loss", value: pt.stopLoss, color: "text-red-400" },
                    ].map((cell) => (
                      <div key={cell.label} className="p-3">
                        <div className="flex items-center gap-1 mb-1">{cell.icon}<p className="text-xs text-muted">{cell.label}</p></div>
                        <p className={cn("text-sm font-mono font-semibold", cell.color)}>{cell.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Undervalued Markets ── */}
      {result.signals?.undervaluedMarkets && result.signals.undervaluedMarkets.length > 0 && (
        <Section
          title="Undervalued Markets"
          icon={<Flame className="h-4 w-4 text-yellow-500" />}
          accentClass="from-yellow-500 to-orange-500"
          defaultOpen={true}
        >
          <ul className="space-y-2">
            {result.signals.undervaluedMarkets.map((market, i) => (
              <li key={i} className="flex items-start gap-2 p-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                <span className="text-yellow-500 mt-0.5 flex-shrink-0">◆</span>
                <span className="text-sm text-text-primary">{market}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Liquidity Analysis ── */}
      {result.signals?.liquidity && (
        <Section
          title="Liquidity Analysis"
          icon={<Droplets className="h-4 w-4 text-cyan-400" />}
          accentClass="from-cyan-500 to-blue-500"
          defaultOpen={false}
        >
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
            <p className="text-sm text-text-secondary leading-relaxed">{result.signals.liquidity}</p>
          </div>
        </Section>
      )}

      {/* ── Volume & Swing Analysis ── */}
      {result.signals?.volumeSwings && (
        <Section
          title="Volume & Swing Analysis"
          icon={<BarChart2 className="h-4 w-4 text-purple-400" />}
          accentClass="from-purple-500 to-accent"
          defaultOpen={false}
        >
          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
            <p className="text-sm text-text-secondary leading-relaxed">{result.signals.volumeSwings}</p>
          </div>
        </Section>
      )}

      {/* ── News & Market Impact ── */}
      {result.signals?.newsImpact && result.signals.newsImpact.length > 0 && (
        <Section
          title="News & Market Impact"
          icon={<Newspaper className="h-4 w-4 text-orange-400" />}
          accentClass="from-orange-500 to-red-500"
          defaultOpen={false}
        >
          <ul className="space-y-3">
            {result.signals.newsImpact.map((item, i) => (
              <li key={i} className="flex items-start gap-3 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                <Newspaper className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-secondary">{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Signal Breakdown ── */}
      {showSignals && result.signals && (
        <Section
          title="Signal Breakdown"
          icon={<Activity className="h-4 w-4 text-accent" />}
          accentClass="from-accent to-primary"
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.signals.oddsValue && (
              <div className="p-3 bg-surface-2 rounded-lg sm:col-span-2">
                <p className="text-xs text-muted mb-1">Odds Value Summary</p>
                <p className="text-sm text-text-primary">{result.signals.oddsValue}</p>
              </div>
            )}
            {result.signals.impliedProbability && (
              <div className="p-3 bg-surface-2 rounded-lg">
                <p className="text-xs text-muted mb-1">Market Implied Probability</p>
                <p className="text-sm text-text-primary font-mono">{result.signals.impliedProbability}</p>
              </div>
            )}
            {result.signals.trueEstimatedProbability && (
              <div className="p-3 bg-surface-2 rounded-lg border border-primary/20">
                <p className="text-xs text-muted mb-1">True Estimated Probability</p>
                <p className="text-sm font-mono font-bold text-primary">{result.signals.trueEstimatedProbability}</p>
              </div>
            )}
            {result.signals.lineMovement && (
              <div className="p-3 bg-surface-2 rounded-lg">
                <p className="text-xs text-muted mb-1">Line Movement</p>
                <p className="text-sm text-text-primary">{result.signals.lineMovement}</p>
              </div>
            )}
            {result.signals.volumeIndicator && (
              <div className="p-3 bg-surface-2 rounded-lg">
                <p className="text-xs text-muted mb-1">Volume Indicator</p>
                <p className={cn("text-sm font-semibold",
                  result.signals.volumeIndicator === "High" ? "text-green-400" :
                  result.signals.volumeIndicator === "Low" ? "text-red-400" : "text-yellow-400"
                )}>● {result.signals.volumeIndicator}</p>
              </div>
            )}
            {result.signals.marketSentiment && (
              <div className="p-3 bg-surface-2 rounded-lg">
                <p className="text-xs text-muted mb-1">Market Sentiment</p>
                <p className={cn("text-sm font-semibold",
                  result.signals.marketSentiment === "Bullish" ? "text-green-400" :
                  result.signals.marketSentiment === "Bearish" ? "text-red-400" : "text-yellow-400"
                )}>{result.signals.marketSentiment}</p>
              </div>
            )}
            {result.signals.keyFactors && result.signals.keyFactors.length > 0 && (
              <div className="p-3 bg-surface-2 rounded-lg sm:col-span-2">
                <p className="text-xs text-muted mb-2">Key Factors</p>
                <ul className="space-y-1.5">
                  {result.signals.keyFactors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                      <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── AI Chat Follow-Up ── */}
      <ChatBox analysisId={result.id} isPro={isPro} />

      {/* ── Affiliate links ── */}
      <AffiliateLinks marketType={result.signals?.marketSentiment} recommendation={result.recommendation} />

      {/* ── Upgrade prompt ── */}
      {!showConfidence && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-text-primary">You&apos;re on the Free plan</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Upgrade to Basic or Pro to unlock confidence scores, real AI analysis, and full reasoning.
            </p>
          </div>
          <Link href="/pricing" className="flex-shrink-0">
            <Button size="sm">Upgrade<ArrowRight className="h-3.5 w-3.5" /></Button>
          </Link>
        </div>
      )}

    </div>
  );
}

// ── Affiliate Links ──────────────────────────────────────────────────────────

const CRYPTO_AFFILIATES = [
  { name: "Coinbase", url: "https://coinbase.com/join/tradesharp", logo: "🟡", desc: "Buy crypto easily" },
  { name: "Binance", url: "https://accounts.binance.com/register?ref=tradesharp", logo: "🟠", desc: "Low-fee trading" },
  { name: "Kraken", url: "https://kraken.com", logo: "🐙", desc: "Trusted exchange" },
];

const SPORTS_AFFILIATES = [
  { name: "DraftKings", url: "https://sportsbook.draftkings.com", logo: "🏆", desc: "Up to $1,000 bonus" },
  { name: "FanDuel", url: "https://sportsbook.fanduel.com", logo: "🎯", desc: "Bet $5, get $150" },
  { name: "BetMGM", url: "https://sports.betmgm.com", logo: "🎰", desc: "First bet insurance" },
];

const STOCK_AFFILIATES = [
  { name: "Robinhood", url: "https://join.robinhood.com", logo: "🪶", desc: "Free fractional shares" },
  { name: "Webull", url: "https://webull.com/activity", logo: "📊", desc: "Commission-free trading" },
  { name: "TD Ameritrade", url: "https://tdameritrade.com", logo: "📈", desc: "Advanced charting tools" },
];

const PREDICTION_AFFILIATES = [
  { name: "Polymarket", url: "https://polymarket.com", logo: "🔮", desc: "Bet on world events" },
  { name: "Kalshi", url: "https://kalshi.com", logo: "⚖️", desc: "CFTC-regulated markets" },
  { name: "Manifold", url: "https://manifold.markets", logo: "🌐", desc: "Free prediction markets" },
];

function detectMarketCategory(marketSentiment?: string, recommendation?: string): "crypto" | "sports" | "stocks" | "prediction" {
  const text = ((marketSentiment ?? "") + " " + (recommendation ?? "")).toLowerCase();
  if (/bitcoin|btc|eth|crypto|defi|token|solana|coin/.test(text)) return "crypto";
  if (/nfl|nba|mlb|nhl|soccer|spread|moneyline|over.under|parlay|sportsbook/.test(text)) return "sports";
  if (/prediction|election|market|event|kalshi|polymarket/.test(text)) return "prediction";
  return "stocks";
}

function AffiliateLinks({ marketType, recommendation }: { marketType?: string; recommendation?: string }) {
  const category = detectMarketCategory(marketType, recommendation);
  const links =
    category === "crypto" ? CRYPTO_AFFILIATES :
    category === "sports" ? SPORTS_AFFILIATES :
    category === "prediction" ? PREDICTION_AFFILIATES :
    STOCK_AFFILIATES;

  const categoryLabel =
    category === "crypto" ? "Crypto Exchanges" :
    category === "sports" ? "Sportsbooks" :
    category === "prediction" ? "Prediction Markets" :
    "Stock Brokers";

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-accent to-primary" />
          <ExternalLink className="h-4 w-4 text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">Recommended {categoryLabel}</h3>
          <span className="ml-auto text-xs text-muted italic">Sponsored</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
            >
              <span className="text-xl">{link.logo}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{link.name}</p>
                <p className="text-xs text-muted truncate">{link.desc}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
        <p className="text-xs text-muted mt-3 text-center">
          TradeSharp may earn a commission. Not financial advice — trade responsibly.
        </p>
      </CardContent>
    </Card>
  );
}
