'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const LOCALES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
] as const;

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'icon' | 'full';
}

export function LanguageSwitcher({ className, variant = 'full' }: LanguageSwitcherProps) {
  const t = useTranslations('common.languageSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  const current = LOCALES.find((l) => l.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2 h-8 text-[13px] font-medium text-muted',
          'transition-colors duration-[120ms] hover:text-foreground hover:bg-surface-300',
          'focus-visible:outline-none focus-visible:shadow-focus',
          className,
        )}
        aria-label={t('label')}
      >
        <Globe size={14} strokeWidth={1.5} aria-hidden />
        {variant === 'full' && (
          <span>{current?.label ?? locale.toUpperCase()}</span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[120px]">
        {LOCALES.map(({ code, label }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => switchLocale(code)}
            className={cn(
              'cursor-pointer text-[13px]',
              code === locale && 'text-accent font-medium',
            )}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
