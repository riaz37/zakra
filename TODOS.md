# TODOS

## Design / UI

### Dark mode visual polish pass
**What:** Step through every admin route in dark mode after the design-contract-repair plan lands (tokens + fonts + monolith split). Catch contrast issues, invisible focus rings, surface-on-surface collisions.
**Why:** Bridge-layer tokens auto-derive dark values from shadcn canon, so the math is right, but semantic choices (`--warning-soft` in dark, `--info-soft` opacity) need human judgement on real screens.
**Pros:** Catches issues auto-derivation can miss. Keeps dark mode shippable.
**Cons:** ~30 min of focused work.
**Context:** Run after Phase 3 of `~/.gstack/projects/kb-next/ceo-plans/2026-04-21-design-contract-repair.md` lands. Before running, have design-contract-repair Phase 1-3 merged.
**Depends on:** design-contract-repair plan Phases 1-3 complete.

### Formal accessibility audit
**What:** Keyboard nav through every admin flow (tab order, escape closes dialogs, sidebar reachable from keyboard). Screen reader labels on icon buttons (lucide icons wrapped with aria-label). WCAG AA contrast check on all token combinations (light + dark). Focus states visible on all interactive elements.
**Why:** Token contract repair addresses visible wayfinding transitively (focus rings, body-text contrast), but doesn't formally audit keyboard flow, SR semantics, or contrast on secondary color pairs (--fg-subtle on --surface-muted, etc.).
**Pros:** Ships admin tool that doesn't exclude keyboard / screen-reader users. Catches focus-trap bugs in dialogs and sheets.
**Cons:** ~2-3 hours with proper tooling (axe DevTools + VoiceOver manual pass).
**Context:** Use axe DevTools browser extension for automated pass, then manual keyboard + VoiceOver/NVDA walk-through of login → dashboard → users → connections → chat. Doc findings here, fix in follow-up PR.
**Depends on:** design-contract-repair plan complete (tokens land so focus rings are visible to test).

### Error states on admin data tables
**What:** Add error states to all admin data tables when TanStack Query fetch fails: users, companies, db-connections, roles, reports. Currently a failed fetch leaves the table in perpetual loading or blank state with no user feedback.
**Why:** Users hitting a 5xx or network error see nothing actionable. A warm error card with retry action (using `border-error/20 bg-error/5` token pattern already used in forms) gives users a recovery path.
**Pros:** Prevents "is the page broken or loading?" confusion. Consistent with error state pattern already in login form.
**Cons:** Need to add error handling to every DataTable usage (5-6 pages). Low risk, mechanical.
**Context:** Use the shared `EmptyState` component pattern (already in `src/components/shared/`) or a new `ErrorState` shared component. Pattern: `{ isError, error, refetch }` from `useQuery`. Surface from `plan-design-review` on 2026-04-22.
**Depends on:** None.

### Reports pages design audit
**What:** Full design review of all `/reports/*` sub-routes: history list, templates list, template detail, template new, AI generate flow, report viewer.
**Why:** These pages were not covered in the 2026-04-22 design review. The report viewer uses a sandboxed iframe (existing decision logged in Serena memory). The other pages — template creation, AI generate flow — are unknown state and may have inconsistencies with the design system.
**Pros:** Ensures the entire reporting surface follows DESIGN.md and proper UX patterns.
**Cons:** ~1-2 hours. Needs dev server running for visual review.
**Context:** Surfaced from `plan-design-review` on 2026-04-22. Report viewer iframe pattern is correct per user preference (sandboxed, prevents style bleed). Audit the other pages for inline style usage, interaction states, and type scale compliance.
**Depends on:** Chat page inline style migration complete (establishes the pattern to check against).

## Bugs (surfaced by E2E baseline)

### API contract mismatches on /dashboard and /chat
**What:** Multiple HTTP 400 responses on `/dashboard` (4 requests) and `/chat` (2 requests) when loaded with valid auth. Page renders the admin shell but data tiles/empty states show because data calls fail. No JS pageerror — backend rejects request shape silently.
**Why:** Likely query-param shape, body shape, or endpoint version drift between frontend hooks (`src/hooks/use*`) and backend (`https://edgingly-grimiest-madyson.ngrok-free.dev/api/v1`). Pre-existed Phase 0 — surfaced when Playwright auth setup made first authenticated calls.
**Pros:** Fixing makes dashboard/chat actually usable end-to-end.
**Cons:** Need backend OpenAPI/contract reference to identify exact mismatch per request.
**Context:** Currently masked in `tests/e2e/smoke-admin-routes.spec.ts` via `IGNORED_CONSOLE_PATTERNS` (regex on `status of 4xx`). When fixed, tighten the regex back to strict.
**Repro:** Run `pnpm test:e2e:update` after auth setup, watch DevTools network tab on /dashboard or /chat for the failing requests; compare payload to backend swagger.

### table-access throws `permissions.data is not iterable`
**What:** `/table-access` page throws a runtime `TypeError: permissions.data is not iterable`. Code expects `permissions.data` to be an array but the API returns an object (or null/undefined) wrapper.
**Why:** Frontend type assumption diverges from actual API response shape. Either the type in `src/types/` is wrong or the hook unwraps the response incorrectly.
**Pros:** Fix unblocks the entire table-access page (currently shows error boundary or blank).
**Cons:** Need a sample response payload to model the correct type.
**Context:** Currently masked in `tests/e2e/smoke-admin-routes.spec.ts` via `IGNORED_CONSOLE_PATTERNS` (regex on `permissions\.data is not iterable`). When fixed, remove the ignore line.
**Repro:** Visit `/table-access` while authenticated; observe the page error.
