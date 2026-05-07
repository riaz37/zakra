import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main
        role="main"
        className="flex flex-1 flex-col items-center justify-center px-4 py-8 overflow-y-auto"
      >
        {children}
      </main>
      <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-4">
        <p className="font-sans text-xs text-muted">
          © {new Date().getFullYear()} Empowering Energy (trading as ESAP AI)
        </p>
        <nav className="flex gap-4">
          <Link href="/privacy" className="font-sans text-xs text-muted transition-colors hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="font-sans text-xs text-muted transition-colors hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/cookies" className="font-sans text-xs text-muted transition-colors hover:text-foreground">
            Cookie Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
