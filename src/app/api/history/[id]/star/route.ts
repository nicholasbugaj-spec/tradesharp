export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const analysis = await prisma.analysis.findUnique({ where: { id: params.id } });
    if (!analysis || analysis.userId !== userId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const updated = await prisma.analysis.update({
      where: { id: params.id },
      data: { starred: !analysis.starred },
    });

    return NextResponse.json({ starred: updated.starred });
  } catch (err) {
    console.error("Star toggle error:", err);
    return NextResponse.json({ error: "Failed to update." }, { status: 500 });
  }
}
