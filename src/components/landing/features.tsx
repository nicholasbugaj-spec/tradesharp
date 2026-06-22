import {
  Upload, Brain, BarChart3, ShieldCheck, Zap, History,
  MessageSquare, TrendingUp, Bell, Target, Newspaper, Activity,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const features = [
  {
    icon: Brain,
    title: "Claude AI Vision",
    description: "Powered by Anthropic's Claude — reads charts, odds, and market data from any screenshot with precision.",
    color: "text-primary", bg: "bg-primary/10",
  },
  {
    icon: BarChart3,
    title: "8 Technical Indicators",
    description: "RSI, MACD, Bollinger Bands, Moving Averages, Stochastic, OBV, Trend Strength, and Momentum — all in one scan.",
    color: "text-accent", bg: "bg-accent/10",
  },
  {
    icon: Activity,
    title: "Bulls vs Bears Meter",
    description: "See exactly how many signals point bullish vs bearish. Instant visual consensus across all indicators.",
    color: "text-green-400", bg: "bg-green-500/10",
  },
  {
    icon: TrendingUp,
    title: "Multi-Timeframe Targets",
    description: "Get 24-hour, 7-day, and 30-day price targets with support and resistance levels automatically identified.",
    color: "text-yellow-400", bg: "bg-yellow-500/10",
  },
  {
    icon: Newspaper,
    title: "Live News Context",
    description: "Free Google News RSS integration injects real-time headlines into every analysis — no API key needed.",
    color: "text-orange-400", bg: "bg-orange-500/10",
  },
  {
    icon: MessageSquare,
    title: "AI Follow-Up Chat",
    description: "Pro users can ask Claude follow-up questions about any scan. Position sizing, risk scenarios, timing — all answered.",
    color: "text-purple-400", bg: "bg-purple-500/10",
  },
  {
    icon: Bell,
    title: "Price Alerts",
    description: "Set price alerts on any crypto or stock. Get emailed the moment your target is hit — checked every 15 minutes.",
    color: "text-cyan-400", bg: "bg-cyan-500/10",
  },
  {
    icon: Target,
    title: "Signal Consensus",
    description: "8-indicator agreement table shows exactly which signals align — no guesswork, just clear directional bias.",
    color: "text-red-400", bg: "bg-red-500/10",
  },
  {
    icon: History,
    title: "Scan History & Favorites",
    description: "Every scan saved with image thumbnails. Star your best analyses, filter by outcome, and export to PDF.",
    color: "text-primary", bg: "bg-primary/10",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload a Screenshot",
    description: "Take a screenshot of any chart, betting line, prediction market, or trading platform and drop it in.",
    detail: "Works with TradingView, DraftKings, Polymarket, Coinbase, Robinhood, and more.",
  },
  {
    step: "02",
    title: "Type the Ticker (Optional)",
    description: "Add the ticker or team name for more accurate, context-aware analysis with live news injected automatically.",
    detail: "BTC, NVDA, Chiefs vs Bills, Fed rate cut — any asset or event.",
  },
  {
    step: "03",
    title: "Get Your Full Analysis",
    description: "Receive a BUY/SELL/HOLD signal with confidence score, 8 indicators, price targets, and real-time news impact.",
    detail: "Results in under 10 seconds. Pro users can chat with the AI for follow-ups.",
  },
];

export function Features() {
  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Features grid header */}
        <ScrollReveal variant="up" className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-4xl font-bold text-text-primary mb-4">
            Everything a serious trader needs,{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              built in
            </span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            One upload. Instant access to institutional-grade indicators, live news, price alerts, and AI chat.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} variant="up" delay={i * 60}>
              <div
                className="group p-5 rounded-xl bg-surface border border-border hover:border-border-light hover:bg-surface-2 transition-all duration-200 glow-card h-full">
                <div className={`inline-flex p-2.5 rounded-xl ${f.bg} mb-3 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1.5">{f.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{f.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Market type showcase */}
        <div className="mt-24">
          <ScrollReveal variant="up" className="text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Multi-Market</p>
            <h2 className="text-3xl font-bold text-text-primary mb-4">One tool. Every market.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                emoji: "₿", title: "Crypto", color: "border-yellow-500/30 bg-yellow-500/5",
                items: ["Funding rate", "Fear & Greed index", "Open interest", "BTC dominance", "On-chain signals"],
              },
              {
                emoji: "📈", title: "Stocks", color: "border-green-500/30 bg-green-500/5",
                items: ["Options flow", "Earnings date", "Sector performance", "Institutional activity", "MA crossovers"],
              },
              {
                emoji: "⚽", title: "Sports Betting", color: "border-blue-500/30 bg-blue-500/5",
                items: ["Sharp money %", "Line movement", "Implied probability", "True probability", "Closing line value"],
              },
              {
                emoji: "🔮", title: "Prediction Markets", color: "border-purple-500/30 bg-purple-500/5",
                items: ["Base rate analysis", "Resolution criteria", "Time decay", "Correlated contracts", "Arbitrage opportunities"],
              },
            ].map((m, i) => (
              <ScrollReveal key={m.title} variant="scale" delay={i * 80}>
                <div className={`p-4 rounded-xl border ${m.color} glow-card h-full`}>
                  <div className="text-2xl mb-2">{m.emoji}</div>
                  <h3 className="text-sm font-bold text-text-primary mb-3">{m.title}</h3>
                  <ul className="space-y-1.5">
                    {m.items.map(item => (
                      <li key={item} className="text-xs text-text-secondary flex items-center gap-1.5">
                        <span className="text-primary">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24">
          <ScrollReveal variant="up" className="text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl font-bold text-text-primary">Three steps to sharper trades</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-primary/20 via-accent/40 to-primary/20" />
            {HOW_IT_WORKS.map((item, i) => (
              <ScrollReveal key={item.step} variant="up" delay={i * 120} className="text-center relative">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 mb-5 text-3xl font-black text-primary animate-pulse-slow">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-2 max-w-xs mx-auto">{item.description}</p>
                <p className="text-xs text-muted max-w-xs mx-auto">{item.detail}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
}
