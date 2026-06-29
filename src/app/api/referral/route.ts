export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id!;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });

  // Generate one if they don't have it yet
  if (!user?.referralCode) {
    const referralCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    await prisma.user.update({ where: { id: userId }, data: { referralCode } });
    return NextResponse.json({ referralCode });
  }

  return NextResponse.json({ referralCode: user.referralCode });
}
