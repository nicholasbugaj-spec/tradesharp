"use client";

import { AnalysisResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRecommendationBg, formatDateShort, cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Minus,
  ChevronRight, Lock, Star, Download, Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";

interface HistoryTableProps {
  analyses: AnalysisResult[];
  showConfidence: boolean;
  onStarToggle?: (id: string, newVal: boolean) => void;
}

function RecIcon({ rec }: { rec: string }) {
  const cls = "h-3.5 w-3.5";
  switch (rec) {
    case "BUY":    return <TrendingUp className={cls} />;
    case "SELL":   return <TrendingDown className={cls} />;
    case "HOLD":   return <Minus className={cls} />;
    default:       return <Minus className={cls} />;
  }
}

function RecBadge({ rec }: { rec: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border", getRecommendationBg(rec))}>
      <RecIcon rec={rec} />
      {rec.replace("_", " ")}
    </span>
  );
}

function Thumbnail({ src }: { src?: string | null }) {
  if (!src || src.startsWith("upload_")) {
    return (
      <div className="w-14 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
        <ImageIcon className="h-4 w-4 text-muted" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="scan"
      className="w-14 h-10 rounded-lg object-cover border border-border flex-shrink-0 bg-surface-2"
    />
  );
}

export function HistoryTable({ analyses, showConfidence, onStarToggle }: HistoryTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [starLoading, setStarLoading] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "starred">("all");

  const visible = filter === "starred" ? analyses.filter((a) => a.starred) : analyses;

  const handleStar = useCallback(async (e: React.MouseEvent, analysis: AnalysisResult) => {
    e.stopPropagation();
    setStarLoading(analysis.id);
    try {
      const res = await fetch(`/api/history/${analysis.id}/star`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) onStarToggle?.(analysis.id, data.starred);
    } finally {
      setStarLoading(null);
    }
  }, [onStarToggle]);

  const handlePDF = useCallback(async (e: React.MouseEvent, analysis: AnalysisResult) => {
    e.stopPropagation();
    setPdfLoading(analysis.id);
    try {
      const { exportAnalysisPDF } = await import("@/lib/export-pdf");
      await exportAnalysisPDF(analysis);
    } finally {
      setPdfLoading(null);
    }
  }, []);

  if (analyses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="h-7 w-7 text-muted" />
        </div>
        <p className="text-text-primary font-medium mb-1">No analyses yet</p>
        <p className="text-sm text-text-secondary mb-4">Upload your first screenshot to get started</p>
        <Link href="/dashboard" className="text-sm text-primary hover:underline">Go to Dashboard →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {(["all", "starred"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              filter === f
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
            )}
          >
            {f === "starred" && <Star className="h-3.5 w-3.5" />}
            {f === "all" ? `All (${analyses.length})` : `Starred (${analyses.filter((a) => a.starred).length})`}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-10 text-text-secondary text-sm">
          No starred analyses yet. Click the ★ on any scan to save it.
        </div>
      )}

      {/* Column headers */}
      {visible.length > 0 && (
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-xs font-medium text-muted uppercase tracking-wider">
          <div className="col-span-1">Image</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Signal</div>
          <div className="col-span-2">Confidence</div>
          <div className="col-span-2">Market</div>
          <div className="col-span-2">Actions</div>
        </div>
      )}

      {visible.map((analysis) => (
        <div key={analysis.id}>
          <button onClick={() => setExpanded(expanded === analysis.id ? null : analysis.id)} className="w-full text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 px-4 py-3 rounded-xl bg-surface border border-border hover:border-border-light hover:bg-surface-2 transition-all duration-150 items-center">

              {/* Thumbnail */}
              <div className="md:col-span-1">
                <Thumbnail src={analysis.imageUrl} />
              </div>

              {/* Date */}
              <div className="md:col-span-2">
                <p className="text-sm text-text-secondary">{formatDateShort(analysis.createdAt)}</p>
              </div>

              {/* Signal */}
              <div className="md:col-span-3">
                <RecBadge rec={analysis.recommendation} />
              </div>

              {/* Confidence */}
              <div className="md:col-span-2">
                {showConfidence ? (
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", analysis.confidence >= 75 ? "bg-success" : analysis.confidence >= 50 ? "bg-warning" : "bg-danger")}
                        style={{ width: `${analysis.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono text-text-primary">{analysis.confidence}%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-muted">
                    <Lock className="h-3 w-3" /><span className="text-xs">Upgrade</span>
                  </div>
                )}
              </div>

              {/* Market type */}
              <div className="md:col-span-2">
                <Badge variant="default" className="text-xs capitalize">
                  {analysis.marketType.replace("_", " ")}
                </Badge>
              </div>

              {/* Actions */}
              <div className="md:col-span-2 flex items-center gap-1.5">
                {/* Star */}
                <button
                  onClick={(e) => handleStar(e, analysis)}
                  disabled={starLoading === analysis.id}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    analysis.starred
                      ? "text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20"
                      : "text-muted hover:text-yellow-400 hover:bg-yellow-500/10"
                  )}
                  title={analysis.starred ? "Remove from starred" : "Star this analysis"}
                >
                  <Star className={cn("h-4 w-4", analysis.starred && "fill-yellow-400")} />
                </button>

                {/* PDF download */}
                <button
                  onClick={(e) => handlePDF(e, analysis)}
                  disabled={pdfLoading === analysis.id}
                  className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-all"
                  title="Download PDF report"
                >
                  {pdfLoading === analysis.id
                    ? <div className="h-4 w-4 border border-primary border-t-transparent rounded-full animate-spin" />
                    : <Download className="h-4 w-4" />
                  }
                </button>

                <ChevronRight className={cn("h-4 w-4 text-muted transition-transform ml-auto", expanded === analysis.id && "rotate-90")} />
              </div>
            </div>
          </button>

          {/* Expanded detail */}
          {expanded === analysis.id && (
            <div className="ml-4 mr-4 -mt-1 p-4 bg-surface-2 border border-border border-t-0 rounded-b-xl animate-fade-in">
              <div className="flex gap-4">
                {/* Larger image preview */}
                {analysis.imageUrl && !analysis.imageUrl.startsWith("upload_") && (
                  <div className="flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={analysis.imageUrl}
                      alt="scan preview"
                      className="w-40 h-28 object-cover rounded-lg border border-border"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Full Reasoning</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{analysis.reasoning}</p>

                  {analysis.signals?.keyFactors && analysis.signals.keyFactors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Key Factors</p>
                      <ul className="space-y-1">
                        {analysis.signals.keyFactors.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                            <span className="text-primary mt-0.5">•</span>{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.signals?.priceTargets && analysis.signals.priceTargets.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {analysis.signals.priceTargets.slice(0, 1).map((pt, i) => (
                        <div key={i} className="text-xs bg-surface border border-border rounded-lg px-3 py-2 font-mono">
                          <span className="text-muted">Entry </span><span className="text-green-400">{pt.targetEntry}</span>
                          <span className="text-muted mx-2">→</span>
                          <span className="text-muted">TP </span><span className="text-primary">{pt.targetExit}</span>
                          <span className="text-muted mx-2">|</span>
                          <span className="text-muted">SL </span><span className="text-red-400">{pt.stopLoss}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={(e) => handlePDF(e, analysis)}>
                      <Download className="h-3.5 w-3.5" />Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
