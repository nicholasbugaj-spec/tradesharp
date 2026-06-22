import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Reviews } from "@/components/landing/reviews";
import { CTA } from "@/components/landing/cta";
import { TickerTape } from "@/components/landing/ticker-tape";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TickerTape />
      <Features />
      <Reviews />
      <CTA />
    </>
  );
}
