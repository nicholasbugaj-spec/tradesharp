import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPrice } from "@/lib/prices";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET ?? ""}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const RESEND_KEY = process.env.RESEND_API_KEY;
  const alerts = await prisma.priceAlert.findMany({
    where: { active: true, triggered: false },
    include: { user: { select: { email: true, name: true } } },
  });

  if (alerts.length === 0) return NextResponse.json({ checked: 0, triggered: 0 });

  // Group by ticker to avoid redundant price fetches
  const tickerMap = new Map<string, number | null>();
  const uniqueTickers = Array.from(new Set(alerts.map((a) => a.ticker)));
  await Promise.all(uniqueTickers.map(async (t) => {
    tickerMap.set(t, await getCurrentPrice(t));
  }));

  let triggered = 0;

  for (const alert of alerts) {
    const price = tickerMap.get(alert.ticker);
    if (price === null || price === undefined) continue;

    const hit =
      (alert.condition === "above" && price >= alert.targetPrice) ||
      (alert.condition === "below" && price <= alert.targetPrice);

    if (!hit) continue;

    // Mark triggered
    await prisma.priceAlert.update({
      where: { id: alert.id },
      data: { triggered: true, triggeredAt: new Date(), active: false },
    });
    triggered++;

    // Send email if Resend is configured and user has email
    if (RESEND_KEY && alert.user.email) {
      const direction = alert.condition === "above" ? "risen above" : "fallen below";
      const html = `
<!DOCTYPE html><html><body style="background:#0a0a0f;font-family:sans-serif;padding:32px;color:#f1f5f9;">
  <div style="max-width:500px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#6366f1,#a855f7);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <h1 style="margin:0;color:#fff;font-size:22px;">🔔 Price Alert Triggered</h1>
    </div>
    <div style="background:#111118;border:1px solid #1e1e2e;border-radius:12px;padding:24px;margin-bottom:16px;">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:14px;">Your alert for <strong style="color:#6366f1;">${alert.ticker}</strong> has triggered.</p>
      <p style="margin:0;font-size:28px;font-weight:800;color:#f1f5f9;">$${price.toLocaleString()}</p>
      <p style="margin:4px 0 0;color:#64748b;font-size:13px;">Price has ${direction} your target of $${alert.targetPrice.toLocaleString()}</p>
    </div>
    <div style="text-align:center;">
      <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/alerts"
         style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;">
        Manage Alerts →
      </a>
    </div>
    <p style="text-align:center;color:#334155;font-size:11px;margin-top:16px;">TradeSharp · Not financial advice</p>
  </div>
</body></html>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "TradeSharp Alerts <alerts@tradesharp.app>",
          to: [alert.user.email],
          subject: `🔔 ${alert.ticker} has ${direction} $${alert.targetPrice.toLocaleString()}`,
          html,
        }),
      }).catch(() => {}); // don't fail if email fails
    }
  }

  return NextResponse.json({ checked: alerts.length, triggered });
}
