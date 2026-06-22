import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id?: string }).id!;

  const alert = await prisma.priceAlert.findUnique({ where: { id: params.id } });
  if (!alert || alert.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.priceAlert.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
