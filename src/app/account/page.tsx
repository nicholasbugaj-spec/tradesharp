"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPlan, PLANS } from "@/lib/plans";
import { Plan } from "@/types";
import {
  User,
  CreditCard,
  Shield,
  Zap,
  Check,
  ArrowRight,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/account");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const plan = ((session?.user as { plan?: string })?.plan ?? "elite") as Plan;
  const planDef = getPlan(plan);

  const handleUpgrade = async (targetPlan: Plan) => {
    setUpgrading(targetPlan);
    // Mock Stripe redirect — in production, this would call /api/stripe/checkout
    await new Promise((r) => setTimeout(r, 1500));
    alert(
      `Stripe integration required. In production, this would redirect to a Stripe checkout for the ${PLANS[targetPlan].name} plan at ${PLANS[targetPlan].priceLabel}.`
    );
    setUpgrading(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
          <User className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Account</h1>
          <p className="text-sm text-text-secondary">
            Manage your profile and subscription
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-muted" />
              <h2 className="text-base font-semibold text-text-primary">
                Profile
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted mb-1">Email</p>
                <p className="text-sm text-text-primary">
                  {session?.user?.email ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Name</p>
                <p className="text-sm text-text-primary">
                  {session?.user?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Member since</p>
                <div className="flex items-center gap-1.5 text-sm text-text-primary">
                  <Calendar className="h-3.5 w-3.5 text-muted" />
                  Today
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current plan card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted" />
                <h2 className="text-base font-semibold text-text-primary">
                  Current Plan
                </h2>
              </div>
              <Badge
                variant={
                  plan === "elite"
                    ? "accent"
                    : plan === "basic"
                    ? "primary"
                    : "default"
                }
                className="text-sm px-3 py-1"
              >
                {plan === "elite" && <Zap className="h-3 w-3 mr-1" />}
                {planDef.name}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl mb-4">
              <div>
                <p className="text-2xl font-black text-text-primary">
                  {planDef.priceLabel}
                </p>
                <p className="text-sm text-text-secondary">
                  {planDef.uploadsPerDay === null
                    ? "Unlimited analyses per day"
                    : `${planDef.uploadsPerDay} analyses per day`}
                </p>
              </div>
              {plan !== "basic" && (
                <div className="text-right">
                  <p className="text-xs text-muted">Renews</p>
                  <p className="text-sm text-text-primary">Monthly</p>
                </div>
              )}
            </div>

            {/* Plan features */}
            <ul className="space-y-2 mb-4">
              {planDef.features
                .filter((f) => f.included)
                .map((feature) => (
                  <li
                    key={feature.text}
                    className="flex items-center gap-2 text-sm text-text-secondary"
                  >
                    <Check className="h-3.5 w-3.5 text-success flex-shrink-0" />
                    {feature.text}
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>

        {/* Upgrade options */}
        {plan !== "elite" && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-muted" />
                <h2 className="text-base font-semibold text-text-primary">
                  Upgrade Options
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(["basic", "elite"] as Plan[])
                  .filter((p) => p !== plan)
                  .map((targetPlan) => {
                    const tp = PLANS[targetPlan];
                    return (
                      <div
                        key={targetPlan}
                        className="p-4 rounded-xl border border-border hover:border-primary/30 bg-surface-2 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-text-primary">
                            {tp.name}
                          </h3>
                          <span className="text-lg font-bold text-text-primary">
                            {tp.priceLabel}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mb-3">
                          {tp.description}
                        </p>
                        <Button
                          size="sm"
                          className="w-full"
                          loading={upgrading === targetPlan}
                          onClick={() => handleUpgrade(targetPlan)}
                        >
                          Upgrade to {tp.name}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
              </div>

              <p className="text-xs text-muted mt-4 text-center">
                Stripe integration required for real payments.{" "}
                <Link href="/pricing" className="text-primary hover:underline">
                  View full plan comparison →
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Danger zone */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-danger mb-2">
              Danger Zone
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              These actions are irreversible. Please proceed with caution.
            </p>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
