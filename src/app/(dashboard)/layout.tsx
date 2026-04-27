'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useAuth, useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, fetchUser } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    void fetchUser().then(() => {
      if (!useAuthStore.getState().isAuthenticated) {
        router.replace('/login');
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeNav = useCallback(() => {
    setNavOpen(false);
  }, []);

  const openNav = useCallback(() => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    setNavOpen(true);
  }, []);

  // Escape-to-close + focus trap while overlay is open.
  useEffect(() => {
    if (!navOpen) return;

    const overlay = overlayRef.current;
    closeButtonRef.current?.focus();

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setNavOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !overlay) return;

      const focusable = overlay.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      lastFocusedRef.current?.focus();
    };
  }, [navOpen]);

  return (
    <div className="flex h-dvh flex-col bg-background md:flex-row">
      {/* Mobile top bar (<768px) */}
      <Header navOpen={navOpen} onOpenNav={openNav} />

      {/* Tablet rail (768–1023px) — icon-only */}
      <div className="hidden md:block lg:hidden">
        <Sidebar variant="rail" />
      </div>

      {/* Desktop sidebar (≥1024px) — full 240px */}
      <div className="hidden lg:block">
        <Sidebar variant="full" />
      </div>

      {/* Mobile slide-in overlay */}
      <div
        aria-hidden={!navOpen}
        className={cn(
          'fixed inset-0 z-40 md:hidden',
          navOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        {/* Backdrop */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close navigation"
          onClick={closeNav}
          className={cn(
            'absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity duration-200',
            navOpen ? 'opacity-100' : 'opacity-0',
          )}
        />

        {/* Drawer */}
        <div
          ref={overlayRef}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
          className={cn(
            'absolute left-0 top-0 h-dvh w-60 transform transition-transform duration-200 ease-out',
            navOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="relative h-full">
            <Sidebar variant="overlay" onNavigate={closeNav} />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeNav}
              aria-label="Close navigation"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-300 text-foreground shadow-ring transition-all duration-200 hover:text-error hover:shadow-focus focus-visible:text-error focus-visible:shadow-focus focus-visible:outline-none"
            >
              <X aria-hidden size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
