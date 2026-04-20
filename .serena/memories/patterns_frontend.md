# Frontend Patterns

## Component Source
- shadcn/ui primitives in `src/components/ui/` — install via
  `pnpm dlx shadcn@latest add <component>`. Don't hand-roll Radix wrappers.
- `@base-ui/react` for primitives shadcn doesn't ship.
- Compose feature components on top of primitives; keep primitives un-customized
  unless the design genuinely requires it.

## Styling
- Tailwind v4 — config is CSS-first inside `src/app/globals.css` (`@theme`, `@layer`).
  No `tailwind.config.js`.
- `cn()` from `src/lib/utils` for all conditional classes.
- Semantic tokens (`bg-background`, `text-foreground`, `border-border`) — never raw hex.
- Follow `DESIGN.md` for color, type, spacing, radius, motion. Cursor-inspired warm
  minimalism: warm cream surfaces, oklab borders, CursorGothic/jjannon/berkeleyMono.

## Theme
- `next-themes` is wired. Use the theme provider at the root.
- Toggling theme should flip semantic tokens — don't write `dark:` overrides for
  every utility.

## Icons & Toasts
- Icons: lucide-react. Match stroke and size to surrounding type (typically 16/18/20).
- Toasts: sonner, single source of truth.

## Tables
- `@tanstack/react-table` with the shadcn data-table pattern (column defs +
  reusable `<DataTable>` shell). No bespoke table markup.

## Charts
- recharts. Use design tokens for fill/stroke, no rainbow palettes.

## Server vs Client
- Default: Server Component.
- `'use client'` only when you need state, effects, refs, browser APIs, or hooks
  that touch them (TanStack Query, Zustand, react-hook-form).
- Pages that just compose Server Components should not be client.

## AI-Slop Avoidance
- No gradient soup, no rainbow shadows, no emoji icons in UI chrome.
- No purple-everywhere, no "futuristic" glow stacks.
- Stay disciplined to `DESIGN.md`.
