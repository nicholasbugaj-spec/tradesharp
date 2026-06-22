import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id?: string }).id!;

    const alerts = await prisma.priceAlert.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ alerts });
  } catch (err) {
    console.error("GET /api/alerts error:", err);
    return NextResponse.json({ error: "Internal server error", alerts: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id?: string }).id!;

    const { ticker, condition, targetPrice } = await req.json();
    if (!ticker || !condition || targetPrice === undefined) {
      return NextResponse.json({ error: "ticker, condition, and targetPrice are required." }, { status: 400 });
    }
    if (!["above", "below"].includes(condition)) {
      return NextResponse.json({ error: "condition must be 'above' or 'below'." }, { status: 400 });
    }

    const alert = await prisma.priceAlert.create({
      data: { userId, ticker: ticker.toUpperCase(), condition, targetPrice: parseFloat(targetPrice) },
    });
    return NextResponse.json({ alert }, { status: 201 });
  } catch (err) {
    console.error("POST /api/alerts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
