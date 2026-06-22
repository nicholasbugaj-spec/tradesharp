// Fetches recent news using Google News RSS — completely free, no API key needed

export interface NewsArticle {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
}

const SEARCH_TERMS: Record<string, string> = {
  // Crypto
  BTC: "Bitcoin price crypto",
  ETH: "Ethereum price crypto",
  SOL: "Solana crypto",
  XRP: "XRP Ripple crypto",
  BNB: "BNB Binance coin",
  DOGE: "Dogecoin price",
  AVAX: "Avalanche crypto",
  MATIC: "Polygon MATIC crypto",
  LINK: "Chainlink crypto",
  ADA: "Cardano crypto",
  // Stocks
  NVDA: "NVIDIA stock earnings",
  AAPL: "Apple stock",
  TSLA: "Tesla stock",
  META: "Meta stock Facebook",
  AMZN: "Amazon stock",
  MSFT: "Microsoft stock",
  GOOGL: "Google Alphabet stock",
  AMD: "AMD stock",
  SPY: "S&P 500 market",
  QQQ: "NASDAQ tech stocks",
  NFLX: "Netflix stock",
  COIN: "Coinbase stock",
  // Financial
  GOLD: "gold price market",
  OIL: "crude oil price",
  "EUR/USD": "Euro dollar forex",
  "GBP/USD": "British pound forex",
  // NFL
  CHIEFS: "Kansas City Chiefs NFL",
  BILLS: "Buffalo Bills NFL",
  EAGLES: "Philadelphia Eagles NFL",
  COWBOYS: "Dallas Cowboys NFL",
  "49ERS": "San Francisco 49ers NFL",
  NINERS: "San Francisco 49ers NFL",
  RAVENS: "Baltimore Ravens NFL",
  PATRIOTS: "New England Patriots NFL",
  PACKERS: "Green Bay Packers NFL",
  RAMS: "Los Angeles Rams NFL",
  BENGALS: "Cincinnati Bengals NFL",
  DOLPHINS: "Miami Dolphins NFL",
  BRONCOS: "Denver Broncos NFL",
  STEELERS: "Pittsburgh Steelers NFL",
  // NBA
  LAKERS: "Los Angeles Lakers NBA",
  CELTICS: "Boston Celtics NBA",
  WARRIORS: "Golden State Warriors NBA",
  HEAT: "Miami Heat NBA",
  KNICKS: "New York Knicks NBA",
  BULLS: "Chicago Bulls NBA",
  BUCKS: "Milwaukee Bucks NBA",
  NUGGETS: "Denver Nuggets NBA",
  SUNS: "Phoenix Suns NBA",
  NETS: "Brooklyn Nets NBA",
  // MLB
  YANKEES: "New York Yankees MLB",
  DODGERS: "Los Angeles Dodgers MLB",
  ASTROS: "Houston Astros MLB",
  "RED SOX": "Boston Red Sox MLB",
  CUBS: "Chicago Cubs MLB",
  METS: "New York Mets MLB",
  // Soccer / Premier League
  "MAN CITY": "Manchester City football",
  ARSENAL: "Arsenal FC football",
  CHELSEA: "Chelsea FC football",
  LIVERPOOL: "Liverpool FC football",
  BARCELONA: "FC Barcelona football",
  "REAL MADRID": "Real Madrid football",
  // Prediction market topics
  FED: "Federal Reserve interest rate decision",
  "RATE CUT": "Federal Reserve rate cut decision",
  BITCOIN: "Bitcoin price prediction",
  ELECTION: "election prediction market",
  TRUMP: "Trump prediction market odds",
  RECESSION: "recession probability prediction",
};

// Sports/prediction market keyword detection for free-form input
const SPORTS_KEYWORDS = [
  "chiefs", "bills", "eagles", "cowboys", "49ers", "niners", "ravens", "patriots",
  "packers", "rams", "bengals", "dolphins", "broncos", "steelers",
  "lakers", "celtics", "warriors", "heat", "knicks", "bulls", "bucks", "nuggets",
  "yankees", "dodgers", "astros", "red sox", "cubs", "mets",
  "man city", "arsenal", "chelsea", "liverpool", "barcelona", "real madrid",
  "nfl", "nba", "mlb", "nhl", "premier league", "la liga",
  " vs ", " v ", "moneyline", "spread", "over/under", "prop bet",
];

const PREDICTION_KEYWORDS = [
  "polymarket", "kalshi", "predictit", "metaculus",
  "federal reserve", "fed rate", "rate cut", "rate hike",
  "election", "trump", "biden", "recession", "gdp",
  "inflation", "cpi", "jobs report", "will ", "odds of",
];

function getSearchTerm(ticker: string): string {
  const upper = ticker.toUpperCase().replace("/USDT", "").replace("/USD", "");
  const lower = ticker.toLowerCase();

  // Exact lookup first
  if (SEARCH_TERMS[upper]) return SEARCH_TERMS[upper];
  if (SEARCH_TERMS[ticker.toUpperCase()]) return SEARCH_TERMS[ticker.toUpperCase()];

  // Check for partial sports team match
  for (const kw of SPORTS_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      // For "Chiefs vs Bills" style input, search for both teams + NFL
      if (lower.includes(" vs ") || lower.includes(" v ")) {
        return `${ticker} NFL NBA game odds injury report`;
      }
      return `${ticker} injury report odds game`;
    }
  }

  // Check for prediction market keywords
  for (const kw of PREDICTION_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      return `${ticker} prediction market probability`;
    }
  }

  // Fallback: use the raw ticker as a search term
  return `${ticker} latest news`;
}

function parseRSS(xml: string): NewsArticle[] {
  const items: NewsArticle[] = [];

  // Extract all <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1] ?? "";

    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1]
      ?? "";

    const link = block.match(/<link>(.*?)<\/link>/)?.[1]
      ?? block.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1]
      ?? "";

    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";

    const sourceMatch = block.match(/<source[^>]*>(.*?)<\/source>/)?.[1]
      ?? block.match(/- (.*?)$/)?.[1]   // Google News puts "- Source Name" at end of title
      ?? "News";

    if (!title) continue;

    // Clean up title (Google News sometimes appends " - Source" at the end)
    const cleanTitle = title.replace(/ - [^-]+$/, "").trim();
    const cleanSource = title.match(/ - ([^-]+)$/)?.[1]?.trim() ?? sourceMatch;

    items.push({
      title: cleanTitle,
      source: cleanSource,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      url: link,
    });

    if (items.length >= 5) break;
  }

  return items;
}

async function fetchRSS(query: string): Promise<NewsArticle[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TradeSharp/1.0)" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    return parseRSS(await res.text());
  } catch {
    return [];
  }
}

function dedupeArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = a.title.slice(0, 60).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchNewsForTicker(ticker: string): Promise<NewsArticle[]> {
  if (!ticker?.trim()) return [];

  const lower = ticker.toLowerCase();
  const isMatchup = lower.includes(" vs ") || lower.includes(" v ");

  try {
    if (isMatchup) {
      // For "Chiefs vs Bills" — fetch both teams simultaneously
      const [team1, team2] = ticker.split(/ vs | v /i).map((t) => t.trim());
      const [results1, results2] = await Promise.all([
        fetchRSS(getSearchTerm(team1) + " injury report game"),
        fetchRSS(getSearchTerm(team2) + " injury report game"),
      ]);
      // Interleave: 3 from team1, 2 from team2
      return dedupeArticles([...results1.slice(0, 3), ...results2.slice(0, 2)]);
    }

    const query = getSearchTerm(ticker);
    const articles = await fetchRSS(query);
    return dedupeArticles(articles);
  } catch (err) {
    console.error("News fetch failed:", err);
    return [];
  }
}

export function formatNewsForPrompt(articles: NewsArticle[]): string {
  if (articles.length === 0) return "";

  const lines = articles.map((a, i) => {
    const age = Math.round((Date.now() - new Date(a.publishedAt).getTime()) / 60000);
    const ageStr = age < 60 ? `${age}m ago` : `${Math.round(age / 60)}h ago`;
    return `${i + 1}. [${a.source} • ${ageStr}] ${a.title}`;
  });

  return `## LIVE NEWS CONTEXT (last 24h — factor these into your analysis):\n${lines.join("\n")}\n\n`;
}
