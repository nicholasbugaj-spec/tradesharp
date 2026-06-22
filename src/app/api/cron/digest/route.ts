import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Protect with a secret so only Vercel Cron (or you) can trigger it
function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET ?? ""}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  // Get all users who opted into email digest
  const users = await prisma.user.findMany({
    where: { emailDigest: true },
    include: {
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    if (!user.email) continue;

    const recentCount = user.analyses.length;
    const plan = user.plan;
    const buys = user.analyses.filter((a) => a.recommendation === "BUY").length;
    const sells = user.analyses.filter((a) => a.recommendation === "SELL").length;

    const recRows = user.analyses
      .map(
        (a) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #1e1e2e;color:#94a3b8;font-size:13px;">
            ${new Date(a.createdAt).toLocaleDateString()}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #1e1e2e;">
            <span style="
              display:inline-block;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;
              background:${a.recommendation === "BUY" ? "rgba(34,197,94,0.15)" : a.recommendation === "SELL" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)"};
              color:${a.recommendation === "BUY" ? "#22c55e" : a.recommendation === "SELL" ? "#ef4444" : "#eab308"};
            ">${a.recommendation.replace("_", " ")}</span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #1e1e2e;color:#94a3b8;font-size:13px;">
            ${a.marketType.replace("_", " ")}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #1e1e2e;color:#6366f1;font-size:13px;font-weight:600;">
            ${a.confidence}%
          </td>
        </tr>`
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:580px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1,#a855f7);border-radius:16px;padding:28px 32px;margin-bottom:24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
        📈 Your Daily TradeSharp Digest
      </h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
        ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </p>
    </div>

    <!-- Stats row -->
    <div style="display:flex;gap:12px;margin-bottom:24px;">
      ${[
        { label: "Recent Scans", value: recentCount, color: "#6366f1" },
        { label: "BUY Signals", value: buys, color: "#22c55e" },
        { label: "SELL Signals", value: sells, color: "#ef4444" },
      ].map(s => `
        <div style="flex:1;background:#111118;border:1px solid #1e1e2e;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:${s.color};">${s.value}</div>
          <div style="font-size:12px;color:#64748b;margin-top:4px;">${s.label}</div>
        </div>
      `).join("")}
    </div>

    <!-- Recent analyses -->
    ${recentCount > 0 ? `
    <div style="background:#111118;border:1px solid #1e1e2e;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <div style="padding:16px 20px;border-bottom:1px solid #1e1e2e;">
        <h2 style="margin:0;font-size:15px;font-weight:700;color:#f1f5f9;">Recent Analyses</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#0d0d14;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#475569;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Date</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#475569;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Signal</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#475569;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Market</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#475569;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Confidence</th>
          </tr>
        </thead>
        <tbody>${recRows}</tbody>
      </table>
    </div>` : `
    <div style="background:#111118;border:1px solid #1e1e2e;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="color:#64748b;font-size:14px;margin:0;">No analyses yet today. Head to your dashboard to scan a market!</p>
    </div>`}

    <!-- Reminder + CTA -->
    <div style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.15));border:1px solid rgba(99,102,241,0.3);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 4px;color:#f1f5f9;font-size:14px;font-weight:600;">
        You're on the <strong style="color:#6366f1;text-transform:capitalize;">${plan}</strong> plan
        ${plan === "free" ? "— you have 10 free scans available today" : ""}
      </p>
      <p style="margin:0 0 16px;color:#94a3b8;font-size:13px;">
        ${plan === "free" ? "Upgrade for real AI analysis of your screenshots." : "Your plan is active. Keep scanning for an edge."}
      </p>
      <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/dashboard"
         style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;">
        Open Dashboard →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;">
      <p style="color:#334155;font-size:12px;margin:0;">
        TradeSharp · Not financial advice · For informational purposes only<br>
        <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/account" style="color:#475569;text-decoration:none;">
          Manage email preferences
        </a>
      </p>
    </div>
  </div>
</body>
</html>`;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TradeSharp <digest@tradesharp.app>",
          to: [user.email],
          subject: `📈 Your TradeSharp Daily Digest — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          html,
        }),
      });

      if (res.ok) {
        sent++;
      } else {
        console.error("Resend error for", user.email, await res.text());
        failed++;
      }
    } catch (err) {
      console.error("Email send failed for", user.email, err);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed, total: users.length });
}
