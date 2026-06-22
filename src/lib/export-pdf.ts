import { AnalysisResult } from "@/types";

export async function exportAnalysisPDF(analysis: AnalysisResult): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210;
  const MARGIN = 18;
  const CONTENT_W = W - MARGIN * 2;
  let y = 20;

  const recColors: Record<string, [number, number, number]> = {
    BUY:    [34, 197, 94],
    SELL:   [239, 68, 68],
    HOLD:   [234, 179, 8],
  };
  const [r, g, b] = recColors[analysis.recommendation] ?? [100, 116, 139];

  // ── Header bar ──
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, W, 22, "F");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TradeSharp — Analysis Report", MARGIN, 14);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(new Date(analysis.createdAt).toLocaleString(), W - MARGIN, 14, { align: "right" });

  y = 32;

  // ── Recommendation badge ──
  doc.setFillColor(r, g, b);
  doc.roundedRect(MARGIN, y, 52, 14, 3, 3, "F");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(analysis.recommendation.replace("_", " "), MARGIN + 26, y + 9.5, { align: "center" });

  // Confidence
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Confidence:", MARGIN + 58, y + 5);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(r, g, b);
  doc.text(`${analysis.confidence}%`, MARGIN + 58, y + 13);

  // Market type
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Market:", MARGIN + 105, y + 5);
  doc.setTextColor(241, 245, 249);
  doc.setFont("helvetica", "bold");
  doc.text(analysis.marketType.replace("_", " ").toUpperCase(), MARGIN + 105, y + 13);

  y += 22;

  const section = (title: string, accent: [number, number, number] = [99, 102, 241]) => {
    doc.setFillColor(...accent);
    doc.rect(MARGIN, y, 3, 5, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(241, 245, 249);
    doc.text(title, MARGIN + 6, y + 4);
    y += 9;
  };

  const bodyText = (text: string, color: [number, number, number] = [148, 163, 184]) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CONTENT_W - 4);
    doc.text(lines, MARGIN + 4, y);
    y += lines.length * 5 + 2;
  };

  const checkPageBreak = (needed = 20) => {
    if (y + needed > 280) {
      doc.addPage();
      y = 18;
    }
  };

  // ── Reasoning ──
  checkPageBreak(30);
  section("Analysis Reasoning");
  bodyText(analysis.reasoning);
  y += 4;

  // ── Price Targets ──
  if (analysis.signals?.priceTargets?.length) {
    checkPageBreak(40);
    section("Price Targets & Entry Points", [99, 102, 241]);
    for (const pt of analysis.signals.priceTargets) {
      checkPageBreak(28);
      doc.setFillColor(20, 20, 30);
      doc.roundedRect(MARGIN, y, CONTENT_W, 22, 2, 2, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(241, 245, 249);
      doc.text(`${pt.action} — ${pt.outcome}`, MARGIN + 3, y + 5);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      const cols = [
        ["Current", pt.currentOdds],
        ["Enter At", pt.targetEntry],
        ["Take Profit", pt.targetExit],
        ["Stop Loss", pt.stopLoss],
        ["Edge", pt.edgePercent],
      ];
      cols.forEach(([label, val], i) => {
        const x = MARGIN + 3 + i * 36;
        doc.text(label, x, y + 12);
        doc.setTextColor(241, 245, 249);
        doc.text(val, x, y + 18);
        doc.setTextColor(148, 163, 184);
      });
      y += 26;
    }
    y += 2;
  }

  // ── Liquidity ──
  if (analysis.signals?.liquidity) {
    checkPageBreak(25);
    section("Liquidity Analysis", [6, 182, 212]);
    bodyText(analysis.signals.liquidity);
    y += 2;
  }

  // ── Volume Swings ──
  if (analysis.signals?.volumeSwings) {
    checkPageBreak(25);
    section("Volume & Swing Analysis", [168, 85, 247]);
    bodyText(analysis.signals.volumeSwings);
    y += 2;
  }

  // ── News Impact ──
  if (analysis.signals?.newsImpact?.length) {
    checkPageBreak(25);
    section("News & Market Impact", [249, 115, 22]);
    for (const item of analysis.signals.newsImpact) {
      checkPageBreak(12);
      bodyText(`• ${item}`);
    }
    y += 2;
  }

  // ── Key Factors ──
  if (analysis.signals?.keyFactors?.length) {
    checkPageBreak(25);
    section("Key Factors", [99, 102, 241]);
    for (const f of analysis.signals.keyFactors) {
      checkPageBreak(10);
      bodyText(`• ${f}`);
    }
    y += 2;
  }

  // ── Undervalued Markets ──
  if (analysis.signals?.undervaluedMarkets?.length) {
    checkPageBreak(20);
    section("Undervalued Markets", [234, 179, 8]);
    for (const m of analysis.signals.undervaluedMarkets) {
      checkPageBreak(10);
      bodyText(`◆ ${m}`, [241, 245, 249]);
    }
  }

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text("Generated by TradeSharp — Not financial advice. For informational purposes only.", MARGIN, 292);
    doc.text(`Page ${i} of ${pageCount}`, W - MARGIN, 292, { align: "right" });
  }

  const dateStr = new Date(analysis.createdAt).toISOString().split("T")[0];
  doc.save(`tradesharp-${analysis.recommendation.toLowerCase()}-${dateStr}.pdf`);
}
