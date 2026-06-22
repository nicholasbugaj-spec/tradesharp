import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// $1 budget per user per month using Haiku (cheapest model)
// haiku-3: ~$0.0008/1k input, $0.004/1k output ≈ $0.003/avg message
// 50 messages ≈ $0.15 max — well under $1
const MONTHLY_MESSAGE_LIMIT = 100;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id!;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.plan !== "pro") {
    return NextResponse.json({ error: "AI Chat is a Pro plan feature." }, { status: 403 });
  }

  const { analysisId, message } = await req.json();
  if (!analysisId || !message?.trim()) {
    return NextResponse.json({ error: "analysisId and message are required." }, { status: 400 });
  }

  // Check monthly usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const usedThisMonth = await prisma.chatMessage.count({
    where: { userId, role: "user", createdAt: { gte: startOfMonth } },
  });
  if (usedThisMonth >= MONTHLY_MESSAGE_LIMIT) {
    return NextResponse.json({
      error: `You've used all 100 AI chat messages for this month. Resets on the 1st.`,
      limitReached: true,
    }, { status: 429 });
  }

  // Load the analysis for context
  const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } });
  if (!analysis || analysis.userId !== userId) {
    return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  }

  // Load recent chat history for this analysis (last 10 messages for context)
  const history = await prisma.chatMessage.findMany({
    where: { userId, analysisId },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  // Parse signals for context
  let signalsSummary = "";
  try {
    const s = JSON.parse(analysis.signals);
    signalsSummary = `
- Quick Take: ${s.quickTake ?? "N/A"}
- Bull/Bear: ${s.bullPercent ?? 50}% bull / ${s.bearPercent ?? 50}% bear
- RSI: ${s.rsi ?? "N/A"} | MACD: ${s.macd ?? "N/A"} | Trend Strength: ${s.trendStrength ?? "N/A"}/10
- Support: ${s.supportLevel ?? "N/A"} | Resistance: ${s.resistanceLevel ?? "N/A"}
- Risk/Reward: ${s.riskReward ?? "N/A"} | Kelly Size: ${s.kellySize ?? "N/A"}
- Volatility: ${s.volatility ?? "N/A"}
- Key Factors: ${(s.keyFactors ?? []).join("; ")}
- Market Sentiment: ${s.marketSentiment ?? "N/A"}
`.trim();
  } catch { /* ignore */ }

  const systemPrompt = `You are TradeSharp's AI assistant — a sharp, direct trading analyst. You are answering follow-up questions about a specific analysis the user just ran.

ANALYSIS CONTEXT:
- Recommendation: ${analysis.recommendation}
- Confidence: ${analysis.confidence}%
- Market Type: ${analysis.marketType}
- Reasoning: ${analysis.reasoning}
${signalsSummary}

Rules:
- Be concise and direct. Traders want actionable answers, not essays.
- Always relate your answer back to this specific analysis.
- If asked about position sizing, use the Kelly Criterion shown above.
- Never give advice that contradicts the analysis without a good reason.
- Always end with a disclaimer: "Not financial advice."
- Keep responses under 150 words unless a detailed breakdown is explicitly requested.`;

  // Build message history for Claude
  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: message.trim() },
  ];

  let reply = "";
  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system: systemPrompt,
      messages,
    });
    reply = response.content[0]?.type === "text" ? response.content[0].text : "Sorry, I couldn't generate a response.";
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "AI service error. Please try again." }, { status: 500 });
  }

  // Save both messages
  await prisma.chatMessage.createMany({
    data: [
      { userId, analysisId, role: "user", content: message.trim() },
      { userId, analysisId, role: "assistant", content: reply },
    ],
  });

  return NextResponse.json({
    reply,
    messagesUsed: usedThisMonth + 1,
    messagesRemaining: MONTHLY_MESSAGE_LIMIT - usedThisMonth - 1,
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id!;

  const { searchParams } = new URL(req.url);
  const analysisId = searchParams.get("analysisId");
  if (!analysisId) return NextResponse.json({ messages: [] });

  const messages = await prisma.chatMessage.findMany({
    where: { userId, analysisId },
    orderBy: { createdAt: "asc" },
  });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const usedThisMonth = await prisma.chatMessage.count({
    where: { userId, role: "user", createdAt: { gte: startOfMonth } },
  });

  return NextResponse.json({
    messages,
    messagesUsed: usedThisMonth,
    messagesRemaining: Math.max(0, 100 - usedThisMonth),
  });
}
