"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "Marcus T.",
    handle: "@marcust_trades",
    role: "Crypto day trader · 4 yrs",
    avatar: "MT",
    avatarColor: "from-yellow-500 to-orange-500",
    stars: 5,
    badge: "Verified Pro",
    quote:
      "I've tried TradingView's AI summaries, ChatGPT with chart screenshots, and paid Discord groups charging $150/month. TradeSharp's signal accuracy crushes all of them. The Bulls vs Bears meter alone saves me 45 mins of research per trade. Genuinely shocked this is this cheap.",
    highlight: "signal accuracy crushes all of them",
  },
  {
    name: "Priya S.",
    handle: "@priyatrades",
    role: "Options trader · 6 yrs",
    avatar: "PS",
    avatarColor: "from-purple-500 to-pink-500",
    stars: 5,
    badge: "Verified Pro",
    quote:
      "The RSI + MACD combo flagged a NVDA overextension at exactly the right time. I was about to buy calls — TradeSharp said SELL with 81% confidence and explained the bearish divergence clearly. I held off. NVDA dropped 8% the next day. This paid for itself 100x over.",
    highlight: "NVDA dropped 8% the next day",
  },
  {
    name: "Jake R.",
    handle: "@jakebeats_the_spread",
    role: "Sports bettor · 3 yrs",
    avatar: "JR",
    avatarColor: "from-blue-500 to-cyan-500",
    stars: 5,
    badge: "Verified Basic",
    quote:
      "Every sports betting app I've tried gives you the same public data everyone else has. TradeSharp actually analyzes the line movement, sharp money percentage, and reverse line movement together. It's like having a professional handicapper in your pocket for $5/month instead of $200.",
    highlight: "like having a professional handicapper in your pocket",
  },
  {
    name: "Devon W.",
    handle: "@devonwcrypto",
    role: "Crypto swing trader · 5 yrs",
    avatar: "DW",
    avatarColor: "from-green-500 to-emerald-500",
    stars: 5,
    badge: "Verified Pro",
    quote:
      "The multi-timeframe price targets are eerily accurate. 24h target hit within 0.8% on 6 out of my last 8 BTC trades. I've paid for Bloomberg Terminal access before — this gives me more actionable intelligence for 1/100th the cost. Premium advice without the premium price is real.",
    highlight: "24h target hit within 0.8% on 6 out of my last 8 trades",
  },
  {
    name: "Rachel M.",
    handle: "@rachelm_invests",
    role: "Stock investor · 2 yrs",
    avatar: "RM",
    avatarColor: "from-red-500 to-pink-500",
    stars: 5,
    badge: "Verified Basic",
    quote:
      "I'm not a professional trader, just someone trying to make smarter decisions. I used to spend hours watching YouTube videos and reading Reddit. Now I upload a screenshot and get a cleaner, more structured analysis in 10 seconds than anything I was finding on my own. Total game changer.",
    highlight: "cleaner analysis in 10 seconds than anything I found on my own",
  },
  {
    name: "Tyler B.",
    handle: "@tbets_sharp",
    role: "Prediction markets trader · 1 yr",
    avatar: "TB",
    avatarColor: "from-indigo-500 to-violet-500",
    stars: 5,
    badge: "Verified Pro",
    quote:
      "I trade Polymarket and Kalshi almost exclusively. Most tools aren't even built for prediction markets. TradeSharp handles them natively — base rate analysis, time decay, correlated contracts. The AI chat is insane too. I asked about a Fed rate cut contract and got better reasoning than any Substack I pay for.",
    highlight: "better reasoning than any Substack I pay for",
  },
  {
    name: "Chris K.",
    handle: "@chris_k_trades",
    role: "Day trader · 7 yrs",
    avatar: "CK",
    avatarColor: "from-amber-500 to-yellow-500",
    stars: 5,
    badge: "Verified Pro",
    quote:
      "Been trading for 7 years and I'm genuinely impressed. The signal consensus table showing 8 indicators agreeing or disagreeing is something I used to build manually in a spreadsheet every morning. Now it's instant. The accuracy matches what I'd calculate myself, which tells me the AI is doing this correctly.",
    highlight: "accuracy matches what I'd calculate myself",
  },
  {
    name: "Sofia L.",
    handle: "@sofia_l_forex",
    role: "Forex trader · 4 yrs",
    avatar: "SL",
    avatarColor: "from-teal-500 to-cyan-500",
    stars: 5,
    badge: "Verified Basic",
    quote:
      "Switched from a $79/month trade signal service that had mediocre accuracy and zero explanation. TradeSharp gives me the reasoning behind every signal — not just 'buy' but WHY to buy with supporting indicators. The price difference alone is wild, but the quality is actually better. Wish I found this sooner.",
    highlight: "quality is actually better",
  },
  {
    name: "Nathan P.",
    handle: "@nathanp_algo",
    role: "Algorithmic trader · 8 yrs",
    avatar: "NP",
    avatarColor: "from-rose-500 to-red-500",
    stars: 5,
    badge: "Verified Pro",
    quote:
      "As someone who builds trading algorithms, I was skeptical of an AI doing TA. But I tested it against my own model on 50 historical setups. The signal agreement was 82%. That's not luck — the AI is reading these patterns correctly. Now I use it as a second opinion before entering any large position.",
    highlight: "signal agreement was 82% across 50 historical setups",
  },
];

function StarRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array(count).fill(0).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

export function Reviews() {
  // Split into 3 columns for masonry feel
  const col1 = REVIEWS.filter((_, i) => i % 3 === 0);
  const col2 = REVIEWS.filter((_, i) => i % 3 === 1);
  const col3 = REVIEWS.filter((_, i) => i % 3 === 2);

  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <ScrollReveal variant="up" className="text-center mb-6">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Reviews</p>
          <h2 className="text-4xl font-bold text-text-primary mb-3">
            Traders who switched{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              never looked back
            </span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Real users. Real trades. Real results — for a fraction of what competitors charge.
          </p>
        </ScrollReveal>

        {/* Aggregate rating bar */}
        <ScrollReveal variant="scale" className="mb-14">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-5 rounded-2xl bg-surface border border-border max-w-lg mx-auto">
            <div className="text-center">
              <p className="text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">4.9</p>
              <StarRow />
              <p className="text-xs text-muted mt-1">Average rating</p>
            </div>
            <div className="hidden sm:block w-px h-12 bg-border" />
            <div className="space-y-1 flex-1 w-full max-w-xs">
              {[
                { stars: 5, pct: 94 },
                { stars: 4, pct: 5 },
                { stars: 3, pct: 1 },
              ].map(r => (
                <div key={r.stars} className="flex items-center gap-2 text-xs">
                  <span className="text-muted w-3">{r.stars}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="text-muted w-6 text-right">{r.pct}%</span>
                </div>
              ))}
            </div>
            <div className="hidden sm:block w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-black text-text-primary">2,400+</p>
              <p className="text-xs text-muted mt-1">Happy traders</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Masonry grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {[col1, col2, col3].map((col, ci) => (
            <div key={ci} className="space-y-4">
              {col.map((r, ri) => (
                <ScrollReveal key={r.name} variant="up" delay={ci * 80 + ri * 60}>
                  <div className="p-5 rounded-xl bg-surface border border-border glow-card">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${r.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {r.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-primary leading-none">{r.name}</p>
                          <p className="text-xs text-muted mt-0.5">{r.handle}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium flex-shrink-0">
                        {r.badge}
                      </span>
                    </div>

                    {/* Stars + role */}
                    <div className="flex items-center justify-between mb-3">
                      <StarRow count={r.stars} />
                      <span className="text-xs text-muted">{r.role}</span>
                    </div>

                    {/* Quote */}
                    <div className="relative">
                      <Quote className="h-4 w-4 text-primary/30 absolute -top-1 -left-1" />
                      <p className="text-sm text-text-secondary leading-relaxed pl-3">
                        {r.quote.split(r.highlight).map((part, i, arr) => (
                          i < arr.length - 1 ? (
                            <span key={i}>
                              {part}
                              <span className="text-text-primary font-semibold">{r.highlight}</span>
                            </span>
                          ) : part
                        ))}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom motto strip */}
        <ScrollReveal variant="up" className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-2 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-surface to-accent/10 border border-primary/20">
            <p className="text-2xl font-extrabold italic bg-gradient-to-r from-primary via-accent to-primary-light bg-clip-text text-transparent">
              &ldquo;Premium advice without the premium price.&rdquo;
            </p>
            <p className="text-sm text-muted">— The TradeSharp promise</p>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
