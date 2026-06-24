export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeMarketImage } from "@/lib/ai/analyzer";
import { mockAnalyzeMarketImage } from "@/lib/ai/mock-analyzer";
import { canUpload, getPlan, useRealAI } from "@/lib/plans";
import { Plan } from "@/types";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const plan = user.plan as Plan;
    const planDef = getPlan(plan);
    const bonusCredits = user.bonusCredits ?? 0;

    // Count usage for the current period
    let usageCount: number;
    if (plan === "free") {
      // Free: daily limit
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      usageCount = await prisma.analysis.count({
        where: { userId, createdAt: { gte: startOfDay }, usedCredit: false },
      });
    } else {
      // Paid: monthly limit
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      usageCount = await prisma.analysis.count({
        where: { userId, createdAt: { gte: startOfMonth }, usedCredit: false },
      });
    }

    const freeDailyLimit = planDef.uploadsPerDay ?? 10;
    const withinPlanLimit = plan === "free"
      ? usageCount < freeDailyLimit
      : usageCount < (planDef.uploadsPerMonth ?? 0);

    const useCredit = !withinPlanLimit && bonusCredits > 0;

    if (!withinPlanLimit && !useCredit) {
      const limit = plan === "free" ? `${freeDailyLimit} per day` : `${planDef.uploadsPerMonth} per month`;
      return NextResponse.json(
        {
          error: `Analysis limit reached. Your ${planDef.name} plan includes ${limit}. Buy an Analysis Pack or upgrade for more.`,
          code: "LIMIT_REACHED",
        },
        { status: 429 }
      );
    }

    // Parse and validate file
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const ticker = (formData.get("ticker") as string | null)?.trim().toUpperCase() ?? "";

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return NextResponse.json({ error: "Invalid file type. Please upload a JPG, PNG, or WebP image." }, { status: 400 });
    }
    if (imageFile.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const imageUrl = "";

    // Free plan = mock, paid = real AI
    const analysisResult = useRealAI(plan)
      ? await analyzeMarketImage(buffer, imageFile.type, ticker)
      : await mockAnalyzeMarketImage(ticker);

    // Save analysis + deduct credit if needed in a transaction
    const [saved] = await prisma.$transaction([
      prisma.analysis.create({
        data: {
          userId,
          imageUrl,
          recommendation: analysisResult.recommendation,
          confidence: analysisResult.confidence,
          reasoning: analysisResult.reasoning,
          marketType: analysisResult.marketType,
          signals: JSON.stringify(analysisResult.signals),
          usedCredit: useCredit,
        },
      }),
      ...(useCredit
        ? [prisma.user.update({ where: { id: userId }, data: { bonusCredits: { decrement: 1 } } })]
        : []),
    ]);

    return NextResponse.json({
      id: saved.id,
      recommendation: saved.recommendation,
      confidence: analysisResult.confidence,
      reasoning: saved.reasoning,
      marketType: saved.marketType,
      signals: analysisResult.signals,
      createdAt: saved.createdAt.toISOString(),
      usedCredit: useCredit,
      creditsRemaining: useCredit ? bonusCredits - 1 : bonusCredits,
    }, { status: 200 });

  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
