@AGENTS.md

# kb-next

Stack, layout, auth, forms, data, state, and review rules are injected dynamically by **CARL** (`.carl/`) — don't restate them here.

## Sources of truth (read on demand, not every prompt)

- **`AGENTS.md`** — Next.js 16 breaking-changes warning. Always loaded.
- **`.impeccable.md`** — visual system source of truth. Read **before any UI work** (dark enterprise, Geist/Geist Mono, Supabase green accent). DESIGN.md is superseded.
- **`.serena/memories/`** — deeper docs: `project_overview`, `project_structure`, `code_style_conventions`, `suggested_commands`, `patterns_api`, `patterns_auth`, `patterns_frontend`, `patterns_state`, `task_completion_checklist`, `carl_system`. Read via Serena tools when relevant.
- **`.claude/skills/shadcn/SKILL.md`** — auto-activates on `components.json`. Use it for adding/composing shadcn primitives.

## CARL domains in this repo (`.carl/`)

`project` (always-on) · `frontend` · `api` · `auth` · `forms` · `state` · `qa` · `review` — load by keyword. See `.carl/manifest` for triggers.

## Design Context

**Primary goal:** Trust. The interface earns credibility through consistency,
restraint, and visual stability — not ornamentation.

**Aesthetic:** Dark-only. Supabase-inspired. Geist + Geist Mono. Supabase green
(`#3ecf8e`) is the sole accent — used only for active states, primary CTAs, and
positive signals. Depth via border contrast, not drop shadows.

**Non-negotiables:**
- Dark-only — never ship a light-mode variant
- No glowing effects, gradient text, or nested cards
- No AI-slop palette (cyan/purple gradients, neon on dark)
- Geist / Geist Mono — the only typefaces in this system

**Known audit targets:** login screen, dashboard home, all pages (spacing +
hierarchy consistency pass). Full context in `.impeccable.md`.

## Conventions baked in (don't re-derive)

Conventions live in CARL rules + Serena memories. If a rule is missing, propose adding it to the right `.carl/<domain>` file rather than inlining it here — that way it loads only when relevant.
