import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CtaBand() {
  return (
    <section
      className="border-t border-accent-border bg-accent-soft"
      aria-labelledby="cta-band-heading"
    >
      <div className="mx-auto w-full max-w-4xl px-6 py-24 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
          Ready when you are
        </span>
        <h2
          id="cta-band-heading"
          className="mx-auto mt-5 max-w-2xl text-balance font-sans text-[2rem] font-semibold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[2.375rem]"
        >
          Ready to see ESAP-KB in action?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.55] text-muted">
          Connect your first database in minutes. No credit card required.
        </p>

        <div className="mt-9 flex justify-center">
          <Link
            href="/login"
            className="group inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-medium text-[#111] transition-colors duration-150 hover:bg-[var(--primary-hover)] focus-visible:outline-none"
          >
            Get started
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
