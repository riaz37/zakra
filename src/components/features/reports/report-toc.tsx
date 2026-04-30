'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { GeneratedReportSection } from '@/types/report';

interface ReportTOCProps {
  sections: GeneratedReportSection[];
}

function formatIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export function ReportTOC({ sections }: ReportTOCProps) {
  const [activeId, setActiveId] = useState<string | null>(
    sections[0]?.id ?? null,
  );

  useEffect(() => {
    if (sections.length === 0) return;

    const elements = sections
      .map((s) => document.getElementById(`section-${s.id}`))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // The dashboard scroll container is <main>, not window
    const scrollRoot = document.querySelector('main') ?? null;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top -
              b.target.getBoundingClientRect().top,
          );
        if (visible[0]) {
          const id = visible[0].target.id.replace(/^section-/, '');
          setActiveId(id);
        }
      },
      {
        root: scrollRoot,
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const target = document.getElementById(`section-${id}`);
    if (target) {
      // scrollIntoView works on any scroll container, unlike window.scrollTo
      // scroll-mt-20 on the section element handles the sticky header offset
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-8 flex flex-col gap-3"
    >
      <p className="font-sans text-[11px] uppercase tracking-[0.06em] text-subtle">
        On this page
      </p>
      <ul className="flex flex-col gap-1.5">
        {sections.map((section, i) => {
          const isActive = activeId === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#section-${section.id}`}
                onClick={(e) => handleClick(e, section.id)}
                className={cn(
                  'flex items-baseline gap-2 truncate border-l-2 py-0.5 pl-2 font-sans text-[12px] transition-colors',
                  isActive
                    ? 'border-accent text-foreground'
                    : 'border-transparent text-muted hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[10px] tabular-nums',
                    isActive ? 'text-accent' : 'text-subtle',
                  )}
                >
                  {formatIndex(i)}
                </span>
                <span className="truncate">{section.title}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
