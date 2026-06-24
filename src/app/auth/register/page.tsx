"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertCircle, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordStrength = password.length === 0
    ? null
    : password.length < 6
    ? "weak"
    : password.length < 10
    ? "medium"
    : "strong";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email.toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/auth/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-text-primary text-xl">
              Trade<span className="text-primary">Sharp</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">
            Create your account
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Start with 10 free analyses per day
          </p>
        </div>

        {/* Free plan perks */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6">
          <p className="text-xs font-medium text-muted mb-3">
            Free plan includes:
          </p>
          <ul className="space-y-1.5">
            {[
              "10 analyses per day",
              "BUY/SELL/HOLD/NO BET signals",
              "Market type detection",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-xs text-text-secondary"
              >
                <Check className="h-3.5 w-3.5 text-success flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl bg-surface border border-border glow-card">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Name <span className="text-muted">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              autoComplete="new-password"
            />
            {passwordStrength && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {["weak", "medium", "strong"].map((level, i) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i === 0 && passwordStrength !== null
                          ? "bg-danger"
                          : i === 1 && (passwordStrength === "medium" || passwordStrength === "strong")
                          ? "bg-warning"
                          : i === 2 && passwordStrength === "strong"
                          ? "bg-success"
                          : "bg-surface-2"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs mt-1 ${
                  passwordStrength === "weak"
                    ? "text-danger"
                    : passwordStrength === "medium"
                    ? "text-warning"
                    : "text-success"
                }`}>
                  {passwordStrength === "weak" ? "Weak password" : passwordStrength === "medium" ? "Medium strength" : "Strong password"}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20">
              <AlertCircle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loading}
          >
            Create Free Account
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-muted mt-4">
          By creating an account, you agree to our{" "}
          <Link href="/disclaimer" className="text-primary hover:underline">
            Disclaimer
          </Link>
          . Not financial advice.
        </p>
      </div>
    </div>
  );
}
