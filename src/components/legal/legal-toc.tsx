'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TocItem {
  id: string;
  label: string;
  sub?: string; // optional prefix (e.g. section number for Terms)
}

interface LegalTocProps {
  items: TocItem[];
}

export function LegalToc({ items }: LegalTocProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    if (headings.length === 0) return;

    // Track which sections are visible — pick the topmost one
    const visibleIds = new Set<string>();

    headings.forEach((el) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visibleIds.add(el.id);
          } else {
            visibleIds.delete(el.id);
          }
          // Find the first heading in document order that's visible
          const first = headings.find((h) => visibleIds.has(h.id));
          if (first) setActiveId(first.id);
        },
        { rootMargin: '-10% 0px -60% 0px', threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [items]);

  return (
    <nav className="sticky top-24 w-52">
      <p className="mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-muted">
        On this page
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  'flex items-baseline gap-2 rounded px-2 py-1 font-sans text-xs transition-colors duration-150',
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-muted hover:bg-surface-300 hover:text-foreground',
                )}
              >
                {item.sub && (
                  <span className={cn('font-mono shrink-0', isActive ? 'text-accent' : 'text-accent/50')}>
                    {item.sub}
                  </span>
                )}
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
