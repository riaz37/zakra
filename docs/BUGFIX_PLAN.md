# Bug Fix & Feature Plan — May 2026

**Branch:** main  
**Reviewed:** 2026-05-14  
**Scope:** 17 reported issues → 15 actionable (1 closed, 1 deferred)

---

## Status at a Glance

| Lane | Workstream | Issues | Status |
|------|-----------|--------|--------|
| A | Company CRUD bugs | #15, #16, #17 | Pending |
| B | User CRUD | #11, #13 | Pending |
| C | Company ordering | #10 | Pending |
| D | Branding + Toasts | #1, #3 | Pending |
| E | Localization + Language Switcher | #7, new | Pending |
| F | Chat behavior | #8, #12 | Pending |
| — | Search filter verification | #4 | Pending |
| — | Charts tweaking | #5 | Pending |
| — | Report markdown quotes | #6 | Pending |
| ✅ | Book a Demo mailto | #2 | Already done |
| ⏸ | Suggested queries in chat | #9 | Deferred — needs Nabil |

---

## Architecture Decisions Made

| Decision | Choice | Reason |
|----------|--------|--------|
| D1: Slug + parent_id editable in company edit? | **No — read-only** | Confirmed from `kb/` reference: `CompanyUpdate` has neither field. Backend does not support updating them. |
| D2: New items ordering | **Pass `sort_by=created_at&sort_order=desc`** | `QueryParams` type in kb/ uses `sort_by` + `sort_order`, not `ordering`. |
| D3: User edit UX | **Edit dialog** | Consistent with existing company edit pattern. `useUpdateUser` hook already exists. |
| D4: Sidebar nav i18n | **`useTranslations('nav')` in sidebar.tsx** | Keeps constants.ts as pure data; no coupling in NavItem primitive. |

---

## Workstream A — Company CRUD Bugs

**Issues:** #15 (parent editable in subsidiary creation), #16 (form not pre-filled on edit), #17 (slug/parent/description not saved)

### Root Causes

| Bug | Location | Root Cause |
|-----|----------|-----------|
| #17 slug not saved | `companies/page.tsx:206-213` | `handleUpdate` payload missing slug — now moot (slug is read-only). `description: x \|\| undefined` drops empty strings. |
| #16 parent/description not pre-filled | `company-form.tsx:112` | Status `Select` uses `defaultValue` (mount-only) not `value` (controlled). |
| #15 parent editable in subsidiary | `companies/page.tsx:293-309` | `CompanyForm` receives `parentCompanies` prop when creating subsidiary, making the field visible and editable. |

### Fixes

**A1 — `src/components/features/companies/company-form.tsx`**
- Add `isEditing?: boolean` prop
- Change status `Select`: `defaultValue={field.value}` → `value={field.value}`
- When `isEditing=true`: replace slug Input with read-only `<span>` (or hide field)
- When `isEditing=true`: replace parent_id Select with read-only text showing parent name

**A2 — `src/app/[locale]/(dashboard)/companies/page.tsx` — subsidiary dialog**
- Remove `parentCompanies` prop from `CompanyForm` when `createSubParent` is set
- Remove `initial.parent_id` from that `CompanyForm` instance  
- Add a read-only info label above the form: `"Subsidiary of: {createSubParent.name}"`

**A3 — `src/app/[locale]/(dashboard)/companies/page.tsx` — `handleUpdate`**
- Fix description: `formData.description || undefined` → `formData.description || undefined` (keep, but ensure empty string clears field if intentional — use `formData.description ?? undefined`)
- No slug/parent changes needed — already excluded from payload and now read-only in form

**A4 — `src/app/[locale]/(dashboard)/companies/page.tsx` — parentOptions for edit**
- `allCompanies` currently fetched with `company_type: 'parent'`
- This means a company's parent won't appear in dropdown if it's typed differently
- Remove the `company_type: 'parent'` filter so all companies are available as parent options

---

## Workstream B — User CRUD

**Issues:** #11 (new users appear last), #13 (no edit option on user page)

### Fixes

**B1 — `src/hooks/useUsers.ts`**
```ts
// In useUsers hook default params, add:
sort_by: 'created_at',
sort_order: 'desc',
```

**B2 — `src/app/[locale]/(dashboard)/users/[id]/page.tsx`**
- Add Edit button in the page header `primaryActions`
- Add `useState<boolean>(false)` for `editOpen`
- Add `FormDialog` with a user edit form
- Zod schema:
  ```ts
  z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    user_type: z.enum(['admin', 'regular']),
  })
  ```
- Wire to `useUpdateUser(userId)` — hook already exists
- Fields: First Name, Last Name, User Type (email shown as read-only display only)

---

## Workstream C — Company Ordering

**Issue:** #10 (new companies appear last)

### Fix

**C1 — `src/hooks/useCompanies.ts`**
```ts
// In useCompanies hook, add default sort params:
sort_by: 'created_at',
sort_order: 'desc',
```

---

## Workstream D — Branding + Toasts

**Issues:** #1 (tab title "Zakra Admin" + wrong favicon), #3 (terse dev-level toast messages)

### Fixes

**D1 — `src/app/layout.tsx`**
```ts
export const metadata: Metadata = {
  title: 'ESAP KB',
  icons: [{ url: '/logo/esaplogo.webp', type: 'image/webp' }],
};
```

**D2 — Toast audit across feature components**

Target files and replacements:

| File | Old | New |
|------|-----|-----|
| `db-connections/rule-dialog.tsx` | `'Rule updated'` | `'Business rule saved'` |
| `db-connections/rule-dialog.tsx` | `'Rule created'` | `'Business rule created'` |
| `db-connections/rule-dialog.tsx` | `'Failed to save rule'` | `'Could not save rule. Please try again.'` |
| `db-connections/schema-explorer-tab.tsx` | `'Failed to start schema learning'` | `'Could not start schema learning'` |
| `db-connections/schema-explorer-tab.tsx` | `'Table unlearned'` | `'Table removed from AI memory'` |
| `db-connections/schema-explorer-tab.tsx` | `'Failed to unlearn table'` | `'Could not remove table. Please try again.'` |
| `db-connections/add-connection-dialog.tsx` | `'Connection updated'` | `'Database connection updated'` |
| `db-connections/add-connection-dialog.tsx` | `'Connection added'` | `'Database connection added'` |
| `db-connections/business-rules-tab.tsx` | `'Rule disabled'` / `'Rule enabled'` | `'Rule disabled'` / `'Rule enabled'` (fine) |
| `db-connections/business-rules-tab.tsx` | `'Failed to update rule'` | `'Could not update rule'` |
| `db-connections/business-rules-tab.tsx` | `'Rule deleted'` | `'Business rule deleted'` |
| `companies/company-hierarchy.tsx` | `'Could not add subsidiary'` | keep — already user-friendly |

---

## Workstream E — Localization + Language Switcher

**Issues:** #7 (sidebar nav not translated), new (language switcher in sidebar)

### Context
- `LanguageSwitcher` component exists at `src/components/shared/language-switcher.tsx`
- Already wired in landing nav and dashboard header
- NAV_ITEMS labels are hardcoded English in `src/utils/constants.ts`

### Fixes

**E1 — `src/components/layout/sidebar.tsx`**
```tsx
import { LanguageSwitcher } from '@/components/shared/language-switcher';
// Add useTranslations:
const t = useTranslations('nav');
// Map label through translation:
label={t(item.label.toLowerCase().replace(' ', '_'))}
// Full sidebar — above user footer:
<LanguageSwitcher variant="full" className="w-full" />
// Collapsed rail — in footer stack:
<LanguageSwitcher variant="icon" />
```

**E2 — `messages/en.json`** — add `nav` namespace:
```json
"nav": {
  "overview": "Overview",
  "chat": "Chat",
  "reports": "Reports",
  "companies": "Companies",
  "users": "Users",
  "databases": "Databases",
  "table_access": "Table Access"
}
```

**E3 — `messages/ar.json`** — add `nav` namespace:
```json
"nav": {
  "overview": "نظرة عامة",
  "chat": "المحادثة",
  "reports": "التقارير",
  "companies": "الشركات",
  "users": "المستخدمون",
  "databases": "قواعد البيانات",
  "table_access": "وصول الجداول"
}
```

---

## Workstream F — Chat Behavior

**Issues:** #8 (report ID not hyperlinked), #12 (DB access URL breaks)

### Fix F1 — DB access guard (`src/app/[locale]/(dashboard)/chat/page.tsx`)

**Current bug:** `createSession` succeeds → `sendMessage` fails → `router.push` already fired → user lands on broken session.

**Fix:** Move `router.push` inside the try block, after `setPendingTask`:
```ts
try {
  const session = await createSession.mutateAsync({ connection_id: selectedConnectionId });
  queryClient.setQueryData(...)
  const { task_id } = await sendMessage(session.id, text.trim(), companyId);
  setPendingTask(session.id, { taskId: task_id, userMessage: text.trim() });
  router.push(`/chat/${session.id}`);  // ← only fires if sendMessage succeeds
} catch (err) {
  // Distinguish access error from general error
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 403) {
    toast.error("You don't have access to this database");
  } else {
    toast.error(t('failedToCreateSession'));
  }
  setIsCreating(false);
}
```

### Fix F2 — Report ID hyperlinking

Need to verify in `streaming-response.tsx` / `markdown-content.tsx` whether the backend sends:
- (a) Raw UUID text inline → add regex post-processor in `MarkdownContent` to detect `/report-[uuid]/` patterns and render as `<Link>`
- (b) Structured `report_link` content block → `ReportLinkBlock` already handles this

Check streaming response to confirm which path the backend uses, then implement accordingly.

---

## Pending Verification

**Issue #4 — User list search filter**
- `SearchInput` debounces correctly ✓
- `useUsers` passes `search` param ✓
- `QueryParams` type includes `search?: string` ✓
- Likely a backend issue or the API param is named differently
- **Action:** Test in browser with network tab open. If `search` param is sent but ignored, check backend docs for correct param name.

**Issue #5 — Charts tweaking**
- Vague requirement. Needs UI review session to identify specific charts and desired changes.

**Issue #6 — Report markdown extra quotes**
- Unclear whether "extra quotes" means `"..."` wrapping in AI text or markdown blockquote `>` syntax
- **Action:** Reproduce the issue in the app and inspect the raw response content.

**Issue #14 — User selector shows ID**
- Code in `companies/[id]/page.tsx` looks correct (`formatFullName` in SelectItem children)
- Medium confidence this is a real bug — may be a Radix SelectValue rendering edge case
- **Action:** Verify in browser with DevTools to confirm if SelectValue trigger shows ID or name after selection.

---

## Files to Touch (complete list)

| File | Workstream | Change |
|------|-----------|--------|
| `src/app/layout.tsx` | D | Title + favicon |
| `src/components/features/companies/company-form.tsx` | A | isEditing prop, status value, read-only slug/parent |
| `src/app/[locale]/(dashboard)/companies/page.tsx` | A | Subsidiary dialog, handleUpdate description fix, parentOptions |
| `src/app/[locale]/(dashboard)/users/[id]/page.tsx` | B | Edit button + dialog |
| `src/hooks/useUsers.ts` | B | sort_by/sort_order defaults |
| `src/hooks/useCompanies.ts` | C | sort_by/sort_order defaults |
| `src/components/layout/sidebar.tsx` | E | Nav i18n + LanguageSwitcher |
| `messages/en.json` | E | nav namespace |
| `messages/ar.json` | E | nav namespace |
| `src/app/[locale]/(dashboard)/chat/page.tsx` | F | DB access guard |
| `src/components/features/chat/streaming-response.tsx` | F | Report ID link (pending verification) |
| `src/components/features/db-connections/rule-dialog.tsx` | D | Toast messages |
| `src/components/features/db-connections/schema-explorer-tab.tsx` | D | Toast messages |
| `src/components/features/db-connections/add-connection-dialog.tsx` | D | Toast messages |
| `src/components/features/db-connections/business-rules-tab.tsx` | D | Toast messages |
