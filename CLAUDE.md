# Netta Shemesh Website — Design Guidelines

> Architecture, repo map, commands: `agents.md` (open it only when you need to find code or run tests). Full rule text: `docs/design-system-reference.md`, see the 'When to read' note at its bottom.

## Typography

| Token | Family | Role |
|---|---|---|
| `var(--font-display)` | Elamy (script) | Hero H1 + section H2 (700); step numerals + signature (400) only |
| `var(--font-stanga)` | Stanga (sans) | Everything else: paragraphs, names, labels, nav, CTA |
| `var(--font-latin)` | Roboto Condensed | Latin letters, ©, gershayim (״) that Stanga lacks; phone + email |

**Elamy is a decorative script. Never use it for body paragraphs**.

### The Type Scale — use these classes, nothing else

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

**Blog exception:** `.type-read` (20 → 23px) and `.type-read-lead` (22 → 28px), `PostBody` only. **Floor: no text below 14px.**

### Rules (numbers are cited from code and docs; keep them stable)

1. **Hierarchy comes from size + font, not bold.** `font-bold` only on names, card titles, CTAs.
2. **Max two weights per family.** Stanga 400 + 700; Elamy 400 + 700 (700 headings only); Roboto Condensed 400 + 700.
3. **Line length cap ~65ch**: `max-w-prose` or `Container`'s `maxWidth`.
4. **`BodyText`** (`primitives/ui/BodyText.tsx`) is the paragraph component: `type-body`, colour from the nearest `[data-bg-tone]`. Override size with `<BodyText className="type-lead">` (it then skips `type-body`).
5. **Never put `type-body` and another `type-*` on one element** (`type-body` is declared later and silently wins). Use BodyText's `className` or a plain `<p className="type-lead ...">`.
6. **Latin:** Stanga has no A–Z/a–z, ©, or gershayim (it has digits). Roboto Condensed (`--font-latin`, `next/font/local`) is the companion via the `--font-body` stack; put `.font-latin` on phone numbers and emails. Keep `adjustFontFallback: false` in `src/app/fonts.ts`. Hebrew fallbacks `stanga-fb`/`elamy-fb`: ref §2.
7. **No ad-hoc sizes.** Only `.type-*` (plus the blog exception): no `text-[...]`/`clamp()` overrides, `font-black`/`font-sans`, or `leading-[...]`/`tracking-[...]` on `.type-*` text (allowed: `tracking-[-0.01em]` on `.type-display`). Buttons and desktop nav links are `.type-lead font-bold`, no uppercase/tracking; hero subtext is `.type-quote`.
8. **Section subtitle** = `.type-quote` + `max-w-prose`, aligned with the title, `mt-3 md:mt-4`. `.type-lead` is for running copy, not subtitles. Use `<SectionHeader align="center">` (or `<SectionTitle>` + `<SectionSubtitle>` when they reveal separately). Never add `font-bold`/`tracking-[-0.01em]` to `.type-title` (baked in) or re-type the subtitle classes (sanity suite fails). Only variant: `align="column"` (Services side column).

---

## Color

| Token | Hex | Role |
|---|---|---|
| `--color-plum` | `#7A5978` | Dark: dark card bg / text on light |
| `--color-mauve` | `#C49AB8` | Mid: accent bg, no essential text |
| `--color-blush` | `#ECC8CE` | Light: soft accent bg |
| `--color-cream` | `#FFF5F0` | Page / light card bg |

Four colours only. `--color-white` is aliased to cream `#FFF5F0`, **not** `#fff`; never `bg-white`.
Write colours as theme utilities (`text-plum`, `bg-cream`, `ring-cream/35`, tints as `/NN` modifiers). No `text-[var(--color-plum)]`, no `-white` utilities (sanity rules `arbitrary-colour-var`, `white-utility`). Derived tokens: ref §3.

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

**Owner-approved exceptions: do NOT "fix" these.** Cream titles directly on the mauve Intro, Reignite and ContactOffice sections (2.11–2.22); the ContactFAB WhatsApp half keeps native green `#25D366` with a white label (1.98). Sanity suite: `OWNER_EXCEPTIONS`.

### Section primitive

```tsx
<Section tone="dark|mid|light|cream" fit="free|lock|grow">  // sets data-bg-tone: bg, text colour, --header-color
```
Don't pass `onDark` to children. Bespoke `<section>`s add `data-bg-tone="dark|mid|light|cream"` directly. Photo cards (Hero, CTA band, Footer) sit outside the palette.

---

## Layout

- **Desktop (lg+): every solid card is ≥ 100svh** via `Section`'s `fit` (`lg:screen-fit` = `min-height: var(--card-h)`) or `lg:screen-fit flex flex-col justify-center` on bespoke sections. Never write `min-h-[100svh]`/`min-h-lvh` in a component; the unit lives in `--card-h` (`globals.css`).
- **Below lg, cards are content-height** (section padding only, no min-height). Exactly four stay one screen: **hero, credentials, CTA band, footer** (`phone="screen"`; hero `hero-fit`; footer `screen-visible`). Adding one means editing the `PHONE` table in `tests-unit/sanity/one-screen.test.tsx`. Below lg `--card-h`/`--hero-h` are `100lvh`; **never `dvh` on a card** (exception: footer `screen-visible`). iOS 26 hero overshoot: ref §7.
- **Soft snap** (`SoftSnap` → `SlidePager`, `src/lib/slide-pager.ts`): one card per wheel/key gesture only at ≥1024px with a fine pointer. Phones, tablets and coarse pointers scroll natively with no snap code; **do not reintroduce touch snap**. No CSS scroll-snap.
- **Surfaces** (`src/components/primitives/`, see its `README.md`): inner cards `<Card surface="cream|veil">`, framed photos `<Photo radius>`, icons `<MaskIcon>`, round icon buttons `<IconButton label>`. No hand-written `bg-[var(--color-cream)]` or re-typed `object-cover` frames.
- **Header/nav:** below `md` a hamburger opens a full-screen overlay (`site/SiteNav` + `MobileMenu`, portaled to `document.body`; no `transform` on ancestors). Never a squeezed inline nav on mobile.
- **Mobile:** single column, test at 375px. **No horizontal overflow** (`documentElement.scrollWidth > clientWidth`).
- **No iframe embedding** (`frame-ancestors 'none'`); see ref §8 before changing.
