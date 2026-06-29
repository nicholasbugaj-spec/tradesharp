import { NextRequest, NextResponse } from "next/server";
import { getStripe, getPlanFromPriceId } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const packId = session.metadata?.packId;
        const credits = session.metadata?.credits;

        if (!userId) break;

        if (packId && credits) {
          // One-time pack purchase
          const creditCount = parseInt(credits, 10);
          if (isNaN(creditCount) || creditCount <= 0) break;
          await prisma.$transaction([
            prisma.packPurchase.create({
              data: {
                userId,
                packId,
                credits: creditCount,
                amountPaid: session.amount_total ?? 0,
                stripeSessionId: session.id,
              },
            }),
            prisma.user.update({
              where: { id: userId },
              data: { bonusCredits: { increment: creditCount } },
            }),
          ]);
        } else if (plan) {
          // Subscription upgrade
          const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
              plan,
              stripeSubscriptionId: session.subscription ? (session.subscription as string) : null,
              stripeSubscriptionStatus: "active",
            },
          });

          // Referral reward — give referrer 1 free month if this user was referred
          if (updatedUser.referredBy) {
            const referrer = await prisma.user.findUnique({
              where: { referralCode: updatedUser.referredBy },
            });
            if (referrer?.stripeSubscriptionId) {
              const sub = await getStripe().subscriptions.retrieve(referrer.stripeSubscriptionId) as Stripe.Subscription & { current_period_end: number };
              const newTrialEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
              await getStripe().subscriptions.update(referrer.stripeSubscriptionId, {
                trial_end: Math.max(sub.current_period_end ?? newTrialEnd, newTrialEnd),
                proration_behavior: "none",
              });
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const priceId = sub.items?.data?.[0]?.price?.id;
        const plan = priceId ? getPlanFromPriceId(priceId) : "basic";

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeSubscriptionStatus: sub.status,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        // Downgrade to free when subscription is cancelled
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "free",
            stripeSubscriptionStatus: "canceled",
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        if (!customerId) break;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { stripeSubscriptionStatus: "past_due" },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
