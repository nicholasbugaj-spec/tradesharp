"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UploadZone } from "@/components/dashboard/upload-zone";
import { AnalysisResultCard } from "@/components/dashboard/analysis-result";
import { AnalysisResult, Plan } from "@/types";
import { getPlan, showConfidenceScore, showDetailedReasoning, showSignalBreakdown } from "@/lib/plans";
import { TrendingUp, Zap } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [uploadsUsed, setUploadsUsed] = useState(0);

  const plan = ((session?.user as { plan?: string })?.plan ?? "elite") as Plan;
  const planDef = getPlan(plan);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch today's usage count
      fetch("/api/history?todayOnly=true")
        .then((r) => r.json())
        .then((data) => {
          if (data.count !== undefined) {
            setUploadsUsed(data.count);
          }
        })
        .catch(() => {});
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const handleResult = (newResult: AnalysisResult) => {
    setResult(newResult);
    setUploadsUsed((prev) => prev + 1);
    // Scroll to result
    setTimeout(() => {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-sm text-text-secondary">
              {plan === "elite" ? (
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-accent" />
                  Elite Plan — Unlimited analyses
                </span>
              ) : (
                `${planDef.name} Plan`
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <h2 className="text-base font-semibold text-text-primary mb-1">
          Upload Market Screenshot
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          Upload a screenshot of any betting or prediction market to get an AI-powered analysis.
        </p>
        <UploadZone
          onResult={handleResult}
          uploadsUsed={uploadsUsed}
          uploadsLimit={planDef.uploadsPerDay}
          plan={plan}
        />
      </div>

      {/* Result */}
      {result && (
        <div id="result">
          <h2 className="text-base font-semibold text-text-primary mb-4">
            Analysis Result
          </h2>
          <AnalysisResultCard
            result={result}
            showConfidence={showConfidenceScore(plan)}
            showReasoning={showDetailedReasoning(plan)}
            showSignals={showSignalBreakdown(plan)}
          />
        </div>
      )}

      {/* Empty state hint */}
      {!result && (
        <div className="text-center py-8 text-text-secondary">
          <p className="text-sm">
            Your analysis results will appear here after uploading a screenshot.
          </p>
        </div>
      )}
    </div>
  );
}
