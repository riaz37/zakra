import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-200">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <span className="text-[14px] font-semibold tracking-[-0.01em] text-foreground">
            ESAP-KB Admin
          </span>
          <span className="font-mono text-[11px] text-muted">
            © {year} ESAP. All rights reserved.
          </span>
        </div>

        <nav aria-label="Footer" className="flex items-center gap-6">
          <a
            href="mailto:support@esap.com"
            className="text-[14px] text-muted transition-colors duration-150 hover:text-foreground"
          >
            Contact
          </a>
          <Link
            href="/login"
            className="text-[14px] text-muted transition-colors duration-150 hover:text-foreground"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
