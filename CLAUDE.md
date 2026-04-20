@AGENTS.md

# kb-next

Stack, layout, auth, forms, data, state, and review rules are injected dynamically by **CARL** (`.carl/`) — don't restate them here.

## Sources of truth (read on demand, not every prompt)

- **`AGENTS.md`** — Next.js 16 breaking-changes warning. Always loaded.
- **`DESIGN.md`** — visual system. Read **before any UI work** (Cursor-inspired warm-minimal, oklab borders, Cursor­Gothic/jjannon/berkeleyMono).
- **`.serena/memories/`** — deeper docs: `project_overview`, `project_structure`, `code_style_conventions`, `suggested_commands`, `patterns_api`, `patterns_auth`, `patterns_frontend`, `patterns_state`, `task_completion_checklist`, `carl_system`. Read via Serena tools when relevant.
- **`.claude/skills/shadcn/SKILL.md`** — auto-activates on `components.json`. Use it for adding/composing shadcn primitives.

## CARL domains in this repo (`.carl/`)

`project` (always-on) · `frontend` · `api` · `auth` · `forms` · `state` · `qa` · `review` — load by keyword. See `.carl/manifest` for triggers.

## Conventions baked in (don't re-derive)

Conventions live in CARL rules + Serena memories. If a rule is missing, propose adding it to the right `.carl/<domain>` file rather than inlining it here — that way it loads only when relevant.
