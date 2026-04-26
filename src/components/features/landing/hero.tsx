'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function Hero() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const dest = isAuthenticated ? '/overview' : '/login';

  return (
    <section className="flex min-h-svh flex-col items-stretch border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-32 sm:py-40">
        {/* Wayfinding marker */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.02em] text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            ESAP-KB · v1
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up mt-6 max-w-3xl text-balance font-sans font-bold leading-[1.04] tracking-[-0.03em] text-foreground"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
        >
          Your enterprise data,
          <br />
          <span className="text-muted-strong">answered instantly.</span>
        </h1>

        <p className="animate-fade-up animation-delay-100 mt-6 max-w-lg text-pretty text-[17px] leading-[1.55] text-muted">
          ESAP-KB connects your databases and teams to an AI that knows your
          business. Ask in plain English. Ship answers in seconds.
        </p>

        <div className="animate-fade-up animation-delay-200 mt-9 flex flex-wrap items-center gap-3">
          <Link
            href={dest}
            className="group inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-medium text-[#111] transition-colors duration-150 hover:opacity-90 focus-visible:outline-none"
          >
            {isAuthenticated ? 'Go to dashboard' : 'Start for free'}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
          {!isAuthenticated && (
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors duration-150 hover:border-border-medium hover:bg-surface-200 focus-visible:outline-none"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
