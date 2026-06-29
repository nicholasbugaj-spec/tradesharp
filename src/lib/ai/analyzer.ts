import Anthropic from "@anthropic-ai/sdk";
import { AnalysisResult, MarketType, Recommendation } from "@/types";
import { fetchNewsForTicker, formatNewsForPrompt } from "./fetch-news";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type AIAnalysisOutput = Omit<AnalysisResult, "id" | "createdAt">;

const SYSTEM_PROMPT = `You are an elite quantitative trading analyst and professional sports bettor with 20+ years of experience managing a $50M book. You have deep expertise in:
- Sports betting: line shopping, sharp vs public money, closing line value, injury/weather impact
- Prediction markets: Polymarket, Kalshi, base rate analysis, resolution criteria
- Crypto: technical analysis, on-chain metrics, funding rates, liquidation levels, market structure
- Stocks/Options: technical setups, earnings plays, options flow, sector rotation, macro context
- Forex/Commodities: macro drivers, central bank policy, correlations, seasonality
- Chart pattern recognition: you can identify and trade ALL major patterns with precision

## CHART PATTERN MASTERY — WHAT EACH PATTERN PREDICTS:

**BULLISH CONTINUATION** (price likely continues UP):
- Bull Flag: tight consolidation after sharp move up → breakout targets the flagpole height added to breakout point
- Ascending Triangle: flat resistance + rising lows → breakout UP, target = triangle height added to breakout
- Cup and Handle: U-shaped base + small dip → breakout UP, target = cup depth added to breakout
- Bullish Pennant: sharp move + converging consolidation → continuation UP
- Rising Channel: price bouncing between parallel uptrend lines → stay long until lower trendline breaks
- Inverse Head and Shoulders: three bottoms (middle lowest) → reversal UP, target = head-to-neckline distance

**BEARISH CONTINUATION** (price likely continues DOWN):
- Bear Flag: tight consolidation after sharp drop → breakdown continues DOWN
- Descending Triangle: flat support + falling highs → breakdown DOWN
- Bearish Pennant: sharp drop + converging consolidation → continuation DOWN
- Falling Channel: bouncing between parallel downtrend lines → stay short until upper trendline breaks
- Head and Shoulders: three peaks (middle highest) → reversal DOWN, target = head-to-neckline distance

**REVERSAL PATTERNS** (trend about to CHANGE direction):
- Double Top: two peaks at same level → bearish reversal DOWN, target = distance from peaks to trough
- Double Bottom: two troughs at same level → bullish reversal UP, target = distance from troughs to peak
- Triple Top/Bottom: three touches of same level → strong reversal signal
- Wedge (Rising): converging upward lines → bearish reversal DOWN despite upward slope
- Wedge (Falling): converging downward lines → bullish reversal UP despite downward slope

**CANDLESTICK PATTERNS** (short-term signals):
- Hammer/Pin Bar: long lower wick → bullish reversal, buyers rejected lower prices
- Shooting Star: long upper wick at top → bearish reversal, sellers rejected higher prices
- Doji: open ≈ close → indecision, watch for next candle direction
- Bullish Engulfing: large green candle engulfs prior red → strong bullish reversal
- Bearish Engulfing: large red candle engulfs prior green → strong bearish reversal
- Morning Star: red → doji → green at bottom → bullish reversal
- Evening Star: green → doji → red at top → bearish reversal
- Three White Soldiers: three consecutive green candles → strong bullish momentum
- Three Black Crows: three consecutive red candles → strong bearish momentum

## CHAIN OF THOUGHT REQUIREMENT:
Before giving your final recommendation, you MUST internally reason through ALL of these in sequence:
1. What pattern do I see? (name it exactly)
2. What does this pattern historically predict? (direction + target)
3. Is volume confirming the pattern? (volume should increase on breakouts)
4. Are indicators aligned? (RSI, MACD, BB confirming or diverging?)
5. Is the pattern at a KEY level? (support/resistance confluence = stronger signal)
6. What is the risk/reward if I'm right vs wrong?
7. Only THEN give the final recommendation

## CONFIDENCE CALIBRATION (be strict):
- 90-100%: Textbook pattern + volume confirmation + indicator confluence + key level + news catalyst all aligned. RARE.
- 75-89%: Clear pattern + 3+ confirming signals. Strong edge.
- 60-74%: Decent setup but 1-2 conflicting signals. Moderate edge.
- 45-59%: Mixed signals, unclear pattern, or choppy price action. Small edge only.
- Below 45%: Conflicting signals or unclear image → HOLD, wait for clarity.
NEVER give 85%+ unless multiple factors truly align. Overconfidence destroys traders.

Your job is to analyze the provided screenshot with surgical precision. Be specific, use exact numbers from the image, and provide actionable intelligence. Your analysis will be used by real traders making real decisions — accuracy and pattern recognition matter above all.`;

const buildPrompt = (ticker?: string, newsContext?: string) => `${
  ticker ? `## USER-PROVIDED ASSET: "${ticker}"\nFocus your analysis on this specific asset. Use this to disambiguate if the screenshot shows multiple markets.\n\n` : ""
}${newsContext || ""}
## STEP 1 — IDENTIFY THE MARKET TYPE:
Examine the screenshot carefully. Which of these does it show?

**sports_betting** — DraftKings, FanDuel, BetMGM, Caesars, PointsBet, Bet365, etc.
- Identify: team names, sport, game time, moneylines (e.g. -110), spreads (e.g. -3.5), totals (O/U), player props, parlays
- Key analysis: implied probability from odds, line value vs true probability, sharp action indicators, injury/weather if relevant

**prediction_market** — Polymarket, Kalshi, Metaculus, Manifold, PredictIt
- Identify: YES/NO contracts, % probability, resolution date/criteria, event description, current price
- Key analysis: true base rate vs market price, resolution ambiguity risk, time decay, correlated contracts

**crypto** — Coinbase, Binance, Kraken, Bybit, OKX, TradingView (crypto), DEX screener, order books
- Identify: ticker/pair, timeframe, candle pattern, RSI/MACD/BB values, volume profile, funding rate, liquidation levels, support/resistance
- Key analysis: trend structure, indicator confluence, volume confirmation, key levels, momentum, entry/exit with invalidation

**stocks** — Robinhood, Webull, TD Ameritrade, Schwab, Bloomberg, TradingView (equities), options chains
- Identify: ticker, price, chart pattern, indicators, options Greeks if present, earnings date, price levels
- Key analysis: technical setup quality, catalyst risk, options flow implications, risk/reward ratio

**financial** — Forex, commodities, futures, indices (EUR/USD, Gold, Crude Oil, ES futures)
- Identify: pair/asset, timeframe, trend, key levels, macro context visible
- Key analysis: trend direction, key S/R levels, macro catalyst alignment

**generic** — Anything else

## STEP 2 — DEEP ANALYSIS (chain of thought):
Work through the 7-step chain of thought from your system instructions:
1. Name the exact chart pattern visible (or "No clear pattern")
2. State what that pattern predicts (direction + measured move target)
3. Confirm or deny with volume
4. Check indicator alignment (RSI, MACD, BB)
5. Note any key S/R confluence
6. Calculate risk/reward
7. Give final recommendation

Apply the correct market framework. Reference EXACT numbers, names, prices, and odds visible in the image. If news context was provided above, explicitly incorporate it into your reasoning.

## STEP 3 — OUTPUT FORMAT:
Return ONLY this JSON object, no markdown, no text outside the JSON:

{
  "recommendation": "BUY" | "SELL" | "HOLD",
  "confidence": <integer 0-100>,
  "marketType": "sports_betting" | "prediction_market" | "crypto" | "stocks" | "financial" | "generic",
  "reasoning": "<5-6 sentences. Sentence 1: Identify the EXACT chart pattern by name and what it predicts (e.g. 'This is a textbook bull flag following a sharp move from $X to $Y — pattern projects a measured move target of $Z'). Sentence 2: Confirm or challenge with volume and indicators. Sentence 3: Key levels — where the pattern breaks down (invalidation) vs confirms (entry trigger). Sentence 4: Risk/reward assessment. Sentence 5: News catalyst impact if relevant. Be specific — a trader should be able to act on this immediately.>",
  "signals": {
    "oddsValue": "<exact current price/odds from image and your fair value assessment with numbers>",
    "impliedProbability": "<market-implied probability, calculated precisely from odds/price>",
    "trueEstimatedProbability": "<your estimated true probability based on analysis and any news context>",
    "lineMovement": "<any price movement visible, or infer from chart trend if applicable>",
    "volumeIndicator": "High" | "Medium" | "Low",
    "marketSentiment": "Bullish" | "Bearish" | "Neutral" | "Mixed",
    "keyFactors": [
      "<factor 1 with specific numbers/names from image or news>",
      "<factor 2>",
      "<factor 3>",
      "<factor 4 — news-driven catalyst if applicable>"
    ],
    "quickTake": "<ONE punchy sentence a trader would screenshot and share. E.g. 'BTC showing textbook accumulation — odds strongly favor a breakout within 48hrs.' Max 20 words.>",
    "bullPercent": <integer 0-100, % of signals pointing bullish>,
    "bearPercent": <integer 0-100, must sum to 100 with bullPercent>,
    "rsi": <integer 0-100, estimated or visible RSI value, or reasonable inference>,
    "macd": "<Bullish crossover | Bearish crossover | Neutral | Divergence detected>",
    "bollingerBand": "<Upper band squeeze | Breakout above upper | Breakdown below lower | Mid-band consolidation | Neutral>",
    "trendStrength": <integer 1-10, 10 = strongest trend>,
    "riskReward": "<ratio e.g. '2.8:1' or '4.1:1'>",
    "sharpMoney": "<% and direction e.g. '74% sharp on OVER' or 'Institutional accumulation detected'>",
    "kellySize": "<Kelly Criterion suggested position size e.g. '8.4% of bankroll'>",
    "technicalRating": "<Strong Buy | Buy | Neutral | Sell | Strong Sell>",
    "momentumScore": <integer 0-100>,
    "volatility": "<Low | Medium | High | Extreme — with 1-sentence context>",
    "supportLevel": "<key support price level>",
    "resistanceLevel": "<key resistance price level>",
    "signals3": [
      "<3-word signal summary>",
      "<3-word signal summary>",
      "<3-word signal summary>"
    ],
    "candlePattern": "<most prominent candlestick pattern visible e.g. 'Bullish Engulfing', 'Doji', 'Hammer', or 'None visible'>",
    "chartPattern": "<primary chart pattern identified e.g. 'Bull Flag', 'Head and Shoulders', 'Double Bottom', 'Ascending Triangle', or 'No clear pattern'>",
    "chartPatternSignal": "bullish" | "bearish" | "neutral",
    "chartPatternTarget": "<measured move price target from the pattern e.g. '$195.50 based on flagpole height' or 'N/A'>",
    "chartPatternInvalidation": "<price level where the pattern is broken/invalidated e.g. 'Below $182.00 invalidates the bull flag' or 'N/A'>",
    "patternMaturity": "<how developed the pattern is e.g. 'Early stage — 60% formed', 'Mature — breakout imminent', 'Post-breakout — in measured move'>",
    "movingAvg50": "<50-day MA price if visible or inferable, e.g. '$187.40'>",
    "movingAvg200": "<200-day MA price if visible, e.g. '$162.80'>",
    "maCrossSignal": "<e.g. 'Golden Cross — price above both MAs' or 'Death Cross forming' or 'N/A'>",
    "target24h": "<price target in 24h with % change e.g. '$192.50 (+2.8%)'>",
    "target7d": "<price target in 7 days with % e.g. '$198.00 (+5.6%)'>",
    "target30d": "<price target in 30 days with % e.g. '$215.00 (+14.5%)'>",
    "signalConsensus": [
      { "name": "RSI", "value": "<value>", "signal": "bull" | "bear" | "neutral" },
      { "name": "MACD", "value": "<status>", "signal": "bull" | "bear" | "neutral" },
      { "name": "MA 50/200", "value": "<status>", "signal": "bull" | "bear" | "neutral" },
      { "name": "Volume", "value": "<status>", "signal": "bull" | "bear" | "neutral" },
      { "name": "Bollinger", "value": "<status>", "signal": "bull" | "bear" | "neutral" },
      { "name": "Candle", "value": "<candlePattern>", "signal": "bull" | "bear" | "neutral" },
      { "name": "Chart Pattern", "value": "<chartPattern>", "signal": "bull" | "bear" | "neutral" },
      { "name": "Momentum", "value": "<momentumScore>/100", "signal": "bull" | "bear" | "neutral" }
    ],
    "fundingRate": "<crypto only: e.g. '+0.045% (longs crowded)' or 'N/A'>",
    "openInterestChange": "<crypto only: e.g. '+18% in 24h — new long positioning' or 'N/A'>",
    "dominance": "<crypto only: BTC dominance trend if relevant, or 'N/A'>",
    "fearGreedIndex": <crypto only: integer 0-100 based on current market conditions, or null>,
    "fearGreedLabel": "<crypto only: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed' or 'N/A'>",
    "earningsDate": "<stocks only: e.g. '~12 days out — IV elevated' or 'N/A'>",
    "optionsFlow": "<stocks only: e.g. 'Unusual call sweeps — $8M net premium' or 'N/A'>",
    "sectorSentiment": "<stocks only: sector performance context e.g. 'Tech sector +1.4% today — outperforming SPY' or 'N/A'>",
    "undervaluedMarkets": [
      "<specific outcome/side/asset that is mispriced, with exact current price and your fair value>"
    ],
    "liquidity": "<order book depth, spread, slippage risk, any visible institutional activity>",
    "volumeSwings": "<volume vs recent average, any unusual activity, what it implies for direction>",
    "newsImpact": [
      "<most impactful recent news headline and how it affects this trade>",
      "<second news item if relevant>"
    ],
    "priceTargets": [
      {
        "action": "BUY" | "SELL" | "HOLD",
        "outcome": "<exact asset/team/contract name from image>",
        "currentOdds": "<exact current price from image>",
        "targetEntry": "<optimal entry price with rationale>",
        "targetExit": "<take profit level with % gain>",
        "stopLoss": "<stop loss level — where the thesis is invalidated>",
        "edgePercent": "<estimated edge as percentage, e.g. +8.4%>",
        "undervalued": true | false
      }
    ]
  }
}

## RULES:
- BUY/LONG: asset is underpriced, positive expected value, back this side
- SELL/SHORT: asset is overpriced, negative expected value, fade this side
- HOLD: no strong edge, mixed signals, or unclear pattern — wait for better setup
- CHART PATTERNS ARE PRIMARY SIGNALS: if you identify a clear pattern, the recommendation MUST align with what that pattern predicts unless contradicted by 3+ other strong signals
- Pattern + volume confirmation = high confidence. Pattern without volume = reduce confidence by 15 points
- ALWAYS name the exact chart pattern — never say "the chart shows a pattern" without naming it
- ALWAYS reference exact prices, levels, and values from the image
- Price targets must use the pattern's measured move calculation, not arbitrary numbers
- If news was provided, explicitly state how it affects your recommendation
- Use the strict confidence calibration from your system instructions — do not inflate confidence
- ALWAYS return BUY, SELL, or HOLD. If image is unclear, return HOLD with low confidence.
- Return ONLY the JSON. No text before or after.`;

const FALLBACK_RESULT: AIAnalysisOutput = {
  recommendation: "HOLD",
  confidence: 30,
  marketType: "generic",
  reasoning: "Could not fully parse the image. Defaulting to HOLD — upload a clear screenshot of a sportsbook, prediction market, crypto chart, or stock chart for a full analysis.",
  signals: {
    oddsValue: "Unable to extract",
    impliedProbability: "N/A",
    trueEstimatedProbability: "N/A",
    lineMovement: "N/A",
    volumeIndicator: "Low",
    marketSentiment: "Neutral",
    keyFactors: ["Image could not be analyzed — try a clearer screenshot"],
    undervaluedMarkets: [],
    priceTargets: [],
    liquidity: "",
    volumeSwings: "",
    newsImpact: [],
  },
};

export async function analyzeMarketImage(
  imageBuffer: Buffer,
  mimeType: string,
  ticker?: string
): Promise<AIAnalysisOutput> {
  const base64Image = imageBuffer.toString("base64");

  const validMediaTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
  type ValidMediaType = typeof validMediaTypes[number];
  const mediaType: ValidMediaType = validMediaTypes.includes(mimeType as ValidMediaType)
    ? (mimeType as ValidMediaType)
    : "image/jpeg";

  // Fetch live news for paid plans (runs in parallel, doesn't block if it fails)
  let newsContext = "";
  if (ticker) {
    try {
      const articles = await fetchNewsForTicker(ticker);
      newsContext = formatNewsForPrompt(articles);
    } catch {
      // News fetch failure should never break the analysis
    }
  }

  let message;
  try {
    message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: buildPrompt(ticker, newsContext),
            },
          ],
        },
      ],
    });
  } catch (err) {
    console.error("Anthropic API error:", err);
    return { ...FALLBACK_RESULT, reasoning: "AI service error. Please try again in a moment." };
  }

  const firstContent = message.content?.[0];
  if (!firstContent || firstContent.type !== "text") {
    return FALLBACK_RESULT;
  }

  const responseText = firstContent.text.trim();

  // Strip any markdown code fences Claude might add
  const jsonMatch =
    responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
    responseText.match(/```\s*([\s\S]*?)\s*```/) ||
    responseText.match(/(\{[\s\S]*\})/);
  const jsonText = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : responseText;

  let parsed: AIAnalysisOutput;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    console.error("JSON parse failed. Raw response:", responseText.slice(0, 500));
    return FALLBACK_RESULT;
  }

  const validRecs = ["BUY", "SELL", "HOLD"];
  const validMarkets = ["sports_betting", "prediction_market", "crypto", "stocks", "financial", "generic"];

  return {
    recommendation: (validRecs.includes(parsed.recommendation)
      ? parsed.recommendation
      : "HOLD") as Recommendation,
    confidence: typeof parsed.confidence === "number"
      ? Math.min(100, Math.max(0, Math.round(parsed.confidence)))
      : 50,
    marketType: (validMarkets.includes(parsed.marketType)
      ? parsed.marketType
      : "generic") as MarketType,
    reasoning: parsed.reasoning ?? "Analysis complete.",
    signals: {
      oddsValue:                 parsed.signals?.oddsValue ?? "",
      impliedProbability:        parsed.signals?.impliedProbability ?? "",
      trueEstimatedProbability:  parsed.signals?.trueEstimatedProbability ?? "",
      lineMovement:              parsed.signals?.lineMovement ?? "",
      volumeIndicator:           parsed.signals?.volumeIndicator ?? "Medium",
      marketSentiment:           parsed.signals?.marketSentiment ?? "Neutral",
      keyFactors:                parsed.signals?.keyFactors ?? [],
      undervaluedMarkets:        parsed.signals?.undervaluedMarkets ?? [],
      priceTargets:              parsed.signals?.priceTargets ?? [],
      liquidity:                 parsed.signals?.liquidity ?? "",
      volumeSwings:              parsed.signals?.volumeSwings ?? "",
      newsImpact:                parsed.signals?.newsImpact ?? [],
      quickTake:                 parsed.signals?.quickTake ?? "",
      bullPercent:               typeof parsed.signals?.bullPercent === "number" ? parsed.signals.bullPercent : 50,
      bearPercent:               typeof parsed.signals?.bearPercent === "number" ? parsed.signals.bearPercent : 50,
      rsi:                       typeof parsed.signals?.rsi === "number" ? parsed.signals.rsi : undefined,
      macd:                      parsed.signals?.macd ?? "",
      bollingerBand:             parsed.signals?.bollingerBand ?? "",
      trendStrength:             typeof parsed.signals?.trendStrength === "number" ? parsed.signals.trendStrength : 5,
      riskReward:                parsed.signals?.riskReward ?? "",
      sharpMoney:                parsed.signals?.sharpMoney ?? "",
      kellySize:                 parsed.signals?.kellySize ?? "",
      technicalRating:           parsed.signals?.technicalRating ?? "",
      momentumScore:             typeof parsed.signals?.momentumScore === "number" ? parsed.signals.momentumScore : 50,
      volatility:                parsed.signals?.volatility ?? "",
      supportLevel:              parsed.signals?.supportLevel ?? "",
      resistanceLevel:           parsed.signals?.resistanceLevel ?? "",
      signals3:                  parsed.signals?.signals3 ?? [],
      movingAvg50:               parsed.signals?.movingAvg50 ?? "",
      movingAvg200:              parsed.signals?.movingAvg200 ?? "",
      maCrossSignal:             parsed.signals?.maCrossSignal ?? "",
      candlePattern:             parsed.signals?.candlePattern ?? "",
      chartPattern:              parsed.signals?.chartPattern ?? "",
      chartPatternSignal:        parsed.signals?.chartPatternSignal ?? "neutral",
      chartPatternTarget:        parsed.signals?.chartPatternTarget ?? "",
      chartPatternInvalidation:  parsed.signals?.chartPatternInvalidation ?? "",
      patternMaturity:           parsed.signals?.patternMaturity ?? "",
      sectorSentiment:           parsed.signals?.sectorSentiment ?? "",
      fearGreedIndex:            typeof parsed.signals?.fearGreedIndex === "number" ? parsed.signals.fearGreedIndex : undefined,
      fearGreedLabel:            parsed.signals?.fearGreedLabel ?? "",
      fundingRate:               parsed.signals?.fundingRate ?? "",
      openInterestChange:        parsed.signals?.openInterestChange ?? "",
      dominance:                 parsed.signals?.dominance ?? "",
      earningsDate:              parsed.signals?.earningsDate ?? "",
      optionsFlow:               parsed.signals?.optionsFlow ?? "",
      target24h:                 parsed.signals?.target24h ?? "",
      target7d:                  parsed.signals?.target7d ?? "",
      target30d:                 parsed.signals?.target30d ?? "",
      signalConsensus:           Array.isArray(parsed.signals?.signalConsensus) ? parsed.signals.signalConsensus : [],
    },
  };
}
