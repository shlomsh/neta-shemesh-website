# Netta Shemesh Website — Design Guidelines

> Repo map, commands, deploy: `README.md`. Most rules are enforced by `npm run test:sanity`.

## Typography

| Token | Family | Role |
|---|---|---|
| `var(--font-display)` | Elamy (script) | Hero H1 + section H2 (700); step numerals + signature (400) only |
| `var(--font-stanga)` | Stanga (sans) | Everything else: paragraphs, names, labels, nav, CTA |
| `var(--font-latin)` | Roboto Condensed | Latin letters, ©, gershayim (״) that Stanga lacks; phone + email |

**Elamy is a decorative script. Never use it for body paragraphs**.

### The Type Scale — use these classes, nothing else

Sizes below are **px at the default 16px root; the CSS uses rem** (the root font size is never pinned, so the scale follows the visitor's browser setting).

| Class | Mobile → Desktop | Font | Weight | Line-height | Use for |
|---|---|---|---|---|---|
| `.type-display` | 40px → 72px | accent | 400 (700 on the hero H1) | 1.05 | Hero H1, step numerals |
| `.type-title` | 30px → 52px | accent | 700 | 1.15 | Section H2, footer tagline |
| `.type-card-title` | 22px → 30px | body | **700** | 1.25 | Card/step headings |
| `.type-quote` | 24px → 32px | body (Stanga) | 400 | 1.50 | Pull-quotes, statements, blush/mauve card copy |
| `.type-lead` | 18px → 22px | body | 400 | 1.60 | First paragraph of a section |
| `.type-body` | 16px → 18px | body | 400 | 1.65 | Default body copy |
| `.type-small` | 14px → 16px | body | 400 | 1.50 | Captions, attribution subtitle |
| `.type-eyebrow` | 14px fixed | body | 700 | 1.40 | Labels (uppercase, +0.08em tracking) |
| `.type-signature` | 32px → 56px | accent | 400 | 1.10 | Handwritten signature |

**Blog exception:** `.type-read` (20 → 23px) and `.type-read-lead` (22 → 28px), `PostBody` only. **Floor: no text below 0.875rem (14px).**

### Rules (numbers are cited from code and docs; keep them stable)

1. **Hierarchy comes from size + font, not bold.** `font-bold` only on names, card titles, CTAs.
2. **Max two weights per family.** Stanga 400 + 700; Elamy 400 + 700 (700 headings only); Roboto Condensed 400 + 700.
3. **Line length cap ~65ch**: `max-w-prose` or `Container`'s `maxWidth`.
4. **`BodyText`** is the paragraph component: `type-body`, colour from the nearest `[data-bg-tone]`. Override size with `<BodyText className="type-lead">` (it then skips `type-body`).
5. **Never put `type-body` and another `type-*` on one element** (`type-body` is declared later and silently wins). Use BodyText's `className` or a plain `<p className="type-lead ...">`.
6. **Latin:** Stanga has no A–Z/a–z, ©, or gershayim (it has digits). Roboto Condensed (`--font-latin`, `next/font/local`) is the companion via the `--font-body` stack; put `.font-latin` on phone numbers and emails. Keep `adjustFontFallback: false` in `src/app/fonts.ts` (no generated Arial ahead of the companion). Hebrew-only metric-matched faces `stanga-fb`/`elamy-fb` (`globals.css`): re-run `node scripts/font-fallback-metrics.mjs` after a font file change.
7. **No ad-hoc sizes.** Only `.type-*` (plus the blog exception): no `text-[...]`/`clamp()` overrides, `font-black`/`font-sans`, or `leading-[...]`/`tracking-[...]` on `.type-*` text (allowed: `tracking-[-0.01em]` on `.type-display`). Buttons and desktop nav links are `.type-lead font-bold`, no uppercase/tracking; hero subtext is `.type-quote`.
8. **Section subtitle** = `.type-quote` + `max-w-prose`, aligned with the title, `mt-3 md:mt-4`. `.type-lead` is for running copy, not subtitles. Use `<SectionHeader align="center">` (or `<SectionTitle>` + `<SectionSubtitle>` when they reveal separately). Never add `font-bold`/`tracking-[-0.01em]` to `.type-title` (baked in) or re-type the subtitle classes (sanity fails). Only variant: `align="column"` (Services side column).
9. **Elamy section titles never animate** (`.type-title`: no `ScrollReveal`, opacity, transform or colour transition on it or an ancestor). Elamy's declared ascent is far below its swash ink and iPhone Safari repaints only the declared height, so any animated repaint cuts the swash tops. `SectionHeader`'s `subtitleReveal` reveals the subtitle only. The hero H1 is static too (no `hero-enter`), and Elamy headings never sit in an `overflow-hidden`/`auto` section below lg (use `overflow-clip`), nor are centred (`items-center`) in a taller flex/grid row (SectionTitle's marker row is `items-start`, marker `self-center`). Guard: `tests/elamy-static.spec.ts`. (Out of scope: step numerals, signature.)

---

## Color

| Token | Hex | Role |
|---|---|---|
| `--color-plum` | `#7A5978` | Dark: dark card bg / text on light |
| `--color-mauve` | `#C49AB8` | Mid: accent bg, no essential text |
| `--color-blush` | `#ECC8CE` | Light: soft accent bg |
| `--color-cream` | `#FFF5F0` | Page / light card bg |

Four colours only. `--color-white` is cream `#FFF5F0`, **not** `#fff`; never `bg-white`.
Write colours as theme utilities (`text-plum`, `bg-cream`, `ring-cream/35`, tints as `/NN` modifiers). No `text-[var(--color-plum)]`, no `-white` utilities (sanity rules `arbitrary-colour-var`, `white-utility`). Derived tokens live once in `@theme` (`bg-plum-hover`, `bg-cream-hover`, `bg-whatsapp`, `max-w-prose`, `focus-ring`); never re-spell them.

### Contrast pairs (never deviate)

Thresholds: AA normal ≥ 4.5, AA large ≥ 3 (large = ≥24px regular or ≥18.67px bold).

| Background | Text | Ratio | Notes |
|---|---|---|---|
| Plum `#7A5978` | Cream | **5.55 ✅** | Any size/weight |
| Cream `#FFF5F0` | Plum | **5.55 ✅** | Any size/weight |
| Blush `#ECC8CE` | Plum | 3.89 ⚠️ | Large text only |
| Mauve `#C49AB8` | Cream | 2.26 ❌ | Fails even large |
| Mauve `#C49AB8` | Plum | 2.46 ❌ | Fails even large |
| Blush `#ECC8CE` | Cream | 1.43 ❌ | Never |

Dark bg → cream text; light/cream bg → plum text. **Mauve has no compliant text pair**: use it for shapes, fills, frames only. Choose tone by content: running body, captions, forms, credentials → plum/cream; blush → only `.type-title`/`.type-quote`-scale (≥24px) text or image cards. Never fix contrast by bolding body copy. Nested cards (TestimonialCard, StepCard) are judged by their own background; inner cards on mauve use `--surface-veil` (4.97 vs plum).

**Owner-approved exceptions: do NOT "fix" these.** Cream titles directly on the mauve Intro, Reignite and ContactOffice sections (2.11–2.22); the ContactFAB WhatsApp half keeps native green `#25D366` with a white label (1.98). See `OWNER_EXCEPTIONS`.

### Section primitive

```tsx
<Section tone="dark|mid|light|cream" fit="free|lock|grow">  // sets data-bg-tone: bg, text, --header-color
```
Don't pass `onDark` to children. Bespoke `<section>`s add `data-bg-tone="dark|mid|light|cream"` directly. Photo cards (Hero, CTA band, Footer) sit outside the palette.

---

## Layout

- **Every solid card is ≥ one screen at every width.** Desktop (lg+) ≥ 100svh; below lg ≥ 100lvh (NS-61, reverses NS-39: a content-height card let the next one peek in under it). Via `Section`'s `fit` (`screen-fit` = `min-height: var(--card-h)`, content centred with `flex flex-col justify-center`) or `screen-fit flex flex-col justify-center` on bespoke sections. A taller card grows and the page scrolls; never clip. Never write `min-h-[100svh]`/`min-h-lvh` in a component; the unit lives in `--card-h` (`globals.css`).
- **Below lg** the hero uses `hero-fit` (`--hero-h`) and the footer `screen-visible` (the one `dvh` exception); `--card-h`/`--hero-h` are `100lvh`, so **never `dvh` on a card**. iOS 26 Safari: `--hero-h` is `calc(100lvh + 80px)` below lg (rationale in `globals.css`).
- **Soft snap** (`SoftSnap` → `SlidePager`): one card per wheel/key gesture only at ≥1024px with a fine pointer; all else scrolls natively. **Do not reintroduce touch snap**; no CSS scroll-snap.
- **Surfaces** (`src/components/primitives/`, contracts in `src/components/README.md`): inner cards `<Card surface="cream|veil">`, framed photos `<Photo radius>`, icons `<MaskIcon>`, round icon buttons `<IconButton label>`. No hand-written `bg-[var(--color-cream)]` or re-typed `object-cover` frames.
- **Header/nav:** below `md` a hamburger opens a full-screen overlay (`SiteNav` + `MobileMenu`, portaled to `document.body`; no `transform` on ancestors). Never a squeezed inline nav.
- **Units:** rem for text, spacing, sizes and max-widths (`gap-4`, `max-w-3xl`, `clamp(1rem,4vw,3rem)`); an arbitrary `[Npx]` that equals a Tailwind step takes the step. px stays only for hairlines (border, ring, outline), shadows, motion offsets, `sizes=` and image `width`/`height`, SVG geometry. Never set `font-size` on `html`.
- **Spacing:** fluid padding, margin and gap come from eight steps in `@theme` (`globals.css`): `gutter`, `gutter-wide` (sides), `stack` 16-24, `panel` 24-40, `region` 28-56 (gaps), `section-tight` 48-96, `section-mid` 44-88, `section` 56-120 (vertical; also big gaps), px at the 16px root. Write `gap-stack`, `py-section-mid`, `mb-region`; **no ad-hoc `clamp()` spacing** (sanity `source-scan` lists the nine documented exceptions).
- **Mobile:** single column, test at 375px. **No horizontal overflow** (`scrollWidth > clientWidth`).
- **No iframe embedding** (`frame-ancestors 'none'` in `next.config.ts`); `RevealObserver` already skips iframes.

---

## Code rules

- **Content is single source:** `src/content/` (`site.ts` facts, `ids.ts` ids/anchors, `home/*.ts` copy). No phone, email, street or id literal in a component.
- **Home** is `<PageShell overflow="clip">`, never `hidden` (kills soft snap, sticky); only the blog passes `hidden`. Sections, parallax and footer clip with `overflow-clip`.
- **Reduced motion is CSS-only.** Never branch on `useReducedMotion()` (SSR ships `opacity:0`); no `delay={0}`; stagger with `stagger(i)` from `src/lib/motion.ts`.
- **Fonts:** `next/font/local` only, never `next/font/google`; `./fonts` import stays before `globals.css` in `layout.tsx`.
- **Head:** Metadata API, never a hand-written `<head>`/`<link>`. Never lazy-load the LCP image.
- **RTL:** logical utilities (`text-start`, `start-*`, `end-*`, `ms-*`, `ps-*`, `border-s`); only `<html>` has `dir="rtl"`; `dir="ltr"` on phones, emails, numerals. ESLint enforces it (`eslint.config.mjs` bans `text-left/right`, `ml/mr/pl/pr-*`, `border-l/r`, `rounded-l/r`, `left/right-N` in `.tsx`); a real physical need takes `// eslint-disable-next-line no-restricted-syntax -- reason`.
- **Rendering:** `safari-clip` on rounded `overflow-hidden` parents (`Photo` does it). Decorative SVG `absolute z-0 pointer-events-none`, content `z-10`. Faded bg image = full-opacity `<img>` + tinted overlay.
- **Parked on purpose, not dead code:** testimonials (`SHOW_TESTIMONIALS = false` in `page.tsx`, `sections/testimonials/`).
- **Next.js 16** differs from training data: read only the one guide in `node_modules/next/dist/docs/` for the API you touch, never the folder.
- **Tests:** never re-baseline or relax an assertion to get green (fix `helpers.ts`/`SCAN_RULES`). Fade-ins: assert `toHaveCSS('opacity','1')`, not `toBeVisible()`. Gate: `npm run lint`, `npm run typecheck`, `npm run test:unit`, then Playwright on a fresh port (`README.md`; projects chromium, webkit, iphone, ipad): a stale server tests old code.
- **Git:** `main` only. No `stash`, `checkout .`, `clean`, `reset`, `rebase`, force-push. Don't commit scratch, screenshots, logs.
- **Context hygiene:** pipe build/test output through `tail`; grep, don't open, `tests-unit/sanity/helpers.ts` and `globals.css`.
