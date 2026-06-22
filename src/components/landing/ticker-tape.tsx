const TICKERS = [
  { sym: "BTC/USD", val: "$67,420", change: "+2.4%", up: true },
  { sym: "ETH/USD", val: "$3,581", change: "+1.8%", up: true },
  { sym: "NVDA", val: "$942.30", change: "+3.1%", up: true },
  { sym: "AAPL", val: "$214.50", change: "-0.6%", up: false },
  { sym: "SOL/USD", val: "$182.90", change: "+5.2%", up: true },
  { sym: "SPY", val: "$548.20", change: "+0.9%", up: true },
  { sym: "TSLA", val: "$248.70", change: "-1.4%", up: false },
  { sym: "BNB/USD", val: "$608.40", change: "+1.1%", up: true },
  { sym: "MSFT", val: "$431.10", change: "+0.7%", up: true },
  { sym: "XRP/USD", val: "$0.6142", change: "+3.8%", up: true },
  { sym: "AMZN", val: "$198.30", change: "-0.3%", up: false },
  { sym: "DOGE/USD", val: "$0.1847", change: "+6.1%", up: true },
];

function TickerItem({ sym, val, change, up }: (typeof TICKERS)[0]) {
  return (
    <span className="inline-flex items-center gap-2 mx-6 text-xs font-mono">
      <span className="text-muted font-semibold">{sym}</span>
      <span className="text-text-primary">{val}</span>
      <span className={up ? "text-green-400" : "text-red-400"}>{change}</span>
      <span className="text-border">|</span>
    </span>
  );
}

export function TickerTape() {
  const items = [...TICKERS, ...TICKERS]; // double for seamless loop
  return (
    <div className="border-y border-border bg-surface/60 py-2 overflow-hidden">
      <div className="ticker-tape inline-flex">
        {items.map((t, i) => (
          <TickerItem key={i} {...t} />
        ))}
      </div>
    </div>
  );
}
