# Netta Shemesh Website — Design Guidelines

> Full project context: see `AGENTS.md`. This file focuses on **design system rules** — typography, color, and layout — that every agent must follow before touching any visual code.

---

## Typography

### Fonts (two fonts, strict roles)

| Token | Family | Role |
|---|---|---|
| `var(--font-canva-accent)` | Elamy (handwriting/display) | Hero title, section H2, signature only |
| `var(--font-stanga)` | Stanga (clean sans) | Everything else — paragraphs, names, labels, nav, CTA |

**Elamy is a decorative script. Never use it for body paragraphs.** It is illegible as running text, especially in Hebrew RTL. This was a real production bug.

---

### The Type Scale — use these classes, nothing else

All sizes are fluid `clamp()`, mobile-first. **Do not hardcode `text-[XXpx]` or ad-hoc weights.** The random sizes from the original Canva export (13/15/16/18.67/28/31px) have been replaced with this canonical scale.

| Class | Mobile → Desktop | Font | Weight | Line-height | Use for |
|---|---|---|---|---|---|
| `.type-display` | 40px → 88px | accent | 400 | 1.05 | Hero H1 |
| `.type-title` | 30px → 52px | accent | 400 | 1.15 | Section H2 |
| `.type-card-title` | 22px → 30px | body | **700** | 1.25 | Card/step headings |
| `.type-quote` | 24px → 32px | body | 400 | 1.50 | Pull-quotes, personal statements |
| `.type-lead` | 18px → 22px | body | 400 | 1.60 | First paragraph of a section |
| `.type-body` | 16px → 18px | body | 400 | 1.65 | Default body copy |
| `.type-small` | 14px → 16px | body | 400 | 1.50 | Captions, attribution subtitle |
| `.type-eyebrow` | 13px → 14px | body | 600 | 1.40 | Labels / eyebrows (uppercase, +0.08em tracking) |
| `.type-signature` | 32px → 56px | accent | 400 | 1.10 | Handwritten signature element |

**Floor rule: no text below 14px anywhere on the site.** `type-small` is the minimum. Anything smaller (e.g. old `text-xs`, `text-[12px]`) fails mobile readability and accessibility.

---

### Typography rules (apply before writing any font/size/weight code)

1. **Build hierarchy with size + font, not bold.** Use `.type-quote` (large, regular) vs `.type-body` (smaller, regular) to create contrast. `font-bold` belongs only on names, card titles, and CTAs — not on body paragraphs.

2. **Max two weights per font family.** Stanga: 400 (body) + 700 (bold for names/titles). Elamy: 400 only.

3. **Line length cap ~65ch** on desktop for comfortable reading. Use `max-w-[65ch]` or the `Container` primitive's `maxWidth` prop.

4. **`BodyText` primitive** (`src/components/primitives/ui/BodyText.tsx`) is the standard paragraph component. It renders at `type-body` (16–18px/400) and inherits color from the nearest `[data-bg-tone]` ancestor. To override size, pass a `type-*` class via `className`:
   ```tsx
   <BodyText className="type-lead">...</BodyText>  // renders at type-lead, not type-body
   ```
   BodyText detects the `type-*` prefix and skips adding `type-body` to avoid cascade collisions.

5. **Never add both `type-body` and another `type-*` class to the same element manually.** The CSS declaration order means `type-body` (declared later) would win, silently overriding your intended size. Use BodyText's `className` prop or a plain `<p className="type-lead ...">` instead.

6. **`data-body-large` is deprecated.** It was a transitional hack that force-bolded body text for accessibility. It has been removed from `BodyText`. Do not add it to new elements — solve contrast via the color system instead (see below).

---

## Color System

### The palette (4 colors only — do not add new hexes)

| Token | Hex | Role |
|---|---|---|
| `--color-canva-dark` | `#574964` | Dark plum — dark card bg / primary text on light |
| `--color-canva-mid` | `#9F8383` | Mid mauve — accent card bg / brand |
| `--color-canva-light` | `#C8AAAA` | Light blush — soft accent card bg |
| `--color-canva-bg` | `#fff0e4` | Warm cream — light card bg / page bg |

> `--color-white` is aliased to `#fff0e4` (the cream), **not** `#ffffff`. Never use `bg-white` for a brand surface — it gives pure white, not the brand cream.

---

### Contrast pairs (never deviate)

| Background | Text | WCAG ratio | Notes |
|---|---|---|---|
| Dark `#574964` | Cream `#fff0e4` | **7.4:1 ✅ AAA** | Full freedom — any size/weight |
| Cream `#fff0e4` | Dark `#574964` | **7.4:1 ✅ AAA** | Full freedom — any size/weight |
| Light `#C8AAAA` | Dark `#574964` | 3.9:1 ⚠️ | Large text only (≥24px regular OR ≥18.67px bold) |
| Mid `#9F8383` | Cream `#fff0e4` | 3.1:1 ⚠️ | Large text only |

**Rule of thumb:** Dark + Mid backgrounds → cream text. Light + Cream backgrounds → dark text.

---

### Content-aware color assignment

Because Mid and Light only pass WCAG AA for large text, **assign card tone by content type** — do not force body copy bold to compensate (that flattens the type hierarchy):

- **Dark / Cream** → paragraph-heavy cards (running body text, captions, contact details, forms, credential lists). Full type freedom at any size/weight.
- **Mid / Light** → cards with display/quote-scale text only (`.type-title`, `.type-quote`, ≥24px) or image-dominant cards with minimal text.
- Nested card surfaces (TestimonialCard, ExpertiseCard, StepCard) are judged by their **own visible background**, not the parent section tone.

---

### Card backgrounds — sequence and implementation

Cards are full-screen sections (`min-h-[100svh]`). Backgrounds progress through the palette for visual rhythm, but tone is chosen **content-first** (per the rule above), not by a rigid cycle. The 3 photo cards (Hero, CTA band, Footer) keep photographic treatment + dark overlay and sit outside the palette sequence.

**Implementation — `Section` primitive:**
```tsx
<Section bgVariant="dark" fullHeight>   // dark bg, cream text auto-set
<Section bgVariant="mid" fullHeight>    // mid bg, cream text auto-set
<Section bgVariant="light" fullHeight>  // light bg, dark text auto-set
<Section bgVariant="cream" fullHeight>  // cream bg, dark text auto-set
```

Each `bgVariant` sets a `data-bg-tone` attribute on the `<section>` element. CSS in `globals.css` applies background-color, text color, and `--header-color` automatically — **no need to manually pass `onDark` to child primitives** when using the Section primitive.

For bespoke `<section>` elements that don't use the primitive, add `data-bg-tone="dark|mid|light|cream"` directly.

---

## Layout

- **Every solid card must fill 100svh on desktop.** Use `fullHeight` on the `Section` primitive or `min-h-[100svh] flex flex-col justify-center` on bespoke sections.
- **Photo cards** (Hero, CTA band, Footer) are exempt — their height is controlled by their photographic content.
- **Mobile:** all cards reflow to single-column. Test at 375px. Body text at 375px uses the clamp minimum — ensure it's comfortable (`.type-body` floor is 16px, `.type-lead` floor is 18px).
- **No horizontal overflow.** Check `document.documentElement.scrollWidth > document.documentElement.clientWidth` after any layout change.
