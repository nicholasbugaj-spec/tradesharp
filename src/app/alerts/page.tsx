"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bell, BellOff, Plus, Trash2, TrendingUp, TrendingDown,
  RefreshCw, CheckCircle, Clock, AlertTriangle,
} from "lucide-react";

interface PriceAlert {
  id: string;
  ticker: string;
  condition: "above" | "below";
  targetPrice: number;
  triggered: boolean;
  triggeredAt: string | null;
  active: boolean;
  createdAt: string;
}

export default function AlertsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [ticker, setTicker] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login?callbackUrl=/alerts");
  }, [status, router]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts");
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setAlerts(data.alerts ?? []);
    } catch (err) {
      console.error("fetchAlerts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (status === "authenticated") fetchAlerts(); }, [status]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: ticker.trim().toUpperCase(), condition, targetPrice: parseFloat(targetPrice) }),
    });
    if (res.ok) {
      const data = await res.json();
      setAlerts((prev) => [data.alert, ...prev]);
      setTicker(""); setCondition("above"); setTargetPrice("");
      setShowForm(false);
    }
    setSubmitting(false);
  };

  const deleteAlert = async (id: string) => {
    await fetch(`/api/alerts/${id}`, { method: "DELETE" });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const active = alerts.filter((a) => a.active && !a.triggered);
  const triggered = alerts.filter((a) => a.triggered);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 animate-float">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Price Alerts</h1>
            <p className="text-sm text-text-secondary">{active.length} active · {triggered.length} triggered</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={fetchAlerts} className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5">
            <Plus className="h-4 w-4" />New Alert
          </Button>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-text-secondary">
          Alerts are checked every 15 minutes. Supports crypto (BTC, ETH, SOL…) and stocks (AAPL, NVDA, TSLA…).
          An email is sent to your account when triggered.
        </p>
      </div>

      {/* Add alert form */}
      {showForm && (
        <Card className="mb-6 border-primary/30 animate-slide-down gradient-border">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Create Price Alert</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1">Ticker / Token</label>
                <input
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="BTC, ETH, AAPL, NVDA…"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary text-sm focus:outline-none focus:border-primary/50 uppercase"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as "above" | "below")}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary text-sm focus:outline-none focus:border-primary/50"
                >
                  <option value="above">Rises above</option>
                  <option value="below">Falls below</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Target Price ($)</label>
                <input
                  type="number"
                  min="0.000001"
                  step="any"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="50000"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-text-primary text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="sm:col-span-3 flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" loading={submitting}>Set Alert</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active alerts */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
          <Bell className="h-3.5 w-3.5" /> Active Alerts ({active.length})
        </h2>
        {active.length === 0 ? (
          <div className="text-center py-12 text-text-secondary text-sm border border-dashed border-border rounded-xl">
            No active alerts. Click &quot;New Alert&quot; to get notified when a price moves.
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onDelete={deleteAlert} />
            ))}
          </div>
        )}
      </div>

      {/* Triggered alerts */}
      {triggered.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-green-400" /> Triggered ({triggered.length})
          </h2>
          <div className="space-y-3">
            {triggered.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onDelete={deleteAlert} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert, onDelete }: { alert: PriceAlert; onDelete: (id: string) => void }) {
  const isAbove = alert.condition === "above";
  return (
    <Card className={cn(
      "glow-card",
      alert.triggered ? "border-green-500/20 bg-green-500/5" : "border-border"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
              alert.triggered ? "bg-green-500/15" : isAbove ? "bg-primary/15" : "bg-red-500/15"
            )}>
              {alert.triggered
                ? <CheckCircle className="h-4 w-4 text-green-400" />
                : isAbove
                  ? <TrendingUp className="h-4 w-4 text-primary" />
                  : <TrendingDown className="h-4 w-4 text-red-400" />
              }
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-text-primary">{alert.ticker}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium border",
                  alert.triggered
                    ? "text-green-400 bg-green-500/10 border-green-500/30"
                    : "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"
                )}>
                  {alert.triggered ? "Triggered" : "Watching"}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                {isAbove ? "Rises above" : "Falls below"}{" "}
                <span className="text-text-primary font-semibold">${alert.targetPrice.toLocaleString()}</span>
              </p>
              {alert.triggeredAt && (
                <p className="text-xs text-muted mt-0.5">
                  Triggered {new Date(alert.triggeredAt).toLocaleString()}
                </p>
              )}
              {!alert.triggered && (
                <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Set {new Date(alert.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => onDelete(alert.id)}
            className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all flex-shrink-0"
            title="Delete alert"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
