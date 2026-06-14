import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "You must be logged in to redeem a code." }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id!;
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Please enter a discount code." }, { status: 400 });
    }

    const normalised = code.trim().toUpperCase();

    // Look up the code
    const discount = await prisma.discountCode.findUnique({
      where: { code: normalised },
      include: { redemptions: true },
    });

    if (!discount || !discount.active) {
      return NextResponse.json({ error: "Invalid or expired discount code." }, { status: 404 });
    }

    // Check uses remaining
    if (discount.usesLeft !== null && discount.usesLeft <= 0) {
      return NextResponse.json({ error: "This code has reached its usage limit." }, { status: 400 });
    }

    // Check if this user already redeemed this code
    const alreadyUsed = discount.redemptions.some((r) => r.userId === userId);
    if (alreadyUsed) {
      return NextResponse.json({ error: "You have already used this code." }, { status: 400 });
    }

    // Apply in a transaction
    await prisma.$transaction([
      prisma.codeRedemption.create({
        data: { userId, codeId: discount.id },
      }),
      prisma.discountCode.update({
        where: { id: discount.id },
        data: {
          usesTotal: { increment: 1 },
          ...(discount.usesLeft !== null ? { usesLeft: { decrement: 1 } } : {}),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { plan: discount.plan },
      }),
    ]);

    const planName = discount.plan === "pro" ? "Elite" : "Basic";
    return NextResponse.json({
      success: true,
      plan: discount.plan,
      message: `🎉 Code applied! You now have the ${planName} plan for free.`,
    });
  } catch (err) {
    console.error("Redeem error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
