# CARL System (Project-Local)

## Layout
- `~/.carl/` — global rules (manifest, global, commands, context, example)
- `.carl/` (project) — extends global with kb-next-specific domains

## Project Domains (`.carl/`)
| File | Trigger | Purpose |
|------|---------|---------|
| `project` | always-on | Stack + layout invariants |
| `frontend` | component, page, ui, shadcn, tailwind, … | UI conventions + DESIGN.md |
| `api` | api, axios, react-query, sse, … | HTTP + server state |
| `auth` | auth, jwt, refresh, role, rbac, … | Token + RBAC handling |
| `forms` | form, zod, validate, … | react-hook-form + zod |
| `state` | store, zustand, … | Zustand store conventions |
| `qa` | test, vitest, playwright, … | Testing (none wired yet) |
| `review` | review, pr, audit | Project-specific review checklist |

## Rule Format
Files are plain text, no extension. Rules look like:
```
DOMAIN_RULE_0=Rule text here
DOMAIN_RULE_1=Next rule
```

Manifest controls state and triggers:
```
DOMAIN_STATE=active
DOMAIN_ALWAYS_ON=true|false
DOMAIN_RECALL=keyword1,keyword2
DOMAIN_EXCLUDE=word1,word2
```

## DEVMODE Flag
`🚫 DEVMODE=false 🚫` in injected context = do NOT append CARL DEVMODE debug
section to responses. User has disabled debug output.

## Star-Commands (from global)
`*dev`, `*review`, `*brief`, `*plan`, `*discuss`, `*debug`, `*explain`, `*carl`

## Editing
Edit files in `.carl/` directly with the Write/Edit tool. Restart not required —
the carl hook reads files on every prompt.
