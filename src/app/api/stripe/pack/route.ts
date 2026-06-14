import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { ANALYSIS_PACKS } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id!;
    const { packId } = await req.json();

    const pack = ANALYSIS_PACKS.find((p) => p.id === packId);
    if (!pack) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    // Use price_data for one-time pack purchases (no need to pre-create in Stripe dashboard)
    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(pack.price * 100),
            product_data: {
              name: `${pack.name} — ${pack.credits} Analyses`,
              description: `${pack.credits} AI market analyses added to your account instantly`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/store?success=true&pack=${packId}`,
      cancel_url: `${baseUrl}/store?canceled=true`,
      metadata: { userId, packId, credits: String(pack.credits) },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Pack checkout error:", err);
    return NextResponse.json({ error: "Failed to start checkout" }, { status: 500 });
  }
}
