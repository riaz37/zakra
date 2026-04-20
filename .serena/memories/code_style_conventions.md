# Code Style & Conventions

## TypeScript
- Strict mode on. No `any`, no `as unknown as`.
- Always type API request/response via `src/types/<resource>.ts`.
- Use `import type` for type-only imports.

## React / Next.js 16
- Server Components by default. Add `'use client'` only when state, effects, or
  browser APIs are required (auth/store/forms typically need it).
- Read `node_modules/next/dist/docs/` before assuming Next.js API behavior — Next 16
  has breaking changes vs. older training data.
- Path alias `@/*` for internal imports. No relative `../../../` chains.

## Styling
- Tailwind CSS v4 (CSS-first config in `src/app/globals.css` via `@theme`).
- Use the `cn()` helper from `src/lib/utils` for all conditional class merging.
- Use semantic tokens (`bg-background`, `text-foreground`) — never raw hex.
- Follow `DESIGN.md` for color, type, spacing, radius, motion (Cursor-inspired).

## Components
- Prefer shadcn/ui primitives in `src/components/ui/`. Add new ones via
  `pnpm dlx shadcn@latest add <component>`.
- Compose with `@base-ui/react` only when shadcn doesn't cover the primitive.
- Icons: lucide-react, sized to surrounding type.
- Toasts: sonner (single notification library — don't add another).

## Data
- All HTTP through `src/api/axios.ts`. Never call `fetch()` or `axios.create()`
  in components or hooks.
- Server state in TanStack Query hooks (`src/hooks/use<Resource>.ts`).
- Client state in Zustand. Never mirror server data into Zustand.
- Mutations call `invalidateQueries` on success — stale data on screen is a bug.

## Forms
- react-hook-form + zod schema. Define schema first, infer type via `z.infer`.
- Use shadcn Form primitives (Form/FormField/FormItem/…). No raw `<input>`.
- Map server field errors back via `setError(field, { message })`.

## Auth
- Tokens in `localStorage` under keys from `src/utils/constants.ts`.
- Read/write only via helpers in `src/api/axios.ts` (`getAccessToken`, etc.).
- 401 refresh is automatic via interceptor queue — don't refresh manually.
- Never log tokens or full Authorization headers.

## File Organization
- Many small files > few large files. ~200-400 lines typical, 800 max.
- Organize by feature/domain, not by type.
