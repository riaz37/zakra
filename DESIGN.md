# Design System Inspired by Cursor

> **Font substitution:** The original Cursor system uses proprietary typefaces (Geist, Instrument Serif, Geist Mono). This project substitutes open-source equivalents — **Geist** / **Instrument Serif** / **Geist Mono** — that preserve the three-voice structure and warm publication feel. All font references in this document reflect the substituted names.

## 1. Visual Theme & Atmosphere

Cursor's website is a study in warm minimalism meets code-editor elegance. The entire experience is built on a warm off-white canvas (`#f2f1ed`) with dark warm-brown text (`#26251e`) -- not pure black, not neutral gray, but a deeply warm near-black with a yellowish undertone that evokes old paper, ink, and craft. This warmth permeates every surface: backgrounds lean toward cream (`#e6e5e0`, `#ebeae5`), borders dissolve into transparent warm overlays using `oklab` color space, and even the error state (`#cf2d56`) carries warmth rather than clinical red. The result feels more like a premium print publication than a tech website.

The custom Geist font is the typographic signature -- a gothic sans-serif with aggressive negative letter-spacing at display sizes (-2.16px at 72px) that creates a compressed, engineered feel. As a secondary voice, the Instrument Serif serif font (with OpenType `"cswh"` contextual swash alternates) provides literary counterpoint for body copy and editorial passages. The monospace voice comes from Geist Mono, a refined coding font that connects the marketing site to Cursor's core identity as a code editor. This three-font system (gothic display, serif body, mono code) gives Cursor one of the most typographically rich palettes in developer tooling.

The border system is particularly distinctive -- Cursor uses `oklab()` color space for border colors, applying warm brown at various alpha levels (0.1, 0.2, 0.55) to create borders that feel organic rather than mechanical. The signature border color `oklab(0.263084 -0.00230259 0.0124794 / 0.1)` is not a simple rgba value but a perceptually uniform color that maintains visual consistency across different backgrounds.

**Key Characteristics:**
- Geist with aggressive negative letter-spacing (-2.16px at 72px, -0.72px at 36px) for compressed display headings
- Instrument Serif serif for body text with OpenType `"cswh"` (contextual swash alternates)
- Geist Mono for code and technical labels
- Warm off-white background (`#f2f1ed`) instead of pure white -- the entire system is warm-shifted
- Primary text color `#26251e` (warm near-black with yellow undertone)
- Accent orange `#f54e00` for brand highlight and links
- oklab-space borders at various alpha levels for perceptually uniform edge treatment
- Pill-shaped elements with extreme radius (33.5M px, effectively full-pill)
- 8px base spacing system with fine-grained sub-8px increments (1.5px, 2px, 2.5px, 3px, 4px, 5px, 6px)

## 2. Color Palette & Roles

### Primary
- **Cursor Dark** (`#26251e`): Primary text, headings, dark UI surfaces. A warm near-black with distinct yellow-brown undertone -- the defining color of the system.
- **Cursor Cream** (`#f2f1ed`): Page background, primary surface. Not white but a warm cream that sets the entire warm tone.
- **Cursor Light** (`#e6e5e0`): Secondary surface, button backgrounds, card fills. A slightly warmer, slightly darker cream.
- **Pure White** (`#ffffff`): Used sparingly for maximum contrast elements and specific surface highlights.
- **True Black** (`#000000`): Minimal use, specific code/console contexts.

### Accent
- **Cursor Orange** (`#f54e00`): Brand accent, `--color-accent`. A vibrant red-orange used for primary CTAs, active links, and brand moments. Warm and urgent.
- **Gold** (`#c08532`): Secondary accent, warm gold for premium or highlighted contexts.

### Semantic
- **Error** (`#cf2d56`): `--color-error`. A warm crimson-rose rather than cold red.
- **Success** (`#1f8a65`): `--color-success`. A muted teal-green, warm-shifted.

### Timeline / Feature Colors
- **Thinking** (`#dfa88f`): Warm peach for "thinking" state in AI timeline.
- **Grep** (`#9fc9a2`): Soft sage green for search/grep operations.
- **Read** (`#9fbbe0`): Soft blue for file reading operations.
- **Edit** (`#c0a8dd`): Soft lavender for editing operations.

### Surface Scale
- **Surface 100** (`#f7f7f4`): Lightest button/card surface, barely tinted.
- **Surface 200** (`#f2f1ed`): Primary page background.
- **Surface 300** (`#ebeae5`): Button default background, subtle emphasis.
- **Surface 400** (`#e6e5e0`): Card backgrounds, secondary surfaces.
- **Surface 500** (`#e1e0db`): Tertiary button background, deeper emphasis.

### Border Colors
- **Border Primary** (`oklab(0.263084 -0.00230259 0.0124794 / 0.1)`): Standard border, 10% warm brown in oklab space.
- **Border Medium** (`oklab(0.263084 -0.00230259 0.0124794 / 0.2)`): Emphasized border, 20% warm brown.
- **Border Strong** (`rgba(38, 37, 30, 0.55)`): Strong borders, table rules.

### Shadows & Depth
- **Card Shadow** (`rgba(0,0,0,0.14) 0px 28px 70px, rgba(0,0,0,0.1) 0px 14px 32px, oklab(0.263084 -0.00230259 0.0124794 / 0.1) 0px 0px 0px 1px`): Heavy elevated card with warm oklab border ring. Token: `--shadow-elevated`.
- **Ambient Shadow** (`rgba(0,0,0,0.02) 0px 0px 16px, rgba(0,0,0,0.008) 0px 0px 8px`): Subtle ambient glow. Token: `--shadow-ambient`.
- **Focus Shadow** (`rgba(0,0,0,0.1) 0px 4px 12px`): Interactive focus feedback. Token: `--shadow-focus`.
- **Ring Shadow** (`oklab(0.263084 -0.00230259 0.0124794 / 0.1) 0px 0px 0px 1px`): Button/input border ring. Token: `--shadow-ring`.

### Dark Palette
Light and dark share the same warm hue family — ink-depth near-black paired with cream foreground. Borders shift to high-lightness alphas.

| Token | Light | Dark |
|-------|-------|------|
| `--color-background` | `#f2f1ed` | `#14130f` |
| `--color-background-translucent` | `rgba(242,241,237,0.8)` | `rgba(20,19,15,0.75)` |
| `--color-foreground` | `#26251e` | `#ebeae5` |
| `--color-muted` | `rgba(38,37,30,0.55)` | `rgba(235,234,229,0.55)` |
| `--color-muted-strong` | `rgba(38,37,30,0.9)` | `rgba(235,234,229,0.9)` |
| `--color-muted-soft` | `rgba(38,37,30,0.06)` | `rgba(235,234,229,0.06)` |
| `--color-surface-100` | `#f7f7f4` | `#191712` |
| `--color-surface-200` | `#f2f1ed` | `#1f1d17` |
| `--color-surface-300` | `#ebeae5` | `#2a2820` |
| `--color-surface-400` | `#e6e5e0` | `#33302a` |
| `--color-surface-500` | `#e1e0db` | `#3b3832` |
| `--color-border` | `oklab(0.263084 … / 0.1)` | `oklab(0.95 … / 0.1)` |
| `--color-border-medium` | `oklab(0.263084 … / 0.2)` | `oklab(0.95 … / 0.22)` |
| `--color-border-strong` | `rgba(38,37,30,0.55)` | `rgba(235,234,229,0.45)` |
| `--color-code-canvas` | `#1c1b15` | `#0f0e0a` |
| `--color-accent` | `#f54e00` | `#f54e00` (unchanged) |

### Additional Tokens (light only)
- `--color-background-translucent: rgba(242,241,237,0.8)` — sticky nav overlay
- `--color-muted-strong: rgba(38,37,30,0.9)` — 90% warm brown for strong emphasis
- `--color-muted-soft: rgba(38,37,30,0.06)` — ghost button fill
- `--color-code-canvas: #1c1b15` — dark editor preview canvas

### Text selection
`::selection { background: var(--color-accent); color: #f2f1ed }` — accent orange selection with cream text.

## 3. Typography Rules

### Font Family
- **Display/UI**: `Geist` (`--font-display`, `--font-sans`), with fallbacks: `system-ui, Helvetica Neue, Helvetica, Arial`
- **Body/Editorial**: `Instrument Serif` (`--font-serif`), with fallbacks: `Iowan Old Style, Palatino Linotype, URW Palladio L, P052, ui-serif, Georgia, Cambria, Times New Roman, Times`
- **Code/Technical**: `Geist Mono` (`--font-mono`), with fallbacks: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New`
- **Icons**: `lucide-react` SVG icons (no icon font)
- **OpenType Features**: `"cswh"` on Instrument Serif body text (`@utility font-feat-cswh`), `"ss09"` on Geist buttons/captions (`@utility font-feat-ss09`), tabular numerals via `@utility font-feat-tnum`

### Hierarchy

| Role | Font | Size | Token | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|-------|--------|-------------|----------------|-------|
| Display Hero | Geist | 72px (4.50rem) | `text-hero` | 400 | 1.10 (tight) | -2.16px | Maximum compression, hero statements |
| Section Heading | Geist | 36px (2.25rem) | `text-section` | 400 | 1.20 (tight) | -0.72px | Feature sections, CTA headlines |
| Sub-heading | Geist | 26px (1.63rem) | `text-sub` | 400 | 1.25 (tight) | -0.325px | Card headings, sub-sections |
| Title Small | Geist | 22px (1.38rem) | `text-title` | 400 | 1.30 (tight) | -0.11px | Smaller titles, list headings |
| Body Serif | Instrument Serif | 19.2px (1.20rem) | `text-body-serif` | 500 | 1.50 | normal | Editorial body with `"cswh"` |
| Body Serif SM | Instrument Serif | 17.28px (1.08rem) | `text-body-serif-sm` | 400 | 1.35 | normal | Standard body text, descriptions |
| Body Sans | Geist | 16px (1.00rem) | `text-body` | 400 | 1.50 | normal | UI body text |
| Button Label | Geist | 14px (0.88rem) | `text-button` | 400 | 1.00 (tight) | normal | Primary button text |
| Caption | Geist | 11px (0.69rem) | `text-caption` | 500 | 1.50 | normal | Small captions, metadata labels |
| Micro | Geist | 11px (0.69rem) | `text-micro` | 500 | 1.27 (tight) | 0.048px | Uppercase micro labels, kickers |
| Mono Body | Geist Mono | 12px (0.75rem) | `text-mono` | 400 | 1.67 (relaxed) | normal | Code blocks |
| Mono Small | Geist Mono | 11px (0.69rem) | `text-mono-sm` | 400 | 1.33 | -0.275px | Inline code, terminal |

### Principles
- **Gothic compression for impact**: Geist at display sizes uses -2.16px letter-spacing at 72px, progressively relaxing: -0.72px at 36px, -0.325px at 26px, -0.11px at 22px, normal at 16px and below. The tracking creates a sense of precision engineering.
- **Serif for soul**: Instrument Serif provides literary warmth. The `"cswh"` feature adds contextual swash alternates that give body text a calligraphic quality.
- **Three typographic voices**: Gothic (display/UI), serif (editorial/body), mono (code/technical). Each serves a distinct communication purpose.
- **Weight restraint**: Geist uses weight 400 almost exclusively, relying on size and tracking for hierarchy rather than weight.

## 4. Component Stylings

### Buttons

**Primary (Warm Surface)**
- Background: `#ebeae5` (Surface 300)
- Text: `#26251e` (Cursor Dark)
- Padding: 10px 12px 10px 14px
- Radius: 8px
- Outline: none
- Hover: text shifts to `var(--color-error)` (`#cf2d56`)
- Focus shadow: `rgba(0,0,0,0.1) 0px 4px 12px`
- Use: Primary actions, main CTAs

**Secondary Pill**
- Background: `#e6e5e0` (Surface 400)
- Text: `oklab(0.263 / 0.6)` (60% warm brown)
- Padding: 3px 8px
- Radius: full pill (33.5M px)
- Hover: text shifts to `var(--color-error)`
- Use: Tags, filters, secondary actions

**Tertiary Pill**
- Background: `#e1e0db` (Surface 500)
- Text: `oklab(0.263 / 0.6)` (60% warm brown)
- Radius: full pill
- Use: Active filter state, selected tags

**Ghost (Transparent)**
- Background: `rgba(38, 37, 30, 0.06)` (6% warm brown)
- Text: `rgba(38, 37, 30, 0.55)` (55% warm brown)
- Padding: 6px 12px
- Use: Tertiary actions, dismiss buttons

**Light Surface**
- Background: `#f7f7f4` (Surface 100) or `#f2f1ed` (Surface 200)
- Text: `#26251e` or `oklab(0.263 / 0.9)` (90%)
- Padding: 0px 8px 1px 12px
- Use: Dropdown triggers, subtle interactive elements

### Cards & Containers
- Background: `#e6e5e0` or `#f2f1ed`
- Border: `1px solid oklab(0.263 / 0.1)` (warm brown at 10%)
- Radius: 8px (standard), 4px (compact), 10px (featured)
- Shadow: `rgba(0,0,0,0.14) 0px 28px 70px, rgba(0,0,0,0.1) 0px 14px 32px` for elevated cards
- Hover: shadow intensification

### Inputs & Forms
- Background: transparent or surface
- Text: `#26251e`
- Padding: 8px 8px 6px (textarea)
- Border: `1px solid oklab(0.263 / 0.1)`
- Focus: border shifts to `oklab(0.263 / 0.2)` or accent orange

### Navigation
- Clean horizontal nav on warm cream background
- Cursor logotype left-aligned (~96x24px)
- Links: 14px Geist or system-ui, weight 500
- CTA button: warm surface with Cursor Dark text
- Tab navigation: bottom border `1px solid oklab(0.263 / 0.1)` with active tab differentiation

### Image Treatment
- Code editor screenshots with `1px solid oklab(0.263 / 0.1)` border
- Rounded corners: 8px standard
- AI chat/timeline screenshots dominate feature sections
- Warm gradient or solid cream backgrounds behind hero images

### Distinctive Components

**AI Timeline**
- Vertical timeline showing AI operations: thinking (peach), grep (sage), read (blue), edit (lavender)
- Each step uses its semantic color with matching text
- Connected with vertical lines
- Core visual metaphor for Cursor's AI-first coding experience

**Code Editor Previews**
- Dark code editor screenshots with warm cream border frame
- Geist Mono for code text
- Syntax highlighting using timeline colors

**Pricing Cards**
- Warm surface backgrounds with bordered containers
- Feature lists using Instrument Serif serif for readability
- CTA buttons with accent orange or primary dark styling

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Fine scale: 1.5px, 2px, 2.5px, 3px, 4px, 5px, 6px (sub-8px for micro-adjustments)
- Standard scale: 8px, 10px, 12px, 14px (derived from extraction)
- Extended scale (inferred): 16px, 24px, 32px, 48px, 64px, 96px
- Notable: fine-grained sub-8px increments for precise icon/text alignment

### Grid & Container
- Max content width: approximately 1200px
- Hero: centered single-column with generous top padding (80-120px)
- Feature sections: 2-3 column grids for cards and features
- Full-width sections with warm cream or slightly darker backgrounds
- Sidebar layouts for documentation and settings pages

### Whitespace Philosophy
- **Warm negative space**: The cream background means whitespace has warmth and texture, unlike cold white minimalism. Large empty areas feel cozy rather than clinical.
- **Compressed text, open layout**: Aggressive negative letter-spacing on Geist headlines is balanced by generous surrounding margins. Text is dense; space around it breathes.
- **Section variation**: Alternating surface tones (cream → lighter cream → cream) create subtle section differentiation without harsh boundaries.

### Border Radius Scale
- Micro (1.5px): Fine detail elements
- Small (2px): Inline elements, code spans
- Medium (3px): Small containers, inline badges
- Standard (4px): Cards, images, compact buttons
- Comfortable (8px): Primary buttons, cards, menus
- Featured (10px): Larger containers, featured cards
- Full Pill (33.5M px / 9999px): Pill buttons, tags, badges

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (Level 0) | No shadow | Page background, text blocks |
| Border Ring (Level 1) | `oklab(0.263 / 0.1) 0px 0px 0px 1px` | Standard card/container border (warm oklab) |
| Border Medium (Level 1b) | `oklab(0.263 / 0.2) 0px 0px 0px 1px` | Emphasized borders, active states |
| Ambient (Level 2) | `rgba(0,0,0,0.02) 0px 0px 16px, rgba(0,0,0,0.008) 0px 0px 8px` | Floating elements, subtle glow |
| Elevated Card (Level 3) | `rgba(0,0,0,0.14) 0px 28px 70px, rgba(0,0,0,0.1) 0px 14px 32px, oklab ring` | Modals, popovers, elevated cards |
| Focus | `rgba(0,0,0,0.1) 0px 4px 12px` on button focus | Interactive focus feedback |

**Shadow Philosophy**: Cursor's depth system is built around two ideas. First, borders use perceptually uniform oklab color space rather than rgba, ensuring warm brown borders look consistent across different background tones. Second, elevation shadows use dramatically large blur values (28px, 70px) with moderate opacity (0.14, 0.1), creating a diffused, atmospheric lift rather than hard-edged drop shadows. Cards don't feel like they float above the page -- they feel like the page has gently opened a space for them.

### Decorative Depth
- Warm cream surface variations create subtle tonal depth without shadows
- oklab borders at 10% and 20% create a spectrum of edge definition
- No harsh divider lines -- section separation through background tone shifts and spacing

## 7. Interaction & Motion

### Hover States
- Buttons: text color shifts to `--color-error` (`#cf2d56`) on hover -- a distinctive warm crimson that signals interactivity
- Links: color shift to accent orange (`#f54e00`) or underline decoration with `rgba(38, 37, 30, 0.4)`
- Cards: shadow intensification on hover (ambient → elevated)

### Focus States
- Shadow-based focus: `rgba(0,0,0,0.1) 0px 4px 12px` for depth-based focus indication
- Border focus: `oklab(0.263 / 0.2)` (20% border) for input/form focus
- Consistent warm tone in all focus states -- no cold blue focus rings

### Transitions
- Color transitions: 150ms ease for text/background color changes
- Shadow transitions: 200ms ease for elevation changes
- Transform: subtle scale or translate for interactive feedback

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <600px | Single column, reduced padding, stacked navigation |
| Tablet Small | 600-768px | 2-column grids begin |
| Tablet | 768-900px | Expanded card grids, sidebar appears |
| Desktop Small | 900-1279px | Full layout forming |
| Desktop | >1279px | Full layout, maximum content width |

### Touch Targets
- Buttons use comfortable padding (6px-14px vertical, 8px-14px horizontal)
- Pill buttons maintain tap-friendly sizing with 3px-10px padding
- Navigation links at 14px with adequate spacing for touch

### Collapsing Strategy
- Hero: 72px Geist → 36px → 26px on smaller screens, maintaining proportional letter-spacing
- Navigation: horizontal links → hamburger menu on mobile
- Feature cards: 3-column → 2-column → single column stacked
- Code editor screenshots: maintain aspect ratio, may shrink with border treatment preserved
- Timeline visualization: horizontal → vertical stacking
- Section spacing: 80px+ → 48px → 32px on mobile

### Image Behavior
- Editor screenshots maintain warm border treatment at all sizes
- AI timeline adapts from horizontal to vertical layout
- Product screenshots use responsive images with consistent border radius
- Full-width hero images scale proportionally

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA background: `#ebeae5` (warm cream button)
- Page background: `#f2f1ed` (warm off-white)
- Text color: `#26251e` (warm near-black)
- Secondary text: `rgba(38, 37, 30, 0.55)` (55% warm brown)
- Accent: `#f54e00` (orange)
- Error/hover: `#cf2d56` (warm crimson)
- Success: `#1f8a65` (muted teal)
- Border: `oklab(0.263084 -0.00230259 0.0124794 / 0.1)` or `rgba(38, 37, 30, 0.1)` as fallback

### Example Component Prompts
- "Create a hero section on `#f2f1ed` warm cream background. Headline at 72px Geist weight 400, line-height 1.10, letter-spacing -2.16px, color `#26251e`. Subtitle at 17.28px Instrument Serif weight 400, line-height 1.35, color `rgba(38,37,30,0.55)`. Primary CTA button (`#ebeae5` bg, 8px radius, 10px 14px padding) with hover text shift to `#cf2d56`."
- "Design a card: `#e6e5e0` background, border `1px solid rgba(38,37,30,0.1)`. Radius 8px. Title at 22px Geist weight 400, letter-spacing -0.11px. Body at 17.28px Instrument Serif weight 400, color `rgba(38,37,30,0.55)`. Use `#f54e00` for link accents."
- "Build a pill tag: `#e6e5e0` background, `rgba(38,37,30,0.6)` text, full-pill radius (9999px), 3px 8px padding, 14px Geist weight 400."
- "Create navigation: sticky `#f2f1ed` background with backdrop-filter blur. 14px Geist weight 500 for links, `#26251e` text. CTA button right-aligned with `#ebeae5` bg and 8px radius. Bottom border `1px solid rgba(38,37,30,0.1)`."
- "Design an AI timeline showing four steps: Thinking (`#dfa88f`), Grep (`#9fc9a2`), Read (`#9fbbe0`), Edit (`#c0a8dd`). Each step: 14px Geist Mono label + 16px Geist description + vertical connecting line in `rgba(38,37,30,0.1)`."

### Iteration Guide
1. Always use warm tones -- `#f2f1ed` background, `#26251e` text, never pure white/black for primary surfaces
2. Letter-spacing scales with font size for Geist: -2.16px at 72px, -0.72px at 36px, -0.325px at 26px, normal at 16px
3. Use `rgba(38, 37, 30, alpha)` as a CSS-compatible fallback for oklab borders
4. Three fonts, three voices: Geist (display/UI), Instrument Serif (editorial), Geist Mono (code)
5. Pill shapes (9999px radius) for tags and filters; 8px radius for primary buttons and cards
6. Hover states use `#cf2d56` text color -- the warm crimson shift is a signature interaction
7. Shadows use large blur values (28px, 70px) for diffused atmospheric depth
8. The sub-8px spacing scale (1.5, 2, 2.5, 3, 4, 5, 6px) is critical for icon/text micro-alignment
