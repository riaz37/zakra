# DESIGN.md — ESAP-KB Admin

> **Source of truth for all visual and UI decisions.** Read this before touching any UI.
> Supersedes `.impeccable.md`. Do not deviate without explicit approval.

---

## 1. Product

| | |
|---|---|
| **Product** | ESAP-KB Admin |
| **What** | Enterprise knowledge-base admin dashboard. Customers manage companies, users, DB connections, roles, and chat with their data via an AI assistant. |
| **Who** | External enterprise customers — admins and technical leads. Daily-use primary tool. |
| **Memorable thing** | *"This is serious software."* Precision-tool aesthetic. Dense, calibrated, every pixel intentional. Feels like it costs money. |
| **Tone** | Precise · Reliable · Quiet. Not friendly. Not cold. Authoritative. |

---

## 2. Aesthetic Direction

- **Direction:** Industrial/Utilitarian with AI warmth
- **Decoration:** Minimal — typography and surface contrast do all the work
- **Mood:** A well-calibrated instrument. No delight for delight's sake. Every interaction reduces cognitive load.
- **Design lineage:** Cursor IDE warmth × Supabase green × Linear density

---

## 3. Palette

Dark-only. Never ship a light mode.

### Base surfaces

```css
--bg:               #1a1916   /* warm near-black — page background */
--surface-100:      #1e1d19   /* sidebar, navigation rail */
--surface-200:      #21201c   /* cards, panels, table headers */
--surface-300:      #282722   /* hover states, selected rows */
--surface-400:      #2e2d28   /* active row bg, pressed states */
--surface-500:      #35332e   /* strong borders, section dividers */
```

### Foreground

```css
--fg:               #ebeae5           /* primary text */
--fg-muted:         rgba(235,234,229,0.65)  /* secondary text, placeholders */
--fg-subtle:        rgba(235,234,229,0.45)  /* disabled, metadata */
```

### Borders

```css
--border:           rgba(235,234,229,0.10)  /* default dividers */
--border-medium:    rgba(235,234,229,0.16)  /* card borders, input borders */
--border-strong:    rgba(235,234,229,0.22)  /* elevated element borders */
```

### Accent — Supabase green (sole accent)

```css
--accent:           #3ecf8e
--accent-soft:      rgba(62,207,142,0.10)
--accent-hover:     rgba(62,207,142,0.16)
--brand-deep:       #2ea574   /* hover on accent-bg buttons */
```

### Semantic

```css
--success:          #3ecf8e   /* same as accent */
--success-soft:     rgba(62,207,142,0.10)
--warning:          #d99a45
--warning-soft:     rgba(217,154,69,0.14)
--destructive:      #e8476a
--destructive-soft: rgba(232,71,106,0.12)
--info:             #9fbbe0
--info-soft:        rgba(159,187,224,0.14)
```

### AI pipeline colors (ambient semantic system)

These 4 hues are unique to this product. They live in the chat and in semantic contexts across the entire app.

```css
--color-thinking:   #dfa88f   /* amber — warnings, processing states, attention */
--color-grep:       #9fc9a2   /* muted green — success variant, data match */
--color-read:       #9fbbe0   /* steel blue — info states, read operations */
--color-edit:       #c0a8dd   /* soft purple — secondary actions, edit operations */
```

Usage map:
- `--color-thinking` → `WarningBadge`, spinner during async ops, attention callouts
- `--color-read` → `InfoBadge`, connection status (connected), read-only indicators
- `--color-edit` → secondary icon accents, edit mode indicators
- `--color-grep` → alternative success state (data found, row matched)

---

## 4. Typography

Two-voice system. Archivo for all UI. JetBrains Mono only for technical values.

### Fonts

| Font | Role | Load |
|---|---|---|
| **Archivo** | All UI — headings, labels, body, buttons | Google Fonts |
| **JetBrains Mono** | Timestamps, IDs, DB names, SQL, technical tokens only | Google Fonts |
| **Source Serif 4** | Report previews, long-form editorial content only | Google Fonts |

Never use Archivo for code. Never use JetBrains Mono decoratively.

### Scale

| Name | Size | Weight | Tracking | Line-height | Usage |
|---|---|---|---|---|---|
| `display` | 24px | 600 | -0.03em | 1.2 | Page titles (h1) |
| `heading` | 18px | 600 | -0.025em | 1.3 | Section headings (h2) |
| `subheading` | 15px | 500 | -0.015em | 1.4 | Card headings, panel titles (h3) |
| `body` | 14px | 400 | 0 | 1.5 | Primary content, paragraphs |
| `body-medium` | 14px | 500 | 0 | 1.5 | Emphasized body, sidebar items |
| `caption` | 12px | 400 | 0 | 1.4 | Secondary text, helper text, timestamps |
| `label` | 11px | 500 | 0.06em | 1.2 | UPPERCASE section labels, metadata tags |
| `mono` | 13px | 400 | 0 | 1.4 | IDs, timestamps, DB values (JetBrains Mono) |
| `mono-sm` | 12px | 400 | 0 | 1.4 | Inline code, short tokens |

### Rules

- Heading tracking: always negative. Body: never tracked.
- `label` is ALWAYS uppercase with `0.06em` letter-spacing. If it's not uppercase, it's not a label — it's a caption.
- Monospace used ONLY for: DB connection names, user IDs, timestamps, SQL, API keys. Never for decoration or "technical vibes."
- Maximum line length for body text: 72ch.

---

## 5. Elevation System

Five distinct levels. Each level earns its elevation through border treatment, not drop shadows. Shadows only on Levels 3–4.

```
Level 0  Page background    #1a1916    no border, no shadow
Level 1  Sidebar / Rail     #1e1d19    1px right border (--border)
Level 2  Card / Panel       #21201c    1px border (--border-medium), shadow-ring
Level 3  Dropdown / Popover #21201c    1px border (--border-strong), shadow-elevated
Level 4  Modal / Dialog     #21201c    1px border (--border-strong), shadow-elevated + backdrop-blur-sm
```

### Shadow tokens

```css
--shadow-ring:     0 0 0 1px rgba(235,234,229,0.08);
--shadow-elevated: 0 16px 40px rgba(0,0,0,0.5),
                   0 0 0 1px rgba(235,234,229,0.06);
--shadow-focus:    0 0 0 2px rgba(62,207,142,0.4);
```

**Rule:** No ambient or decorative shadows. No glows. Elevation = border opacity, not shadow intensity.

---

## 6. Spacing & Density

Base unit: **4px**. All spacing values are multiples.

### Scale

```
2xs:  2px    (icon-text gap, tight inline)
xs:   4px    (chip internal padding, badge gap)
sm:   8px    (button horizontal padding sm, icon margin)
md:   12px   (table cell padding-y, card padding-y)
lg:   16px   (table cell padding-x, form field gap, card padding-x)
xl:   24px   (section gap, panel padding)
2xl:  32px   (page section gap)
3xl:  48px   (page-level vertical rhythm)
4xl:  64px   (hero / empty state spacing)
```

### Density target

This is **dense software**. Respect screen real estate.

| Element | Height |
|---|---|
| Table row | 36px |
| Nav/sidebar item | 32px |
| Button (md) | 34px |
| Button (sm) | 28px |
| Button (lg) | 40px |
| Input (md) | 36px |
| Input (sm) | 30px |
| Tab item | 36px |
| Badge / chip | 20px |
| Avatar (sm) | 24px |
| Avatar (md) | 32px |

---

## 7. Border Radius

Hierarchical scale. Never uniform border-radius everywhere.

```
none:  0px     — dividers, horizontal rules, table borders
xs:    3px     — status dots, tiny chips
sm:    4px     — inline badges, tags, small chips, code blocks
md:    6px     — buttons, inputs, select, small cards, table header cells
lg:    8px     — cards, panels, popovers, dropdowns
xl:    10px    — modals, dialogs, large panels
full:  9999px  — avatars, status indicator dots, toggle switches
```

**Rule:** Radius increases with elevation level. Page-level panels: lg. Dropdowns: lg. Modals: xl. Never apply a uniform `rounded-xl` to everything.

---

## 8. Interactive State Matrix

Every interactive element has five defined states. Implement all five; do not leave any undefined.

| State | Background | Border | Text | Transition |
|---|---|---|---|---|
| **default** | transparent | `--border-medium` (inputs only) | `--fg` | — |
| **hover** | `--surface-300` | — | `--fg` | 120ms ease-out |
| **active / selected** | `--accent-soft` | 2px left `--accent` | `--fg` | 120ms ease-out |
| **focus** | — | — | — | add `--shadow-focus` |
| **disabled** | transparent | — | `--fg-subtle` | — |

**Hover rule:** 0ms delay. Snappy. Enterprise software feels fast.
**Transition rule:** 120ms ease-out for ALL state changes. Not 200ms (shadcn default). Never animate layout properties (width/height/padding). Transform + opacity only.

---

## 9. Component Specifications

### 9.1 Buttons

Three variants. Never create new button variants without updating this spec.

#### Primary

```
Background:   --accent (#3ecf8e)
Text:         #0d1f16   (dark on green — do not use --fg)
Border:       none
Border-radius: md (6px)
Font:         14px / 500 / 0 tracking
Hover bg:     --brand-deep (#2ea574)
Active bg:    #27916a
Disabled:     --accent at 40% opacity, pointer-events: none
```

#### Secondary

```
Background:   transparent
Text:         --fg
Border:       1px --border-medium
Border-radius: md (6px)
Font:         14px / 500
Hover bg:     --surface-300
Hover border: --border-strong
Active bg:    --surface-400
```

#### Ghost

```
Background:   transparent
Text:         --fg-muted
Border:       none
Border-radius: md (6px)
Font:         14px / 400
Hover bg:     --surface-300
Hover text:   --fg
Active bg:    --surface-400
```

#### Destructive

```
Background:   --destructive-soft
Text:         --destructive
Border:       1px rgba(232,71,106,0.25)
Hover bg:     rgba(232,71,106,0.18)
```

#### Sizes

```
sm:  height 28px, px 10px, text 12px/500
md:  height 34px, px 14px, text 14px/500    ← default
lg:  height 40px, px 18px, text 15px/500
```

#### Icon buttons

```
sm:  28×28px, icon 14px
md:  32×32px, icon 16px
lg:  36×36px, icon 18px
Border-radius: md (6px)
```

---

### 9.2 Form Inputs

```
Background:   --surface-200
Border:       1px --border-medium
Border-radius: md (6px)
Height:       36px (md), 30px (sm)
Padding:      0 12px
Font:         14px / 400 / --fg
Placeholder:  --fg-subtle

focus:        border 1px --accent + --shadow-focus
error:        border 1px --destructive + --destructive-soft bg
disabled:     bg --surface, text --fg-subtle, opacity 0.5
```

#### Textarea

Same as input but `min-height: 80px`, `padding: 10px 12px`, `resize: vertical`.

#### Select / Dropdown trigger

Same as input. Chevron icon 14px at right, `--fg-muted`.

#### Helper text

`caption` size, `--fg-subtle`. Below input with 4px gap.

#### Error message

`caption` size, `--destructive`. Below input with 4px gap. Replaces helper text.

#### Form labels

`12px / 500 / --fg-muted`. 6px above input. Never floating labels.

---

### 9.3 Data Tables

Frameless. No outer border box. Rows defined by 1px dividers and hover states.

```
Table:
  width: 100%
  border-collapse: collapse

Header row:
  height: 36px
  background: --surface-200
  border-bottom: 1px --border-medium
  text: 11px / 500 / UPPERCASE / 0.06em tracking / --fg-subtle
  padding: 0 16px

Data row:
  height: 36px
  border-bottom: 1px --border
  padding: 0 16px
  text: 14px / 400 / --fg

Hover row:
  background: --surface-300
  transition: 120ms ease-out

Selected row:
  background: --accent-soft
  border-left: 2px solid --accent
  padding-left: 14px (compensate for 2px border)

Empty state (no rows):
  centered in table body
  icon 20px --fg-subtle
  label "body" size --fg-muted
  helper text "caption" size --fg-subtle
```

#### Column types

| Content | Font | Alignment |
|---|---|---|
| Text | `body` / Archivo | left |
| Number / count | `mono` / JetBrains Mono | right |
| ID / UUID | `mono-sm` / JetBrains Mono | left |
| Timestamp | `mono-sm` / JetBrains Mono | left |
| Badge / status | — | left |
| Actions | — | right, always last column |

#### Row actions

- Default: hidden. Reveal on row hover (opacity 0 → 1, 120ms).
- Max 3 icon buttons in the actions cell.
- Destructive action: always last, icon-only with tooltip.

---

### 9.4 Status Badges

Small and precise. Not big pills.

```
Structure: dot (5×5px, border-radius full) + label text

Size: 20px height, inline-flex, gap 6px, px 8px
Font: 11px / 500 / 0.03em tracking (not fully uppercase)
Border-radius: sm (4px)
```

#### Variants

```
active/success:  dot --accent,        bg --accent-soft,        text --accent
warning:         dot --warning,       bg --warning-soft,       text --warning
error:           dot --destructive,   bg --destructive-soft,   text --destructive
info:            dot --info,          bg --info-soft,          text --info
neutral/pending: dot --fg-subtle,     bg --surface-300,        text --fg-muted
processing:      dot --color-thinking, bg rgba(223,168,143,0.12), text --color-thinking
```

---

### 9.5 Sidebar Navigation

```
Width:         224px expanded / 52px collapsed
Background:    --surface-100 (#1e1d19)
Right border:  1px --border

Section label (group header):
  11px / 500 / UPPERCASE / 0.06em tracking / --fg-subtle
  padding: 20px 16px 6px

Nav item:
  height: 32px
  padding: 0 12px
  display: flex, align-center, gap 10px
  border-radius: md (6px) — applied to item, not full-width
  font: 14px / 500 / --fg-muted
  icon: 16px / --fg-subtle

Nav item — hover:
  bg: --surface-300
  text: --fg
  icon: --fg-muted
  transition: 120ms

Nav item — active:
  bg: --accent-soft
  text: --fg
  icon: --accent
  border-left: 2px solid --accent
  padding-left: 10px (compensate)
  font-weight: 500

Collapsed (icon-only):
  item width: 36px (centered in 52px rail)
  tooltip on hover: label at right
```

---

### 9.6 Cards & Panels

```
Background:    --surface-200
Border:        1px --border-medium
Border-radius: lg (8px)
Shadow:        --shadow-ring

Padding:
  default: 20px
  compact: 12px 16px
  flush:   0 (for tables, no internal padding)

Card header:
  padding: 16px 20px
  border-bottom: 1px --border
  title: subheading (15px/500/-0.015em)

Card footer:
  padding: 12px 20px
  border-top: 1px --border
  bg: --surface (same as card — not lighter)
```

No nested cards. If you need grouping inside a card, use a section separator (1px `--border`), not another card.

---

### 9.7 Dropdowns & Popovers

```
Background:    --surface-200
Border:        1px --border-strong
Border-radius: lg (8px)
Shadow:        --shadow-elevated
Min-width:     180px
Padding:       4px (around items)

Menu item:
  height: 32px
  padding: 0 12px
  border-radius: md (6px)
  font: 14px / 400 / --fg
  transition: 120ms

Menu item — hover:
  bg: --surface-300

Menu item — destructive:
  text: --destructive
  hover bg: --destructive-soft

Divider:
  1px --border, margin: 4px 0
```

---

### 9.8 Modals & Dialogs

```
Overlay:       rgba(0,0,0,0.7)
Background:    --surface-200
Border:        1px --border-strong
Border-radius: xl (10px)
Shadow:        --shadow-elevated

Sizes:
  sm:   max-width 400px
  md:   max-width 520px    ← default (form dialogs)
  lg:   max-width 680px
  xl:   max-width 900px

Header:
  padding: 20px 24px 16px
  title: heading (18px/600/-0.025em)
  description: body (14px/400/--fg-muted), 6px below title

Body:
  padding: 0 24px 20px

Footer:
  padding: 16px 24px
  border-top: 1px --border
  display: flex, gap 8px, justify-end

Animation:
  enter: fade-up 220ms cubic-bezier(0.16,1,0.3,1)
  exit:  fade-in reverse 150ms ease-in
```

---

### 9.9 Toasts (Sonner)

Positioned: bottom-right, 16px margin.

```
Background:    --surface-400
Border:        1px --border-strong
Border-radius: lg (8px)
Shadow:        --shadow-elevated
Font:          14px / 400 / --fg
Max-width:     360px

Variants use left border (3px):
  success:  3px left --accent
  warning:  3px left --warning
  error:    3px left --destructive
  info:     3px left --info
```

---

### 9.10 Empty States

Every zero-state teaches. Never "No data found." with nothing else.

```
Container:
  display: flex, flex-direction: column, align-items: center
  gap: 12px, padding: 48px 24px
  text-align: center

Icon:
  20px, --fg-subtle (Lucide)
  Optional: 40px icon in a 64×64 --surface-300 rounded-xl container

Title:
  subheading (15px/500/-0.015em) / --fg

Description:
  body (14px/400) / --fg-muted
  Explain the NEXT ACTION, not the absence of data.
  Max 2 lines.

CTA (if applicable):
  Primary button, margin-top: 4px
```

---

### 9.11 Loading States

Never block UI with a full-page spinner.

**Skeleton:** Shimmer animation on --surface-300 shapes approximating real content.

```css
@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-300) 25%,
    var(--surface-400) 50%,
    var(--surface-300) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}
```

**Spinner:** Only for async actions (button loading state, full-page transitions).
- Size: 16px inline (button), 20px standalone
- Color: --accent
- Never show spinner for < 300ms

---

### 9.12 Tabs

```
Tab list:
  border-bottom: 1px --border
  gap: 0 (tabs are adjacent)

Tab item:
  height: 36px
  padding: 0 16px
  font: 14px / 400 / --fg-muted
  transition: 120ms

Tab item — hover:
  text: --fg

Tab item — active:
  text: --fg
  font-weight: 500
  border-bottom: 2px solid --accent
  (compensates: margin-bottom: -1px)
```

---

### 9.13 Breadcrumbs

```
Font: 14px / 400 / --fg-muted
Separator: "/" or Lucide ChevronRight (12px / --fg-subtle)
Current page: --fg, font-weight 500
Max items: 4. Truncate middle with "…"
```

---

### 9.14 Avatars

```
Shape: full (9999px)
Sizes: 20px / 24px / 32px / 40px / 48px
Fallback: initials, bg --surface-400, text --fg-muted
Font: mono for initials (letter-spacing 0)
Border: 1px --border (on surface backgrounds)
```

---

### 9.15 Code Blocks

```
Background:    --surface-400
Border:        1px --border-medium
Border-radius: md (6px)
Padding:       12px 16px
Font:          JetBrains Mono 13px / --fg
Line-height:   1.6

Inline code:
  bg: --surface-300
  border-radius: xs (3px)
  padding: 1px 5px
  font: JetBrains Mono 12px / --fg-muted
```

---

## 10. Icons

Source: **Lucide React** only. Never mix icon sets.

| Context | Size | Color |
|---|---|---|
| Sidebar / nav items | 16px | `--fg-subtle` (default), `--accent` (active) |
| Inline with body text | 14px | `--fg-muted` |
| Standalone (empty states) | 20px | `--fg-subtle` |
| Button with label | 16px | inherits button text color |
| Icon-only button | 16px | `--fg-muted`, hover `--fg` |
| Table row action | 14px | `--fg-subtle`, hover `--fg-muted` |

**Stroke width:** 1.5px (Lucide default). Never change stroke width.
**Rule:** If an icon doesn't clarify meaning, remove it. Icons are wayfinding, not decoration.

---

## 11. Motion

```css
/* Keyframes */
@keyframes fade-up  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
@keyframes fade-in  { from { opacity:0 } to { opacity:1 } }
@keyframes shimmer  { from { background-position:200% 0 } to { background-position:-200% 0 } }
```

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `instant` | 0ms | — | Hover bg changes |
| `micro` | 120ms | `ease-out` | State changes (all interactive elements) |
| `short` | 200ms | `cubic-bezier(0.16,1,0.3,1)` | Dropdowns, popovers entering |
| `medium` | 220ms | `cubic-bezier(0.16,1,0.3,1)` | Modals, fade-up entrance |
| `long` | 350ms | `cubic-bezier(0.16,1,0.3,1)` | Page transitions |

Animation stagger: max 300ms total across staggered elements. Delay increments: 50ms.

**Never:**
- Animate `width`, `height`, `padding`, `margin` — use `transform` + `opacity`
- Use `bounce` or `elastic` easing
- Animate anything > 700ms
- Ignore `prefers-reduced-motion` — wrap all animations in `@media (prefers-reduced-motion: no-preference)`

---

## 12. Focus Ring

```css
/* Applied to all focusable elements */
box-shadow: 0 0 0 2px rgba(62,207,142,0.4);
outline: none;
```

Never remove focus indicators. If a custom focus style is needed, it must be visible and use the green accent.

---

## 13. Aesthetic Rules (Non-Negotiables)

### Never

- `#000` or `#fff` as surface colors
- Cursor Orange (`#f54e00`) as accent — sole accent is Supabase green
- Light-mode cream values (`#f2f1ed`, `#f7f7f4`) anywhere — dark only
- Glowing effects, bloom shadows, neon
- Gradient text — ever
- AI-slop palette: cyan gradients, purple-to-blue, rainbow accents
- Large icons with rounded corners above every heading
- Nested cards
- Modal when an inline pattern works
- `system-ui` or `-apple-system` as display/body font (font fallback only)
- Cool/neutral grays — all neutrals must be warm (brown-tinted)
- `Geist` or `Inter` — Archivo only

### Always

- CSS custom properties, color-mix for all colors
- Warm-tinted neutrals throughout
- Varied spacing to create rhythm — tight clusters, generous breaks
- Exponential easing `cubic-bezier(0.16,1,0.3,1)` for entrances
- Empty states that teach the next action
- Progressive disclosure — simple first, reveal on interaction
- Monospace for technical data only (IDs, timestamps, SQL, keys)

---

## 14. Review Checklist

Before shipping any UI change:

- [ ] No raw hex colors — only CSS custom properties (except in DESIGN.md itself)
- [ ] No `text-muted/40` or opacity modifiers stacked on already-opaque text tokens (see pitfall `tailwind-muted-opacity-stacking`)
- [ ] No Cursor Orange (`#f54e00`) anywhere
- [ ] No light-mode cream values anywhere
- [ ] No Geist / Inter / system-ui font references
- [ ] No nested cards
- [ ] Contrast ≥ 4.5:1 for body text, ≥ 3:1 for UI elements (WCAG AA)
- [ ] Focus rings present on all interactive elements
- [ ] All 5 interactive states implemented for new interactive elements
- [ ] AI slop test: would someone instantly say "AI made this"? If yes, fix it.
- [ ] Table rows at 36px height, not 40px+
- [ ] Borders at `--border` / `--border-medium` / `--border-strong` — not custom rgba
- [ ] Transitions at 120ms, not 200ms (shadcn default)
- [ ] JetBrains Mono used only for technical values (IDs, timestamps, SQL)

---

## 15. Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-04-28 | DESIGN.md created, supersedes .impeccable.md | .impeccable.md defined tokens+principles but no component specs. Shadcn defaults filled the gap, causing the "flat template" look. This adds elevation, state matrix, and component-level specs. |
| 2026-04-28 | AI pipeline colors promoted to ambient semantic system | The 4 hues (amber/green/blue/purple) are unique to this product. Promoting them to semantic contexts across the full UI gives the product a visual identity no other admin tool has. |
| 2026-04-28 | Density-first: 36px rows, 32px nav items | "Serious software" signal. Respects user screen space. Enterprise users on large monitors benefit from data density. |
| 2026-04-28 | Frameless tables (no outer border box) | Rows defined by dividers + hover only. Creates a printed-document feel — data lives in the page, not trapped in a box. |
| 2026-04-28 | 120ms transitions (not 200ms shadcn default) | Snappier feel = more responsive, more confident product. Enterprise software should feel fast. |
