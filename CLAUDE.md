# Netta Shemesh Website — Design Guidelines

> Full project context: see `agents.md`. This file focuses on **design system rules** — typography, color, and layout — that every agent must follow before touching any visual code.

---

## Typography

### Fonts (two fonts, strict roles)

| Token | Family | Role |
|---|---|---|
| `var(--font-display)` | Elamy (handwriting/display) | Hero H1 + section H2 (700), step numerals + signature (400) only |
| `var(--font-stanga)` | Stanga (clean sans) | Everything else — paragraphs, names, labels, nav, CTA |
| `var(--font-latin)` | Roboto Condensed (Latin/digit companion) | Latin letters and digits Stanga lacks; phone + email |

**Elamy is a decorative script. Never use it for body paragraphs.** It is illegible as running text, especially in Hebrew RTL. This was a real production bug.

---

### The Type Scale — use these classes, nothing else

All sizes are fluid `clamp()`, mobile-first. **Do not hardcode `text-[XXpx]` or ad-hoc weights.** The random sizes from the original template export (13/15/16/18.67/28/31px) have been replaced with this canonical scale.

| Class | Mobile → Desktop | Font | Weight | Line-height | Use for |
|---|---|---|---|---|---|
| `.type-display` | 40px → 72px | accent | 400 (700 on the hero H1) | 1.05 | Hero H1, step numerals |
| `.type-title` | 30px → 52px | accent | 700 (headings) | 1.15 | Section H2, footer tagline |
| `.type-card-title` | 22px → 30px | body | **700** | 1.25 | Card/step headings |
| `.type-quote` | 24px → 32px | body (Stanga) | 400 | 1.50 | Pull-quotes, personal statements, blush/mauve card copy |
| `.type-lead` | 18px → 22px | body | 400 | 1.60 | First paragraph of a section |
| `.type-body` | 16px → 18px | body | 400 | 1.65 | Default body copy |
| `.type-small` | 14px → 16px | body | 400 | 1.50 | Captions, attribution subtitle |
| `.type-eyebrow` | 14px fixed | body | 700 | 1.40 | Labels / eyebrows (uppercase, +0.08em tracking) |
| `.type-signature` | 32px → 56px | accent | 400 | 1.10 | Handwritten signature element |

**Blog exception:** `.type-read` (20px → 23px) and `.type-read-lead` (22px → 28px) are the long-form article sizes used by the blog `PostBody` only.

**Floor rule: no text below 14px anywhere on the site.** `type-small` is the minimum. Anything smaller (e.g. old `text-xs`, `text-[12px]`) fails mobile readability and accessibility.

---

### Typography rules (apply before writing any font/size/weight code)

1. **Build hierarchy with size + font, not bold.** Use `.type-quote` (large, regular) vs `.type-body` (smaller, regular) to create contrast. `font-bold` belongs only on names, card titles, and CTAs — not on body paragraphs.

2. **Max two weights per font family.** Stanga: 400 (body) + 700 (bold for names, card titles, nav, CTAs). Elamy: 400 + 700 (700 for headings only: hero H1 and section H2; 400 for step numerals and the signature). Roboto Condensed: 400 + 700.

3. **Line length cap ~65ch** on desktop for comfortable reading. Use `max-w-[65ch]` or the `Container` primitive's `maxWidth` prop.

4. **`BodyText` primitive** (`src/components/primitives/ui/BodyText.tsx`) is the standard paragraph component. It renders at `type-body` (16–18px/400) and inherits color from the nearest `[data-bg-tone]` ancestor. To override size, pass a `type-*` class via `className`:
   ```tsx
   <BodyText className="type-lead">...</BodyText>  // renders at type-lead, not type-body
   ```
   BodyText detects the `type-*` prefix and skips adding `type-body` to avoid cascade collisions.

5. **Never add both `type-body` and another `type-*` class to the same element manually.** The CSS declaration order means `type-body` (declared later) would win, silently overriding your intended size. Use BodyText's `className` prop or a plain `<p className="type-lead ...">` instead.

6. **Latin and digits: Stanga has no Latin glyphs** (no A–Z / a–z, no ©). The Latin companion is **Roboto Condensed** (`--font-latin`, 400 + 700, self-hosted via `next/font/local`). `--font-body` is `stanga, latin, sans-serif`, so Latin inside Hebrew text falls through to the companion automatically, never Arial. Use the `.font-latin` utility explicitly on phone numbers and email addresses. Stanga's `adjustFontFallback` stays `false` in `src/app/fonts.ts` so no generated Arial fallback sits ahead of the companion.

7. **No ad-hoc sizes.** Components use only the `.type-*` classes above (plus the blog exception). No `text-[...]`/`clamp()` size overrides, no `font-black`/`font-sans`, no `leading-[...]` or `tracking-[...]` on text that carries a `.type-*` class (allowed: `tracking-[-0.01em]` on Elamy headings). Buttons and desktop nav links are `.type-lead font-bold` (18–22px) with no uppercase and no tracking; the hero subtext is `.type-quote`. `data-body-large` has been removed.

8. **Section subtitle** (the one line under an H2, part of the title lockup) = `.type-quote` + `max-w-[65ch]`, aligned with the title (centred when the title is centred, right-aligned otherwise), `mt-3 md:mt-4` under the title. `.type-lead` is for the first paragraph of running copy, not for subtitles. Write the lockup with `<SectionHeader align="center">` (or `<SectionTitle>` + `<SectionSubtitle>` when the two lines reveal separately); never re-type `type-title font-bold tracking-[-0.01em]` or the subtitle's `type-quote max-w-[65ch] mt-3 md:mt-4` in a component (the sanity suite fails on it). The one documented exception, the Services side column (`mt-5 md:mt-9`, no 65ch cap, for the Elamy "?" descender), is the named variant `align="column"` (title and subtitle centred below md, right-aligned from md).

---

## Color System

### The palette (4 colors only — do not add new hexes)

> **2026-10-08:** the palette was re-tuned; the values below (matching `@theme` in `src/app/globals.css`) are the canonical ones. The earlier #574964 / #9F8383 / #C8AAAA / #fff0e4 set is retired.

| Token | Hex | Role |
|---|---|---|
| `--color-plum` | `#7A5978` | Dark plum — dark card bg / primary text on light |
| `--color-mauve` | `#C49AB8` | Mid mauve — accent card bg / brand |
| `--color-blush` | `#ECC8CE` | Light blush — soft accent card bg |
| `--color-cream` | `#FFF5F0` | Warm cream — light card bg / page bg |

> `--color-white` is aliased to `#FFF5F0` (the cream), **not** `#ffffff`. Never use `bg-white` for a brand surface — it gives pure white, not the brand cream.

**Write colours as the named theme utilities** (`text-plum`, `bg-cream`, `bg-mauve`, `ring-cream/35`, `outline-plum`, `border-mauve`, `focus-visible:ring-offset-cream` ...): each `@theme` colour name is the utility. Do not write the arbitrary form `text-[var(--color-plum)]` and do not use the `-white` utilities (`text-white`, `bg-white/35`) or the retired aliases (`-text-primary`, `-dark`, `-bg-light`, `-brand-primary`); say cream/plum/mauve. The sanity suite (`source-scan.test.ts`, rules `arbitrary-colour-var` and `white-utility`) fails on them. What stays arbitrary on purpose: `bg-[var(--surface-veil)]` (the cream-over-mauve veil), `text-[color:var(--header-color)]` (follows the section tone) and `color-mix(...)` hover/outline tints.

---

### Contrast pairs (never deviate)

Ratios are computed with the WCAG 2.x relative-luminance formula. Thresholds: AAA normal ≥ 7, AA normal ≥ 4.5, AA large ≥ 3 (large = ≥24px regular OR ≥18.67px bold).

| Background | Text | WCAG ratio | Notes |
|---|---|---|---|
| Dark `#7A5978` | Cream `#FFF5F0` | **5.55:1 ✅ AA** | Passes AA at any size/weight (not AAA) |
| Cream `#FFF5F0` | Dark `#7A5978` | **5.55:1 ✅ AA** | Passes AA at any size/weight (not AAA) |
| Light `#ECC8CE` | Dark `#7A5978` | 3.89:1 ⚠️ | Large text only (≥24px regular OR ≥18.67px bold) |
| Mid `#C49AB8` | Cream `#FFF5F0` | 2.26:1 ❌ | **Fails AA even for large text** |
| Mid `#C49AB8` | Dark `#7A5978` | 2.46:1 ❌ | Fails AA even for large text |
| Light `#ECC8CE` | Cream `#FFF5F0` | 1.43:1 ❌ | Never |

A translucent mauve surface (`bg-mauve/75` = mauve at 75% over plum ≈ `#B28AA8`) with cream text measures 2.76:1 — also below 3:1 (the old hero pill; the hero nav/CTA are now cream-on-plum buttons, 5.55:1).

**Rule of thumb:** Dark backgrounds → cream text. Light + Cream backgrounds → dark text. **Mid has no compliant text pair** — use it for surfaces that carry no text (shapes, fills, image frames, decorative highlights) or only non-essential text; do not place essential copy on it.

---

### Content-aware color assignment

Because Light only passes WCAG AA for large text and Mid fails it entirely, **assign card tone by content type** — do not force body copy bold to compensate (that flattens the type hierarchy):

- **Dark / Cream** → paragraph-heavy cards (running body text, captions, contact details, forms, credential lists). Full type freedom at any size/weight (AA).
- **Light** → cards with display/quote-scale text only (`.type-title`, `.type-quote`, ≥24px) or image-dominant cards with minimal text.
- **Mid** → no essential text. Reserve it for decorative surfaces, shapes and image-dominant cards; if a card needs readable text, move it to Dark or Cream.
- Nested card surfaces (TestimonialCard, ExpertiseCard, StepCard) are judged by their **own visible background**, not the parent section tone.
- Inner cards on mid (mauve) sections use `--surface-veil` (cream 85% over mauve, 4.97:1 vs plum) so lead/body copy is allowed; solid blush inner cards need quote-scale text.

**Owner-approved exceptions (2026-10-09)** — deliberate, not bugs; future contrast work must not "fix" them:
- Cream titles stay directly on the mauve (mid) sections Intro, Reignite (title and subtitle) and ContactOffice, at 2.11–2.22, below even the large-text threshold. The owner saw the alternatives (a cream panel behind the title, or re-toning the sections to plum) and kept them as they are.
- The WhatsApp half of the ContactFAB keeps WhatsApp's native green `#25D366` with a white label and glyph, at 1.98. It is the brand CTA; the owner overruled a contrast fix.
- The Expertise card pills keep their mauve fill with cream text (`bg-mauve opacity-95`), measured at about 2.12–2.29. The owner saw the cream-pill alternative (plum text on cream, 5.55) and kept the mauve pills.

The sanity suite's `OWNER_EXCEPTIONS` table (NS-42) holds the matching entries.

---

### Card backgrounds — sequence and implementation

Cards are full-screen sections on desktop and content-height on phones (see Layout). Backgrounds progress through the palette for visual rhythm, but tone is chosen **content-first** (per the rule above), not by a rigid cycle. The 3 photo cards (Hero, CTA band, Footer) keep photographic treatment + dark overlay and sit outside the palette sequence.

**Implementation — `Section` primitive:**
```tsx
<Section tone="dark" fit="free">   // dark bg, cream text auto-set
<Section tone="mid" fit="lock">    // mid bg, cream text auto-set
<Section tone="light" fit="lock">  // light bg, dark text auto-set
<Section tone="cream" fit="grow">  // cream bg, dark text auto-set
```

Each `tone` sets a `data-bg-tone` attribute on the `<section>` element. CSS in `globals.css` applies background-color, text color, and `--header-color` automatically — **no need to manually pass `onDark` to child primitives** when using the Section primitive.

For bespoke `<section>` elements that don't use the primitive, add `data-bg-tone="dark|mid|light|cream"` directly.

---

## Layout

- **Desktop (lg and up): every solid card fills at least 100svh.** Use `fit` (`free` | `lock` | `grow`) on the `Section` primitive (it applies `lg:screen-fit` = `min-height: var(--card-h)`, or the grow's own `lg:min-h-[max(100svh,720px)]`, and publishes `data-fit`) or `lg:screen-fit flex flex-col justify-center` on bespoke sections. Never spell `min-h-[100svh]` / `min-h-lvh` in a component: the unit decision lives in `--card-h` (`globals.css`). Cards whose content is taller than the viewport simply grow past 100svh, which is fine.
- **Phones and portrait tablets (below lg): cards are content-height** (owner-approved 2026-10-09, NS-39; this replaces the old "every card is a full screen on mobile" rule). A card is as tall as its content plus its section padding (`pad="section"` etc.), with no min-height, so there is no empty void under short content and no cut-off or awkward full-screen card. Exactly four cards stay one screen on a phone: the **hero, the credentials card, the CTA band and the footer**. On `Section` that is `phone="screen"` (`screen-fit` at every width, published as `data-phone`); the hero is bespoke (`hero-fit` = `min-height: var(--hero-h)`) and the footer is `screen-visible`. Below lg `--card-h` and `--hero-h` are `100lvh` (the collapsed-toolbar height, static, so a one-screen card leaves no strip of the next card and nothing resizes when the toolbar toggles); never `dvh` on a card. Adding a card to the one-screen list is a decision: edit the `PHONE` table in `tests-unit/sanity/one-screen.test.tsx` with it.
- **Photo cards** (Hero, CTA band, Footer) are exempt from the palette rotation and keep their one-screen height on phones — their height is controlled by their photographic content. The Footer is the exception that fills the *visible* screen: `screen-visible` (`--card-h` upgraded to `100dvh` where supported), because on iOS Safari `svh` is shorter than the screen once the toolbar collapses and a strip of the previous card shows. Its content group is centred (`my-auto`) with the copyright last.
- **Soft snap** (`SoftSnap`, pure decision in `src/lib/soft-snap.ts`) covers every `main > section` and the footer, only where `(min-width: 1024px) and (pointer: fine)` matches (desktop mouse/trackpad). **There is no snap wherever the primary pointer is coarse (phones, tablets), at any width**: the page scrolls natively there; hybrid touch laptops whose primary pointer is fine get desktop snap. The gentle touch mode (it snapped backward to the hero and to one-screen cards after slow swipes, so iPhones felt stuck) was deleted, along with its touch handlers, `TOUCH_SETTLE_MS` and the lvh probe; do not reintroduce it. `SoftSnap.tsx` is a tiny gate that loads the engine (`SoftSnapEngine.tsx`) by dynamic `import()` only when the query matches, so touch devices ship no snap chunk. The engine skips snapping while the mobile menu overlay is open (`main[inert]` / body scroll lock). Off under `prefers-reduced-motion`.
- **Reusable surfaces** (`src/components/primitives/`, see its `README.md`): an inner card on a toned section is `<Card surface="cream|veil" pad="md|lg">` (it publishes `data-bg-tone="cream"`; never add a hand-written `bg-[var(--color-cream)]`); every framed photo is `<Photo radius="card|tile|none">` (bakes in `overflow-hidden`, the radius, `safari-clip` and the cover fit; do not re-type `object-cover` frames); single-colour SVG icons are `<MaskIcon size="sm|lg">`; icon-only round buttons are `<IconButton label>`.
- **Mobile:** all cards reflow to single-column and size to their content (see above). Test at 375px. Body text at 375px uses the clamp minimum — ensure it's comfortable (`.type-body` floor is 16px, `.type-lead` floor is 18px, blog `.type-read` floor is 18px / `.type-read-lead` 20px).
- **Header/nav:** below `md` the nav collapses to a hamburger that opens a full-screen overlay menu (`site/SiteNav` + `site/MobileMenu`); the inline link row is `hidden md:flex`. Don't reintroduce a squeezed inline nav on mobile. The overlay is portaled to `document.body` for stacking safety: no ancestor sets `will-change` any more (framer-motion, whose `will-change` once trapped `position:fixed` inside the bar, is gone), but a `transform`/`translate` on any ancestor would, and the portal keeps the overlay out of the header's stacking context.
- **No horizontal overflow.** Check `document.documentElement.scrollWidth > document.documentElement.clientWidth` after any layout change.

---

## Embedding the site in an iframe

The site is not iframe-embeddable by design (`frame-ancestors 'none'` in the CSP, `next.config.ts`). If that ever needs to change:

1. Relax the CSP `frame-ancestors` directive.
2. The reveal side needs no change: IntersectionObserver doesn't fire reliably inside an iframe, which used to leave content stuck at `opacity: 0`, so `RevealObserver.tsx` already skips iframes (it never arms the hidden state there and everything stays visible).

This was learned the hard way; a previous attempt (with the old framer-motion reveals) needed two fixes and still didn't render reliably (reverted in `c95a8e0`).
