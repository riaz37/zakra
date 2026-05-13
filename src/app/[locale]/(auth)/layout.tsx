import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('auth.layout');

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
          {t('copyright', { year: new Date().getFullYear() })}
        </p>
        <nav className="flex gap-4">
          <Link href="/privacy" className="font-sans text-xs text-muted transition-colors hover:text-foreground">
            {t('privacy')}
          </Link>
          <Link href="/terms" className="font-sans text-xs text-muted transition-colors hover:text-foreground">
            {t('terms')}
          </Link>
          <Link href="/cookies" className="font-sans text-xs text-muted transition-colors hover:text-foreground">
            {t('cookies')}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
