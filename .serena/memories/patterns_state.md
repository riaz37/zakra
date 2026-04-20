# Zustand State Patterns

## Store-Per-Concern
- `src/store/authStore.ts` — current user + session
- `src/store/chatStore.ts` — active chat UI state
- `src/store/uiStore.ts` — sidebars, modals, theme bits
- Don't merge stores. Don't add a global root store.

## Server vs Client State
- Server data lives in TanStack Query — never mirror it into Zustand.
- Zustand holds UI state and identity-derived flags only.

## Selectors
Subscribe to slices, not the whole store:
```ts
const user = useAuthStore((s) => s.user);          // good
const auth = useAuthStore();                        // avoid — re-renders on every change
```

## Actions
Actions live on the store. Never `setState` from outside:
```ts
useAuthStore.setState({ user })                     // avoid
useAuthStore.getState().setUser(user)               // ok if you must call outside React
```

## Persistence
- `persist` middleware only for state that must survive a reload (theme, sidebar
  collapsed). Tokens stay in `localStorage` via the axios helpers — not via
  Zustand persist.

## Reset on Logout
Every store exposes `reset()`. `authStore.logout()` calls each store's reset.
