import { HeroSection } from "@/components/marketing/hero-section";
import { StatsSection } from "@/components/marketing/stats-section";
import { NichesSection } from "@/components/marketing/niches-section";
import { AgentsSection } from "@/components/marketing/agents-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { CtaSection } from "@/components/marketing/cta-section";

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