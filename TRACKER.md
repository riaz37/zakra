# Bug Fix Tracker — May 2026

> Plan: `docs/BUGFIX_PLAN.md`  
> Update status as items complete: `[ ]` → `[x]`  
> Last updated: 2026-05-14

---

## Lane A — Company CRUD Bugs

| # | Task | File | Status |
|---|------|------|--------|
| A1a | Status Select: `defaultValue` → `value={field.value}` | `company-form.tsx` | [x] |
| A1b | Add `isEditing` prop; make slug read-only when editing | `company-form.tsx` | [x] |
| A1c | Make parent_id read-only (show name text) when editing | `company-form.tsx` | [x] |
| A2 | Subsidiary dialog: remove parent dropdown, add "Subsidiary of: X" label | `companies/page.tsx` | [x] |
| A3 | Fix `description` in handleUpdate: `\|\|` → `??` | `companies/page.tsx` | [x] |
| A4 | Remove `company_type:'parent'` filter from parentOptions fetch | `companies/page.tsx` | [x] |

---

## Lane B — User CRUD

| # | Task | File | Status |
|---|------|------|--------|
| B1 | Add `sort_by:'created_at', sort_order:'desc'` to `useUsers` | `hooks/useUsers.ts` | [x] |
| B2a | Add Edit button to user detail page header | `users/[id]/page.tsx` | [x] |
| B2b | Add edit FormDialog with first_name, last_name, user_type fields | `users/[id]/page.tsx` | [x] |
| B2c | Wire edit form to `useUpdateUser` hook | `users/[id]/page.tsx` | [x] |

---

## Lane C — Company Ordering

| # | Task | File | Status |
|---|------|------|--------|
| C1 | Add `sort_by:'created_at', sort_order:'desc'` to `useCompanies` | `hooks/useCompanies.ts` | [x] |

---

## Lane D — Branding + Toasts

| # | Task | File | Status |
|---|------|------|--------|
| D1a | Change title: `"Zakra Admin"` → `"ESAP KB"` | `app/layout.tsx` | [x] |
| D1b | Add favicon: `/logo/esaplogo.webp` | `app/layout.tsx` | [x] |
| D2a | Fix toast messages in rule-dialog | `db-connections/rule-dialog.tsx` | [x] |
| D2b | Fix toast messages in schema-explorer-tab | `db-connections/schema-explorer-tab.tsx` | [x] |
| D2c | Fix toast messages in add-connection-dialog | `db-connections/add-connection-dialog.tsx` | [x] |
| D2d | Fix toast messages in business-rules-tab | `db-connections/business-rules-tab.tsx` | [x] |

---

## Lane E — Localization + Language Switcher

| # | Task | File | Status |
|---|------|------|--------|
| E1a | Add `useTranslations('dashboard.nav')` to sidebar; map NAV_ITEMS labels through `t()` | `layout/sidebar.tsx` | [x] |
| E1b | Add `<LanguageSwitcher variant="full">` above user footer (full sidebar) | `layout/sidebar.tsx` | [x] |
| E1c | Add `<LanguageSwitcher variant="icon">` in collapsed rail footer | `layout/sidebar.tsx` | [x] |
| E2 | Add `nav` namespace to English messages | `messages/en.json` | [x] already existed |
| E3 | Add `nav` namespace to Arabic messages | `messages/ar.json` | [x] already existed |

---

## Lane F — Chat Behavior

| # | Task | File | Status |
|---|------|------|--------|
| F1a | Move `router.push` inside try block — only navigate on sendMessage success | `chat/page.tsx` | [x] |
| F1b | Add 403-specific toast: "You don't have access to this database" | `chat/page.tsx` | [x] |
| F2 | Verify report ID format in streaming response; add hyperlink rendering | `chat/streaming-response.tsx` | [x] already done — `ReportLinkBlock` renders `href={report.page_url}` |

---

## Needs Verification (before implementing)

| # | Issue | Action | Status |
|---|-------|--------|--------|
| V1 | #4 Search filter not working | Confirmed working: `search=admin` param sent in API call `GET /api/v1/users?sort_by=created_at&sort_order=desc&page_size=10&search=admin → 200` | [x] |
| V2 | #5 Charts need tweaking | Fixed: ported full aggregation engine from `kb/` reference app into `query-result-block.tsx` — client-side `aggregateForAxis`/`aggregateBy`, `group_column` multi-series, `scatter` type, number formatting (K/M), pie "Other" collapsing. Backend `aggregation` field (`sum`/`avg`/`count`/`min`/`max`) now honoured. | [x] |
| V3 | #6 Report markdown extra quotes | Inspected HR Report in browser — text is clean prose, no extra wrapping quotes. Not a frontend bug. | [x] |
| V4 | #14 User selector shows ID | Fixed: added `label` prop to SelectItem in `companies/[id]/page.tsx` | [x] |

---

---

## Lane G — Users Table & Pagination

| # | Task | File | Status |
|---|------|------|--------|
| G1 | Make users table rows clickable → navigate to `/users/{id}` | `users/page.tsx` | [x] |
| G2 | Add Edit button to users table (always visible, outline-icon variant) | `users-columns.tsx` | [x] |
| G3 | Extract `EditUserForm` as shared component; wire to list + detail pages | `features/users/edit-user-form.tsx` | [x] |
| G4 | Fix pagination: backend uses `skip`/`limit` not `page`/`page_size` | `api/users.ts`, `api/companies.ts` | [x] |
| G5 | Fix search: backend has no server-side search — client-side filter on email/first_name/last_name | `hooks/useUsers.ts` | [x] |

---

## Closed / Deferred

| # | Issue | Resolution |
|---|-------|-----------|
| ✅ | #2 Book a demo mailto | Already implemented in `DemoSection.tsx` + `HeroSection.tsx` |
| ⏸ | #9 Suggested chat queries | Deferred — needs discussion with Nabil |
