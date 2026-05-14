'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'cookie_consent';

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'all');
    setVisible(false);
  }

  function essentialOnly() {
    localStorage.setItem(CONSENT_KEY, 'essential');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border border-border bg-surface-200 p-5 shadow-elevated md:left-auto md:right-6 md:w-[420px]"
    >
      <p className="mb-1 font-sans text-sm font-semibold text-foreground">Cookies on Zakra</p>
      <p className="mb-3 font-sans text-xs leading-relaxed text-muted">
        We use cookies to keep your session secure, maintain your Company Context preference, and provide anonymous
        usage analytics. Database queries, reports, and credentials are handled through encrypted data pipelines, never cookies.
      </p>
      <div className="mb-3 space-y-1.5 text-xs text-muted">
        <div className="flex items-start gap-2">
          <span className="shrink-0 text-accent">✓</span>
          <span>
            <strong className="text-foreground">Essential</strong>: session, CSRF, Company Context. Required.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="shrink-0">○</span>
          <span>
            <strong className="text-foreground">Analytics</strong>: anonymous platform usage. Optional.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={accept}
          className="rounded-md bg-accent px-4 py-2 font-sans text-xs font-medium text-accent-fg transition-opacity hover:opacity-90"
        >
          Accept
        </button>
        <button
          onClick={essentialOnly}
          className="rounded-md border border-border px-4 py-2 font-sans text-xs text-muted transition-colors hover:text-foreground"
        >
          Essential Only
        </button>
        <Link
          href="/cookies"
          className="ml-auto font-sans text-xs text-muted underline-offset-2 transition-colors hover:text-foreground hover:underline"
        >
          Cookie Policy
        </Link>
      </div>
    </div>
  );
}
