## E2E behavior tests for CRUD flows

Add Playwright behavior tests for the list page CRUD flows that currently only have smoke (screenshot) coverage:
- /users: invite → confirm appears in list; delete → confirm dialog → gone from list
- /roles: create → edit → delete full roundtrip
- /companies: create parent → add subsidiary → delete

**Why:** After the DRY refactor (useResourceList + FormDialog + RowActions), the smoke tests verify the page still renders but won't catch if the dialog fails to open or the delete mutation doesn't fire. Behavior tests fill that gap.

**Where to start:** `tests/e2e/` — follow pattern in `smoke-admin-routes.spec.ts`. Use `auth.setup.ts` for session reuse. Target the three most-used pages first (users, roles, companies).

**Depends on:** DRY/modularization refactor merged first (shared primitives stabilized).
