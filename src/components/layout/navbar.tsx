"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  LayoutDashboard,
  History,
  User,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { href: "/pricing", label: "Pricing" },
    { href: "/store", label: "Store" },
    { href: "/disclaimer", label: "Disclaimer" },
  ];

  const authLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/store", label: "Store", icon: ShoppingCart },
    { href: "/history", label: "History", icon: History },
    { href: "/account", label: "Account", icon: User },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-text-primary text-lg hidden sm:block">
              Trade<span className="text-primary">Sharp</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-2 transition-all"
              >
                {link.label}
              </Link>
            ))}
            {status === "authenticated" &&
              authLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-2 transition-all flex items-center gap-1.5"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {status === "loading" ? (
              <div className="h-8 w-24 bg-surface-2 rounded-lg animate-pulse" />
            ) : status === "authenticated" ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-2 transition-all text-text-secondary hover:text-text-primary"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                    {session.user?.email?.[0].toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm">{session.user?.email?.split("@")[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-xl py-1 z-50">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs text-muted">Signed in as</p>
                      <p className="text-sm text-text-primary font-medium truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Account
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-all w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface py-2">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {status === "authenticated" && (
              <>
                <div className="border-t border-border my-2" />
                {authLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border my-2" />
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-danger w-full rounded-lg hover:bg-danger/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            )}
            {status !== "authenticated" && (
              <div className="flex gap-2 pt-2 border-t border-border mt-2">
                <Link href="/auth/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
