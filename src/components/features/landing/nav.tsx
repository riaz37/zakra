'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export function Nav() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background-translucent backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          aria-label="ESAP-KB home"
          className="flex items-center gap-2.5 rounded-sm focus-visible:outline-none"
        >
          <Image
            src="/logo/esaplogo.webp"
            alt="ESAP"
            width={28}
            height={28}
            priority
            className="shrink-0"
          />
          <Image
            src="/logo/esaplogo.svg"
            alt="ESAP employer solutions"
            width={65}
            height={21}
            priority
            className="shrink-0"
          />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1">
          <Link
            href="#features"
            className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground sm:inline-flex"
          >
            Features
          </Link>
          <a
            href="mailto:support@esap.com"
            className="hidden rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground sm:inline-flex"
          >
            Contact
          </a>
          <Link
            href={isAuthenticated ? '/overview' : '/login'}
            className="ml-2 inline-flex h-8 items-center justify-center rounded-lg bg-accent px-3 text-sm font-medium text-[#111] transition-colors duration-150 hover:opacity-90 focus-visible:outline-none"
          >
            {isAuthenticated ? 'Dashboard' : 'Sign in'}
          </Link>
        </nav>
      </div>
    </header>
  );
}
