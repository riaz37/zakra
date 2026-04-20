# Auth & RBAC Patterns

## Token Storage
- `localStorage` keys: `ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY` (defined in `src/utils/constants.ts`).
- Read/write **only** through helpers in `src/api/axios.ts`:
  `getAccessToken`, `getRefreshToken`, `setTokens`, `clearTokens`.

## Login Flow
1. `POST /auth/login` → `LoginResponse { access_token, refresh_token, ... }`
2. `setTokens(access, refresh)`
3. `GET /auth/me` → `User`
4. Hydrate `authStore` (Zustand) with the user.

## Logout Flow
1. `POST /auth/logout` (best-effort)
2. `clearTokens()`
3. Reset all Zustand stores (each store exposes `reset()`)
4. Redirect to login

## 401 Refresh
Handled automatically by the response interceptor in `src/api/axios.ts`:
- First 401 triggers `POST /auth/refresh` with the refresh token.
- Concurrent in-flight 401s subscribe to the refresh result via the queue.
- On success, original requests replay with the new access token.
- On failure, `clearTokens()` and the next request bubbles up the 401.

> Components must NOT catch 401 and refresh manually — duplicates the queue.

## RBAC
- Roles: `src/api/roles.ts` + `src/hooks/useRoles.ts`
- Per-table permissions: `src/api/table-access.ts` + `src/hooks/useTableAccess.ts`
- Gate routes/components on role/permission, not on raw user fields.

## Route Protection
Two valid patterns — pick one per route, don't mix:
- **Server**: read auth cookie/header in the layout/page (Next 16 patterns).
- **Client**: redirect from a `'use client'` boundary using the `authStore`.

## Logging
Never log access/refresh tokens or full `Authorization` headers. Sanitize before
sending to any observability sink.
