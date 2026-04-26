import type { Metadata } from 'next';
import { Nav } from '@/components/features/landing/nav';
import { Hero } from '@/components/features/landing/hero';
import { Features } from '@/components/features/landing/features';
import { CtaBand } from '@/components/features/landing/cta-band';
import { Footer } from '@/components/features/landing/footer';

export const metadata: Metadata = {
  title: 'ESAP-KB — Your enterprise data, answered instantly.',
  description:
    'ESAP-KB connects your databases and teams to an AI that knows your business. Ask in plain English. Ship answers in seconds.',
};

export default function LandingPage() {
  return (
    <main className="bg-background text-foreground">
      <Nav />
      <Hero />
      <Features />
      <CtaBand />
      <Footer />
    </main>
  );
}
