# Task Completion Checklist

Run before declaring any task done.

## Always
- [ ] `pnpm lint` passes (no new warnings/errors).
- [ ] `pnpm build` passes (catches type errors and Next.js build issues).
- [ ] No `any`, no `as unknown as`, no untyped API responses.
- [ ] No `fetch()` or `axios.create()` outside `src/api/axios.ts`.
- [ ] No tokens in logs or telemetry.

## UI Changes
- [ ] Matches `DESIGN.md` (color, type, spacing, radius, motion).
- [ ] Uses semantic tokens, not raw hex.
- [ ] Uses `cn()` for conditional classes.
- [ ] Tested in both light and dark themes.
- [ ] Verified in the browser (`pnpm dev`) — golden path + at least one edge case.

## Data Changes
- [ ] New endpoint lives in `src/api/<resource>.ts`.
- [ ] Wrapped in a TanStack Query hook in `src/hooks/use<Resource>.ts`.
- [ ] Mutations call `invalidateQueries` for affected keys.
- [ ] Types added to `src/types/<resource>.ts`.

## Forms
- [ ] zod schema defined and used as the resolver.
- [ ] Uses shadcn Form primitives (Form/FormField/FormItem/…).
- [ ] Default values provided for every field.
- [ ] Server field errors mapped via `setError`.

## Auth
- [ ] No direct `localStorage` token access — uses `axios.ts` helpers.
- [ ] No manual 401 handling — relies on the interceptor.
- [ ] Routes/components gated on role/permission, not raw user fields.

## Tests
- [ ] If a test framework is wired: tests written first, ≥80% diff coverage.
- [ ] If no framework yet: validate manually in the browser and document the steps.

## Final
- [ ] Commit message follows `<type>: <description>` (feat/fix/refactor/docs/test/chore/perf/ci).
- [ ] No `console.log` debris.
