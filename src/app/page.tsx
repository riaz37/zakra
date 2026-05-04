import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { LogoBar } from "@/components/landing/LogoBar";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { DemoSection } from "@/components/landing/DemoSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function RootPage() {
  return (
    <div className="min-h-screen" style={{ background: "#111110" }}>
      <LandingNav />
      <main>
        <HeroSection />
        <LogoBar />
        <StatsSection />
        <FeaturesSection />
        <DemoSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
