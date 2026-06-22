// Free price fetching — CoinGecko for crypto, Yahoo Finance for stocks

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", XRP: "ripple",
  BNB: "binancecoin", DOGE: "dogecoin", AVAX: "avalanche-2",
  MATIC: "matic-network", LINK: "chainlink", ADA: "cardano",
};

async function getCryptoPrice(ticker: string): Promise<number | null> {
  const id = COINGECKO_IDS[ticker.toUpperCase()];
  if (!id) return null;
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json() as Record<string, { usd: number }>;
    return data[id]?.usd ?? null;
  } catch { return null; }
}

async function getStockPrice(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json() as {
      chart?: { result?: Array<{ meta?: { regularMarketPrice?: number } }> };
    };
    return data.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
  } catch { return null; }
}

export async function getCurrentPrice(ticker: string): Promise<number | null> {
  const upper = ticker.toUpperCase().replace("/USD", "").replace("/USDT", "");
  const cryptoPrice = await getCryptoPrice(upper);
  if (cryptoPrice !== null) return cryptoPrice;
  return getStockPrice(upper);
}
