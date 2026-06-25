import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "./providers";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { PromoBanner } from "@/components/landing/promo-banner";

export const metadata: Metadata = {
  title: "TradeSharp — AI-Powered Trading Indicators",
  description:
    "Upload screenshots of betting and prediction markets. Get instant AI-powered BUY/SELL/HOLD signals with confidence scores.",
  keywords: [
    "trading indicator",
    "betting analysis",
    "prediction markets",
    "AI trading",
    "sports betting",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-text-primary flex flex-col">
        <GoogleAnalytics />
        <Providers>
          <PromoBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
