'use client';

import Image from 'next/image';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

export interface HeaderProps {
  navOpen: boolean;
  onOpenNav: () => void;
}

export function Header({ navOpen, onOpenNav }: HeaderProps) {
  const t = useTranslations('dashboard.header');

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background-translucent px-4 backdrop-blur-md md:hidden min-h-topbar',
      )}
    >
      <div className="flex items-center gap-2">
        <Image
          src="/logo/zakralogo.png"
          alt="Zakra"
          width={80}
          height={24}
          className="shrink-0"
          priority
        />
      </div>

      <div className="flex items-center gap-1">
        <LanguageSwitcher variant="icon" />
        <button
          type="button"
          onClick={onOpenNav}
          aria-label={t('openNavLabel')}
          aria-expanded={navOpen}
          aria-controls="mobile-navigation"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-300 text-foreground shadow-ring transition-all duration-200 hover:text-error hover:shadow-focus focus-visible:text-error focus-visible:shadow-focus focus-visible:outline-none"
        >
          <Menu aria-hidden size={16} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
