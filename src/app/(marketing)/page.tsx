import dynamic from "next/dynamic";
import { HeroSection } from "@/components/marketing/hero-section";

// Below-the-fold sections are dynamically imported so their JS (each one is
// its own GSAP/ScrollTrigger animation, on top of the hero's) ships as
// separate chunks instead of one large bundle the browser must parse before
// the page feels interactive. Content is still server-rendered (ssr: true,
// the default) — this only changes how the JS is chunked/loaded, not what's
// in the initial HTML, so SEO and first paint are unaffected.
const StatsSection = dynamic(() => import("@/components/marketing/stats-section").then((m) => m.StatsSection));
const NichesSection = dynamic(() => import("@/components/marketing/niches-section").then((m) => m.NichesSection));
const AgentsSection = dynamic(() => import("@/components/marketing/agents-section").then((m) => m.AgentsSection));
const FeaturesSection = dynamic(() => import("@/components/marketing/features-section").then((m) => m.FeaturesSection));
const CtaSection = dynamic(() => import("@/components/marketing/cta-section").then((m) => m.CtaSection));

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <NichesSection />
      <AgentsSection />
      <FeaturesSection />
      <CtaSection />
    </>
  );
}
