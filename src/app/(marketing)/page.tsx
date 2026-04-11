import { HeroSection } from "@/components/marketing/hero-section";
import { AutomationsSection } from "@/components/marketing/automations-section";
import { AgentsSection } from "@/components/marketing/agents-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { StatsSection } from "@/components/marketing/stats-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { CtaSection } from "@/components/marketing/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AutomationsSection />
      <AgentsSection />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}