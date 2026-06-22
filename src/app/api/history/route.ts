export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalysisSignals } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const todayOnly = searchParams.get("todayOnly") === "true";
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

    if (todayOnly) {
      // Just return the count for today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const count = await prisma.analysis.count({
        where: {
          userId,
          createdAt: { gte: startOfDay },
        },
      });

      return NextResponse.json({ count });
    }

    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.analysis.count({ where: { userId } }),
    ]);

    const formatted = analyses.map((a) => {
      let signals: AnalysisSignals = {};
      try {
        signals = JSON.parse(a.signals) as AnalysisSignals;
      } catch {
        // leave empty
      }

      return {
        id: a.id,
        recommendation: a.recommendation,
        confidence: a.confidence,
        reasoning: a.reasoning,
        marketType: a.marketType,
        signals,
        imageUrl: a.imageUrl ?? null,
        starred: a.starred ?? false,
        createdAt: a.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      analyses: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("History fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch history." },
      { status: 500 }
    );
  }
}
