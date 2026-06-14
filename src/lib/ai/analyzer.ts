import Anthropic from "@anthropic-ai/sdk";
import { AnalysisResult, MarketType, Recommendation } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type AIAnalysisOutput = Omit<AnalysisResult, "id" | "createdAt">;

const ANALYSIS_PROMPT = `You are a world-class trading analyst and professional sports bettor with deep expertise across ALL of the following market types. Analyze the uploaded screenshot and identify EXACTLY what market it shows, then apply the correct analysis framework.

## MARKET TYPE DETECTION — identify which one this is:

**sports_betting** — Sportsbooks (DraftKings, FanDuel, BetMGM, Caesars, PointsBet, Bet365, etc.)
- Look for: team names, moneylines (e.g. -110, +230), spreads (e.g. Chiefs -3.5), totals (Over/Under), player props
- Analysis: implied probability from American/decimal/fractional odds, line value, sharp vs public splits, closing line value

**prediction_market** — Polymarket, Kalshi, Metaculus, Manifold, PredictIt
- Look for: YES/NO contracts, probability percentages, cent-based pricing ($0.62 = 62%), resolution dates, event descriptions
- Analysis: base rate vs market price, information gaps, resolution criteria, expected value of YES vs NO

**crypto** — Coinbase, Binance, Kraken, Bybit, OKX, dex screener, TradingView crypto charts, crypto order books
- Look for: BTC, ETH, SOL, and other ticker symbols, candlestick charts, RSI, MACD, volume bars, support/resistance, funding rates, liquidation levels, order book depth
- Analysis: technical indicators, trend direction, support/resistance levels, volume confirmation, momentum, potential entry/exit with stop loss

**stocks** — Robinhood, Webull, TD Ameritrade, Schwab, Bloomberg, TradingView stocks, options chains
- Look for: stock tickers (AAPL, NVDA, TSLA etc.), candlestick/line charts, technical indicators, P/E ratios, options Greeks, earnings dates, price levels
- Analysis: technical setup, fundamental context if visible, options flow if present, risk/reward

**financial** — Forex, commodities, futures, indices (EUR/USD, Gold, Oil, S&P 500 futures)
- Look for: currency pairs, commodity names, futures contracts, forex charts
- Analysis: trend, key levels, macro context

**generic** — Any other betting or trading market not listed above

## OUTPUT FORMAT — return ONLY this JSON, no other text:

{
  "recommendation": "BUY" | "SELL" | "HOLD" | "NO_BET",
  "confidence": <number 0-100>,
  "marketType": "sports_betting" | "prediction_market" | "crypto" | "stocks" | "financial" | "generic",
  "reasoning": "<3-4 sentences referencing SPECIFIC names, prices, odds, and numbers visible in the image — explain exactly WHY you recommend this>",
  "signals": {
    "oddsValue": "<specific value assessment with numbers from the image>",
    "impliedProbability": "<the market-implied probability for the main bet/trade>",
    "trueEstimatedProbability": "<your estimated true probability or fair value>",
    "lineMovement": "<any movement or trend you can see, or 'Not visible'>",
    "volumeIndicator": "High" | "Medium" | "Low",
    "marketSentiment": "Bullish" | "Bearish" | "Neutral" | "Mixed",
    "keyFactors": [
      "<specific factor with actual names/numbers from image>",
      "<specific factor 2>",
      "<specific factor 3>"
    ],
    "undervaluedMarkets": [
      "<exactly which outcome/side/coin/stock is mispriced and by how much, with specific prices>"
    ],
    "priceTargets": [
      {
        "action": "BUY" | "SELL" | "HOLD",
        "outcome": "<EXACT name from image — team name, coin ticker, stock ticker, YES/NO contract name>",
        "currentOdds": "<exact price/odds from the image>",
        "targetEntry": "<specific price to enter at>",
        "targetExit": "<specific take profit price or odds>",
        "stopLoss": "<specific stop loss price or condition>",
        "edgePercent": "<your estimated edge, e.g. +9.2%>",
        "undervalued": true | false
      }
    ]
  }
}

## RULES:
- BUY = back/long this — you believe it is underpriced relative to its true probability/value
- SELL = fade/short/lay this — it is overpriced, expected value is negative
- HOLD = no clear edge at current price, wait for better entry
- NO_BET = image is too blurry/unclear to read, or no actionable market is visible
- ALWAYS use the exact names, tickers, odds, and prices you can read from the image
- For crypto/stocks: include specific price targets with % move expectations
- For sports: convert odds to implied probability and compare to your true estimate
- For prediction markets: compare contract price to your estimated resolution probability
- confidence 80-100 = very clear signal, 60-79 = moderate signal, 40-59 = weak signal, below 40 = use NO_BET
- Return ONLY the JSON object. No markdown, no explanation outside the JSON.`;

export async function analyzeMarketImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<AIAnalysisOutput> {
  const base64Image = imageBuffer.toString("base64");

  // Validate mime type for Anthropic API
  const validMediaTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
  type ValidMediaType = typeof validMediaTypes[number];
  const mediaType: ValidMediaType = validMediaTypes.includes(mimeType as ValidMediaType)
    ? (mimeType as ValidMediaType)
    : "image/jpeg";

  const message = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 1024,
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
            text: ANALYSIS_PROMPT,
          },
        ],
      },
    ],
  });

  const responseText = (message.content[0] as { text: string }).text.trim();

  // Extract JSON from response (Claude sometimes wraps in ```json blocks)
  const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                    responseText.match(/({[\s\S]*})/);
  const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;

  let parsed: AIAnalysisOutput;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    // If parsing fails, return a safe NO_BET result
    return {
      recommendation: "NO_BET",
      confidence: 0,
      marketType: "generic",
      reasoning: "Could not parse the image. Please upload a clear screenshot of a sportsbook, prediction market, crypto chart, stock chart, or any trading platform with visible prices.",
      signals: {
        oddsValue: "Unable to extract",
        impliedProbability: "N/A",
        trueEstimatedProbability: "N/A",
        lineMovement: "N/A",
        volumeIndicator: "Low",
        marketSentiment: "Neutral",
        keyFactors: ["Image could not be analyzed"],
        undervaluedMarkets: [],
        priceTargets: [],
      },
    };
  }

  // Ensure required fields exist with safe defaults
  return {
    recommendation: (["BUY", "SELL", "HOLD", "NO_BET"].includes(parsed.recommendation)
      ? parsed.recommendation
      : "NO_BET") as Recommendation,
    confidence: typeof parsed.confidence === "number"
      ? Math.min(100, Math.max(0, parsed.confidence))
      : 50,
    marketType: (["sports_betting", "prediction_market", "crypto", "stocks", "financial", "generic"].includes(parsed.marketType)
      ? parsed.marketType
      : "generic") as MarketType,
    reasoning: parsed.reasoning ?? "Analysis complete.",
    signals: {
      oddsValue: parsed.signals?.oddsValue ?? "",
      impliedProbability: parsed.signals?.impliedProbability ?? "",
      trueEstimatedProbability: parsed.signals?.trueEstimatedProbability ?? "",
      lineMovement: parsed.signals?.lineMovement ?? "",
      volumeIndicator: parsed.signals?.volumeIndicator ?? "Medium",
      marketSentiment: parsed.signals?.marketSentiment ?? "Neutral",
      keyFactors: parsed.signals?.keyFactors ?? [],
      undervaluedMarkets: parsed.signals?.undervaluedMarkets ?? [],
      priceTargets: parsed.signals?.priceTargets ?? [],
    },
  };
}
