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
