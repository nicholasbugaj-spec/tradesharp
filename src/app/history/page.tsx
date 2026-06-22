"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HistoryTable } from "@/components/history/history-table";
import { AnalysisResult, Plan } from "@/types";
import { showConfidenceScore } from "@/lib/plans";
import { History, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const plan = ((session?.user as { plan?: string })?.plan ?? "free") as Plan;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/history");
    }
  }, [status, router]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load history");
        return;
      }
      setAnalyses(data.analyses ?? []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchHistory();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">Loading history...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 animate-float">
            <History className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Analysis History
            </h1>
            <p className="text-sm text-text-secondary">
              {analyses.length} total{" "}
              {analyses.length === 1 ? "analysis" : "analyses"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchHistory}
          className="gap-1.5"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger">
          {error}
        </div>
      ) : (
        <HistoryTable
          analyses={analyses}
          showConfidence={showConfidenceScore(plan)}
          onStarToggle={(id, starred) =>
            setAnalyses((prev) => prev.map((a) => a.id === id ? { ...a, starred } : a))
          }
        />
      )}
    </div>
  );
}
