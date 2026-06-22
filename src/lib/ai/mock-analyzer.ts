import { AnalysisResult, MarketType, Recommendation } from "@/types";

type AIAnalysisOutput = Omit<AnalysisResult, "id" | "createdAt">;

function rand(min: number, max: number, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomPrice(base: number, pctLow: number, pctHigh: number) {
  return (base * (1 + rand(pctLow, pctHigh) / 100)).toFixed(2);
}

function randomOdds() {
  const positive = Math.random() > 0.5;
  return positive ? `+${rand(105, 350, 0)}` : `-${rand(105, 280, 0)}`;
}

function randomConfidence(min: number, max: number) {
  return Math.floor(rand(min, max, 0));
}

const NEWS_POOL = [
  "Federal Reserve commentary expected tomorrow — rate decision could shift risk appetite across all asset classes",
  "Breaking: Major institutional player reportedly accumulating large position — whale wallet activity detected on-chain",
  "Earnings report due in 48 hours — implied volatility elevated, options market pricing in ±8.2% move",
  "Recent regulatory filing hints at potential merger — rumors circulating on financial Twitter",
  "CPI inflation data released this morning came in hotter than expected at 3.4% — broad market selloff underway",
  "Sharp weather disruption affecting supply chains — commodity-linked assets reacting in pre-market",
  "Congressional testimony scheduled — sector-specific policy risk elevated for next 72 hours",
  "On-chain data shows exchange outflows spiking — historically bullish signal for spot demand",
  "Breaking: Major protocol upgrade announced — developer activity at 6-month high",
  "SEC filing reveals institutional accumulation over past 30 days — position size material",
  "Player injury report updated — key starter ruled out, line expected to move significantly",
  "Weather forecast for game day: heavy rain predicted — historically suppresses scoring totals",
  "Coaching change announced mid-week — team motivation and scheme uncertainty elevated",
  "Poly market contract nearing resolution deadline — arbitrage opportunity vs prediction market",
  "Index rebalancing event scheduled end of month — passive fund flows will create temporary price distortion",
];

const LIQUIDITY_POOL = [
  `Order book depth: $${(Math.random() * 8 + 1.2).toFixed(1)}M within 1% of mid-price. Bid/ask spread tight at ${(Math.random() * 0.08 + 0.01).toFixed(3)}%. Market makers actively quoting both sides — execution risk low.`,
  `Thin liquidity detected above current price — only $${(Math.random() * 900 + 100).toFixed(0)}k available before next resistance. Large orders may face ${(Math.random() * 1.5 + 0.3).toFixed(1)}% slippage. Scale in gradually.`,
  `Liquidity pooled heavily at round number levels. ${(Math.random() * 40 + 20).toFixed(0)}% of visible depth concentrated within ±0.5% of current price. High-frequency activity detected — spread compression likely at open.`,
  `Dark pool prints detected at this level — estimated $${(Math.random() * 5 + 0.8).toFixed(1)}M in off-exchange volume over last 2 hours. Institutional accumulation pattern consistent with strategic entry.`,
  `Market microstructure shows imbalanced order flow: ${(Math.random() * 20 + 55).toFixed(0)}% of recent aggressor volume is buy-side. Consistent with directional conviction from informed participants.`,
];

const VOLUME_SWING_POOL = [
  `Volume is ${(Math.random() * 2.5 + 1.3).toFixed(1)}x the 20-day average. Last 3 candles show climactic buying — watch for exhaustion reversal if volume declines on next bar.`,
  `Volume profile shows Point of Control (POC) at current price — high-volume node acting as magnet. Breakout above $${(Math.random() * 50 + 10).toFixed(2)} on volume >2x average would confirm momentum.`,
  `Unusual volume spike detected ${(Math.random() * 3 + 1).toFixed(0)} hours ago — ${(Math.random() * 300 + 150).toFixed(0)}% above baseline. Price has since consolidated, suggesting absorption rather than distribution.`,
  `Volume drying up as price approaches resistance — low-volume rally is a warning sign. Failure to hold above ${(Math.random() * 0.5 + 0.1).toFixed(2)}x average volume on next push would invalidate bullish case.`,
  `Intraday volume distribution skewed toward close — ${(Math.random() * 30 + 50).toFixed(0)}% of daily volume in last 2 hours. After-hours activity elevated at ${(Math.random() * 2 + 1).toFixed(1)}x normal. Suggests informed positioning ahead of catalyst.`,
  `Options volume at ${(Math.random() * 4 + 2).toFixed(1)}x open interest — unusual. Call/put ratio at ${(Math.random() * 1.5 + 0.8).toFixed(2)}, skewing bullish. Implied volatility rank at ${(Math.random() * 40 + 30).toFixed(0)}th percentile — options pricing is relatively cheap.`,
];

const MARKET_CONTEXTS = [
  {
    marketType: "sports_betting" as MarketType,
    teams: ["Kansas City Chiefs", "Buffalo Bills", "San Francisco 49ers", "Dallas Cowboys", "Philadelphia Eagles"],
    props: ["Player points over 24.5", "Team total rushing yards over 112.5", "First touchdown scorer"],
  },
  {
    marketType: "crypto" as MarketType,
    tickers: ["BTC/USD", "ETH/USD", "SOL/USD", "AVAX/USD", "MATIC/USD"],
    indicators: ["RSI divergence detected", "MACD crossover forming", "Volume spike above 30-day average"],
  },
  {
    marketType: "stocks" as MarketType,
    tickers: ["NVDA", "AAPL", "TSLA", "META", "AMZN"],
    patterns: ["Bull flag pattern forming", "Breaking above 200-day MA", "Earnings catalyst incoming"],
  },
  {
    marketType: "prediction_market" as MarketType,
    events: ["Fed rate cut by Q2", "BTC above $100k EOY", "Election outcome contract"],
    platforms: ["Polymarket", "Kalshi"],
  },
];

const CANDLE_PATTERNS_BULL = [
  "Bullish Engulfing", "Morning Star", "Hammer", "Inverted Hammer", "Three White Soldiers",
  "Piercing Line", "Bullish Harami", "Dragonfly Doji", "Three Inside Up", "Rising Three Methods",
];
const CANDLE_PATTERNS_BEAR = [
  "Bearish Engulfing", "Evening Star", "Shooting Star", "Hanging Man", "Three Black Crows",
  "Dark Cloud Cover", "Bearish Harami", "Gravestone Doji", "Three Inside Down", "Falling Three Methods",
];
const CANDLE_PATTERNS_NEUTRAL = ["Doji", "Spinning Top", "Long-Legged Doji", "High Wave Candle"];

function buildMarketSpecific(
  marketType: MarketType,
  rec: Recommendation,
  entry: number,
  tickerLabel: string
) {
  const isBull = rec === "BUY";
  const isBear = rec === "SELL";

  const candlePool = isBull ? CANDLE_PATTERNS_BULL : isBear ? CANDLE_PATTERNS_BEAR : CANDLE_PATTERNS_NEUTRAL;
  const candlePattern = candlePool[Math.floor(Math.random() * candlePool.length)];

  // Multi-timeframe price targets
  const move24 = isBull ? rand(1.5, 5.5, 1) : isBear ? rand(-5.0, -1.5, 1) : rand(-1.5, 1.5, 1);
  const move7d  = isBull ? rand(4, 14, 1)   : isBear ? rand(-13, -4, 1)   : rand(-3, 3, 1);
  const move30d = isBull ? rand(10, 35, 1)  : isBear ? rand(-30, -8, 1)   : rand(-6, 8, 1);
  const fmt = (p: number, pct: number) => `$${(p * (1 + pct / 100)).toFixed(entry < 1 ? 4 : entry < 10 ? 3 : 2)} (${pct >= 0 ? "+" : ""}${pct}%)`;

  // Signal consensus table — always 8 indicators
  type SignalDir = "bull" | "bear" | "neutral";
  const agree = (bullish: boolean, bearish: boolean): SignalDir => bullish ? "bull" : bearish ? "bear" : "neutral";
  const rsiV = isBull ? rand(28, 45, 0) : isBear ? rand(65, 82, 0) : rand(46, 62, 0);
  const macdBull = isBull ? Math.random() > 0.25 : Math.random() < 0.25;
  const maBull = isBull ? Math.random() > 0.2 : Math.random() < 0.2;
  const volBull = isBull ? Math.random() > 0.3 : Math.random() < 0.3;
  const bbBull = isBull ? Math.random() > 0.3 : Math.random() < 0.3;
  const obv = isBull ? "Rising" : isBear ? "Falling" : "Flat";
  const stochV = isBull ? rand(15, 38, 0) : isBear ? rand(68, 88, 0) : rand(40, 62, 0);

  const signalConsensus = [
    { name: "RSI", value: `${rsiV}`, signal: agree(rsiV < 45, rsiV > 60) },
    { name: "MACD", value: macdBull ? "Bullish Cross" : "Bearish Cross", signal: agree(macdBull, !macdBull) },
    { name: "MA 50/200", value: maBull ? "Golden Cross" : "Death Cross", signal: agree(maBull, !maBull) },
    { name: "Volume", value: volBull ? `+${rand(30, 120, 0)}% surge` : `−${rand(10, 40, 0)}% fade`, signal: agree(volBull, !volBull) },
    { name: "Bollinger", value: bbBull ? "Lower band bounce" : "Upper band rejection", signal: agree(bbBull, !bbBull) },
    { name: "OBV", value: obv, signal: agree(obv === "Rising", obv === "Falling") },
    { name: "Stochastic", value: `${stochV}`, signal: agree(stochV < 35, stochV > 70) },
    { name: "Pattern", value: candlePattern, signal: agree(isBull, isBear) },
  ] satisfies Array<{ name: string; value: string; signal: SignalDir }>;

  if (marketType === "crypto") {
    const fundingSign = isBull ? "+" : isBear ? "-" : "";
    const fundingVal = rand(0.01, 0.08, 3);
    const dominanceDelta = isBull ? `+${rand(0.1, 1.2, 1)}%` : `-${rand(0.1, 0.9, 1)}%`;
    const oiChange = isBull ? `+${rand(5, 28, 0)}%` : `-${rand(5, 22, 0)}%`;
    const fgIndex = isBull ? Math.round(rand(55, 85, 0)) : isBear ? Math.round(rand(15, 42, 0)) : Math.round(rand(43, 57, 0));
    const fgLabel = fgIndex >= 75 ? "Extreme Greed" : fgIndex >= 55 ? "Greed" : fgIndex >= 45 ? "Neutral" : fgIndex >= 25 ? "Fear" : "Extreme Fear";
    const ma50 = `$${(entry * rand(0.88, 1.05, 3)).toFixed(entry < 1 ? 4 : 2)}`;
    const ma200 = `$${(entry * rand(0.72, 0.98, 3)).toFixed(entry < 1 ? 4 : 2)}`;
    return {
      candlePattern,
      target24h: fmt(entry, move24),
      target7d: fmt(entry, move7d),
      target30d: fmt(entry, move30d),
      signalConsensus,
      movingAvg50: ma50,
      movingAvg200: ma200,
      maCrossSignal: maBull ? `Price above both MAs — bullish structure` : `Price below MA50 — bearish pressure`,
      fundingRate: `${fundingSign}${fundingVal}% (${fundingVal > 0.05 ? "elevated longs, crowded" : "balanced positioning"})`,
      openInterestChange: `${oiChange} in 24h — ${isBull ? "new long positioning" : isBear ? "short buildup" : "flat positioning"}`,
      dominance: `BTC dominance ${dominanceDelta} — ${isBull ? "alt-season risk low" : "rotation pressure"}`,
      fearGreedIndex: fgIndex,
      fearGreedLabel: fgLabel,
    };
  }

  if (marketType === "stocks") {
    const daysToEarnings = Math.round(rand(4, 68, 0));
    const flowType = isBull ? "unusual call buying" : isBear ? "aggressive put sweeps" : "mixed flow";
    const sectorPct = isBull ? `+${rand(0.3, 2.1, 1)}%` : `-${rand(0.2, 1.8, 1)}%`;
    const ma50 = `$${(entry * rand(0.91, 1.06, 3)).toFixed(2)}`;
    const ma200 = `$${(entry * rand(0.78, 1.02, 3)).toFixed(2)}`;
    return {
      candlePattern,
      target24h: fmt(entry, move24),
      target7d: fmt(entry, move7d),
      target30d: fmt(entry, move30d),
      signalConsensus,
      movingAvg50: ma50,
      movingAvg200: ma200,
      maCrossSignal: maBull ? `Trading above 50-day MA — uptrend intact` : `Below 50-day MA — trend broken`,
      earningsDate: `~${daysToEarnings} days out — IV ${daysToEarnings < 14 ? "elevated, risk of crush" : "normal"}`,
      optionsFlow: `${flowType} detected — ${isBull ? "$" + rand(2, 18, 1) + "M net call premium" : "$" + rand(2, 12, 1) + "M net put premium"}`,
      sectorSentiment: `Sector ${sectorPct} today — ${isBull ? "outperforming" : "underperforming"} SPY`,
    };
  }

  return { candlePattern, target24h: fmt(entry, move24), target7d: fmt(entry, move7d), target30d: fmt(entry, move30d), signalConsensus };
}

function buildMockResult(
  rec: Recommendation,
  confidence: number,
  tickerInfo?: { marketType: MarketType; basePrice: number; name: string }
): AIAnalysisOutput {
  // If ticker was provided, force that market context; otherwise pick random
  let ctx = MARKET_CONTEXTS[Math.floor(Math.random() * MARKET_CONTEXTS.length)];
  if (tickerInfo) {
    const match = MARKET_CONTEXTS.find((c) => c.marketType === tickerInfo.marketType);
    if (match) ctx = match;
  }
  // Use known price for the ticker with a small realistic daily variance (±3%)
  const knownBase = tickerInfo?.basePrice;
  const basePrice = knownBase
    ? parseFloat((knownBase * (1 + rand(-3, 3) / 100)).toFixed(knownBase < 1 ? 4 : knownBase < 10 ? 3 : 2))
    : rand(18, 420, 2);
  const entry = parseFloat(randomPrice(basePrice, -1.5, 1.5));
  const exit = rec === "SELL"
    ? parseFloat(randomPrice(entry, -8, -3))
    : parseFloat(randomPrice(entry, 4, 12));
  const stop = rec === "SELL"
    ? parseFloat(randomPrice(entry, 2, 5))
    : parseFloat(randomPrice(entry, -6, -2));
  const edge = rand(3.2, 14.8);
  const impliedProb = rand(38, 68);
  const trueProb = impliedProb + rand(4, 14) * (rec === "BUY" ? 1 : rec === "SELL" ? -1 : 0);
  const volumeOptions = ["High", "Medium", "Low"] as const;
  const sentimentOptions = ["Bullish", "Bearish", "Neutral", "Mixed"] as const;

  let tickerLabel = "";
  let outcomeLabel = "";
  let oddsStr = randomOdds();

  if (tickerInfo) {
    // Use user-provided ticker info directly
    tickerLabel = tickerInfo.name;
    if (ctx.marketType === "sports_betting") {
      outcomeLabel = tickerLabel + " moneyline";
    } else if (ctx.marketType === "prediction_market") {
      outcomeLabel = tickerLabel + " YES";
      oddsStr = `$${rand(0.30, 0.78, 2)}`;
    } else {
      outcomeLabel = tickerLabel;
      oddsStr = `$${entry.toFixed(basePrice < 1 ? 4 : 2)}`;
    }
  } else if (ctx.marketType === "sports_betting") {
    tickerLabel = ctx.teams![Math.floor(Math.random() * ctx.teams!.length)];
    outcomeLabel = tickerLabel + " moneyline";
  } else if (ctx.marketType === "crypto" || ctx.marketType === "stocks") {
    tickerLabel = ctx.tickers![Math.floor(Math.random() * ctx.tickers!.length)];
    outcomeLabel = tickerLabel;
    oddsStr = `$${entry.toFixed(2)}`;
  } else {
    tickerLabel = ctx.events![Math.floor(Math.random() * ctx.events!.length)];
    outcomeLabel = tickerLabel + " YES";
    oddsStr = `$${rand(0.30, 0.78, 2)}`;
  }

  const keyFactorPool = [
    `Volume is ${rand(1.2, 3.8, 1)}x the 14-day average — unusual activity detected`,
    `Implied probability sits at ${impliedProb.toFixed(1)}% vs estimated true probability of ${trueProb.toFixed(1)}%`,
    `Historical edge on similar setups: ${rand(4, 18, 1)}% ROI over last 60 days`,
    `Market has moved ${rand(0.3, 2.8, 1)}% in the last 4 hours — momentum ${rec === "BUY" ? "building" : "fading"}`,
    `Open interest up ${rand(8, 42, 0)}% since yesterday — institutional activity likely`,
    `RSI at ${rand(28, 72, 0)} — ${rec === "BUY" ? "approaching oversold zone" : "nearing overbought territory"}`,
    `Support level at $${(entry * 0.94).toFixed(2)} has held ${Math.floor(rand(2, 7, 0))} times in last 30 days`,
    `Line moved from ${oddsStr} to current — ${rand(2, 9, 1)}% shift since open`,
    `${rand(62, 88, 0)}% of sharp money is on the ${rec === "BUY" ? "over/favorite" : "under/underdog"} side`,
    `Closing line value model projects ${edge.toFixed(1)}% edge at current price`,
    `Liquidity depth shows ${rand(1.2, 5.0, 1)}M in open bids within 1% of current price`,
    `Correlation with broader market index: ${rand(0.3, 0.85, 2)} — partially decorrelated`,
  ];

  // Shuffle and pick 4 random key factors
  const shuffled = keyFactorPool.sort(() => Math.random() - 0.5).slice(0, 4);

  const bullPct = rec === "BUY" ? rand(58, 82, 0) : rec === "SELL" ? rand(18, 40, 0) : rand(42, 58, 0);
  const bearPct = 100 - bullPct;
  const rsiVal = rec === "BUY" ? rand(28, 52, 0) : rec === "SELL" ? rand(62, 82, 0) : rand(44, 58, 0);
  const trendStr = rec === "HOLD" ? rand(3, 6, 0) : rand(6, 10, 0);
  const momentumVal = rec === "BUY" ? rand(58, 88, 0) : rec === "SELL" ? rand(12, 42, 0) : rand(40, 62, 0);
  const rrRatio = `${rand(1.8, 5.2, 1)}:1`;
  const signals3Pool = [
    "Volume confirms move", "RSI oversold bounce", "MACD bullish cross",
    "Breaking key resistance", "Smart money accumulating", "Divergence detected",
    "Pattern near complete", "News catalyst present", "Liquidity sweep done",
    "Momentum accelerating", "Trend strength rising", "Options flow bullish",
    "Support holding firm", "Underdog value play", "Line value exists",
  ];
  const sig3 = signals3Pool.sort(() => Math.random() - 0.5).slice(0, 3);
  const quickTakePool: Record<Recommendation, string[]> = {
    BUY: [
      `${tickerLabel} is deeply undervalued — smart money is quietly accumulating right now.`,
      `Classic setup on ${tickerLabel}: bulls have the edge, entry here is low-risk high-reward.`,
      `${tickerLabel} showing textbook accumulation — odds strongly favor a breakout within 48hrs.`,
    ],
    SELL: [
      `${tickerLabel} is overpriced — the market hasn't priced in the downside risk yet.`,
      `Fading ${tickerLabel} here: implied probability is way above true probability.`,
      `${tickerLabel} looks like a trap — sharp money is quietly on the other side.`,
    ],
    HOLD: [
      `${tickerLabel} is fairly priced — no edge right now, patience is the play.`,
      `Wait for a better entry on ${tickerLabel}; current price offers no margin of safety.`,
      `${tickerLabel} sitting at fair value — the edge isn't there yet, hold off.`,
    ],
  };
  const quickTake = quickTakePool[rec][Math.floor(Math.random() * 3)];
  const macdOptions = ["Bullish crossover", "Bearish crossover", "Neutral", "Divergence detected"];
  const bbOptions = ["Upper band squeeze", "Breakout above upper", "Breakdown below lower", "Mid-band consolidation"];
  const techRatings: Record<Recommendation, string> = { BUY: "Strong Buy", SELL: "Strong Sell", HOLD: "Neutral" };
  const volatilityPool = ["Low — trending steadily", "Medium — normal intraday swings", "High — elevated risk, size down", "Extreme — caution, news-driven"];

  const reasoningMap: Record<Recommendation, string> = {
    BUY: `🔒 Demo result — real AI reads your actual screenshot. Sample: ${tickerLabel} appears undervalued at current price. Implied probability of ${impliedProb.toFixed(1)}% vs estimated true probability of ${trueProb.toFixed(1)}% gives a +${edge.toFixed(1)}% edge. Volume is elevated and line movement supports the position. Upgrade to Basic or Pro for real analysis of your image.`,
    SELL: `🔒 Demo result — real AI reads your actual screenshot. Sample: ${tickerLabel} looks overpriced. Market is pricing this at ${impliedProb.toFixed(1)}% but true probability estimates ${trueProb.toFixed(1)}%. Negative expected value of -${edge.toFixed(1)}%. Fade this side. Upgrade to Basic or Pro for real analysis of your image.`,
    HOLD: `🔒 Demo result — real AI reads your actual screenshot. Sample: ${tickerLabel} is fairly priced right now with no clear edge at ${impliedProb.toFixed(1)}% implied. Wait for a better entry or a line move before committing. Upgrade to Basic or Pro for real analysis of your image.`,
  };

  return {
    recommendation: rec,
    confidence,
    marketType: ctx.marketType,
    reasoning: reasoningMap[rec],
    signals: {
      oddsValue: `Current: ${oddsStr} | Fair value est: ${rec === "BUY" ? "+" : "-"}${rand(95, 180, 0)}`,
      impliedProbability: `${impliedProb.toFixed(1)}%`,
      trueEstimatedProbability: `${trueProb.toFixed(1)}%`,
      lineMovement: `Opened at ${randomOdds()}, now ${oddsStr} — moved ${rand(0.5, 3.2, 1)}% in last 6h`,
      volumeIndicator: volumeOptions[Math.floor(Math.random() * volumeOptions.length)],
      marketSentiment: sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)],
      keyFactors: shuffled,
      undervaluedMarkets: [
        `${outcomeLabel} at ${oddsStr} — estimated ${edge.toFixed(1)}% edge vs fair value`,
        `Kelly Criterion suggests ${rand(5, 25, 0)}% position size at this edge`,
      ],
      liquidity: LIQUIDITY_POOL[Math.floor(Math.random() * LIQUIDITY_POOL.length)],
      volumeSwings: VOLUME_SWING_POOL[Math.floor(Math.random() * VOLUME_SWING_POOL.length)],
      newsImpact: [
        NEWS_POOL[Math.floor(Math.random() * NEWS_POOL.length)],
        NEWS_POOL[Math.floor(Math.random() * NEWS_POOL.length)],
        NEWS_POOL[Math.floor(Math.random() * NEWS_POOL.length)],
      ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 2), // dedupe, max 2
      quickTake,
      bullPercent: Math.round(bullPct),
      bearPercent: Math.round(bearPct),
      rsi: Math.round(rsiVal),
      macd: macdOptions[Math.floor(Math.random() * macdOptions.length)],
      bollingerBand: bbOptions[Math.floor(Math.random() * bbOptions.length)],
      trendStrength: Math.round(trendStr),
      riskReward: rrRatio,
      sharpMoney: `${rand(52, 84, 0)}% sharp money on the ${rec === "BUY" ? "bull" : "bear"} side`,
      kellySize: `${rand(4, 22, 1)}% of bankroll`,
      technicalRating: techRatings[rec],
      momentumScore: Math.round(momentumVal),
      volatility: volatilityPool[Math.floor(Math.random() * volatilityPool.length)],
      supportLevel: `$${(entry * rand(0.90, 0.96, 3)).toFixed(entry < 1 ? 4 : 2)}`,
      resistanceLevel: `$${(entry * rand(1.04, 1.12, 3)).toFixed(entry < 1 ? 4 : 2)}`,
      signals3: sig3,
      // Stocks/Crypto specific
      ...buildMarketSpecific(ctx.marketType, rec, entry, tickerLabel),
      priceTargets: [
        {
          action: rec,
          outcome: outcomeLabel,
          currentOdds: oddsStr,
          targetEntry: `$${entry.toFixed(2)}`,
          targetExit: `$${exit.toFixed(2)}`,
          stopLoss: `$${stop.toFixed(2)}`,
          edgePercent: `+${edge.toFixed(1)}%`,
          undervalued: rec === "BUY",
        },
        {
          action: "HOLD",
          outcome: `${tickerLabel} hedge position`,
          currentOdds: randomOdds(),
          targetEntry: `$${randomPrice(entry, -3, 3)}`,
          targetExit: `$${randomPrice(exit, -2, 2)}`,
          stopLoss: `$${randomPrice(stop, -2, 2)}`,
          edgePercent: `+${rand(1.0, 4.5, 1)}%`,
          undervalued: false,
        },
      ],
    },
  };
}

// Known ticker → { marketType, basePrice, name }
const TICKER_MAP: Record<string, { marketType: MarketType; basePrice: number; name: string }> = {
  // Crypto
  BTC: { marketType: "crypto", basePrice: 97500, name: "BTC/USD" },
  "BTC/USD": { marketType: "crypto", basePrice: 97500, name: "BTC/USD" },
  ETH: { marketType: "crypto", basePrice: 3800, name: "ETH/USD" },
  "ETH/USD": { marketType: "crypto", basePrice: 3800, name: "ETH/USD" },
  SOL: { marketType: "crypto", basePrice: 185, name: "SOL/USD" },
  AVAX: { marketType: "crypto", basePrice: 42, name: "AVAX/USD" },
  DOGE: { marketType: "crypto", basePrice: 0.38, name: "DOGE/USD" },
  XRP: { marketType: "crypto", basePrice: 2.45, name: "XRP/USD" },
  BNB: { marketType: "crypto", basePrice: 620, name: "BNB/USD" },
  // Stocks
  NVDA: { marketType: "stocks", basePrice: 875, name: "NVDA" },
  AAPL: { marketType: "stocks", basePrice: 228, name: "AAPL" },
  TSLA: { marketType: "stocks", basePrice: 340, name: "TSLA" },
  META: { marketType: "stocks", basePrice: 595, name: "META" },
  AMZN: { marketType: "stocks", basePrice: 218, name: "AMZN" },
  MSFT: { marketType: "stocks", basePrice: 445, name: "MSFT" },
  GOOGL: { marketType: "stocks", basePrice: 195, name: "GOOGL" },
  AMD: { marketType: "stocks", basePrice: 165, name: "AMD" },
  SPY: { marketType: "stocks", basePrice: 568, name: "SPY" },
  QQQ: { marketType: "stocks", basePrice: 490, name: "QQQ" },
  // Forex / financial
  "EUR/USD": { marketType: "financial", basePrice: 1.085, name: "EUR/USD" },
  "GBP/USD": { marketType: "financial", basePrice: 1.265, name: "GBP/USD" },
  GOLD: { marketType: "financial", basePrice: 2680, name: "Gold (XAU/USD)" },
  OIL: { marketType: "financial", basePrice: 71, name: "Crude Oil" },
};

// Sports teams → prediction market / sports betting
const SPORTS_KEYWORDS = [
  "chiefs", "bills", "eagles", "cowboys", "niners", "49ers", "patriots", "ravens",
  "lakers", "celtics", "warriors", "heat", "knicks", "bulls",
  "yankees", "dodgers", "astros", "red sox",
  "man city", "arsenal", "chelsea", "barcelona", "real madrid", "liverpool",
  "vs", " v ", "moneyline", "spread", "over/under",
];

function resolveTicker(ticker: string): { marketType: MarketType; basePrice: number; name: string } | null {
  if (!ticker) return null;
  const upper = ticker.toUpperCase();
  const lower = ticker.toLowerCase();

  // Exact match
  if (TICKER_MAP[upper]) return TICKER_MAP[upper];

  // Sports detection
  if (SPORTS_KEYWORDS.some((kw) => lower.includes(kw))) {
    return { marketType: "sports_betting", basePrice: rand(100, 250, 0), name: ticker };
  }

  // Prediction market keywords
  if (lower.includes("yes") || lower.includes("no") || lower.includes("polymarket") || lower.includes("kalshi")) {
    return { marketType: "prediction_market", basePrice: rand(0.25, 0.75, 2), name: ticker };
  }

  // Generic crypto (ends in USD, contains /)
  if (upper.includes("/USD") || upper.includes("USDT")) {
    return { marketType: "crypto", basePrice: rand(0.5, 500, 2), name: upper };
  }

  // Generic stock-like (1-5 capital letters)
  if (/^[A-Z]{1,5}$/.test(upper)) {
    return { marketType: "stocks", basePrice: rand(20, 600, 2), name: upper };
  }

  return null;
}

export async function mockAnalyzeMarketImage(ticker = ""): Promise<AIAnalysisOutput> {
  await new Promise((r) => setTimeout(r, 1400));

  const roll = Math.random();
  let rec: Recommendation;
  let confidence: number;

  if (roll < 0.38) {
    rec = "BUY";
    confidence = randomConfidence(62, 81);
  } else if (roll < 0.65) {
    rec = "SELL";
    confidence = randomConfidence(58, 77);
  } else {
    rec = "HOLD";
    confidence = randomConfidence(48, 68);
  }

  const resolved = resolveTicker(ticker);
  return buildMockResult(rec, confidence, resolved ?? undefined);
}
