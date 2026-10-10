# Netta Shemesh Website — Design Guidelines

> Architecture and project context: see `agents.md`. This file is the **lean design-system core** (typography, color, layout) that every agent must follow before touching any visual code. Full text and mechanics: `docs/design-system-reference.md` (see "When to read the reference" at the bottom).

---

## Typography

### Fonts (strict roles)

| Token | Family | Role |
|---|---|---|
| `var(--font-display)` | Elamy (handwriting/display) | Hero H1 + section H2 (700), step numerals + signature (400) only |
| `var(--font-stanga)` | Stanga (clean sans) | Everything else — paragraphs, names, labels, nav, CTA |
| `var(--font-latin)` | Roboto Condensed (Latin companion) | Latin letters, ©, gershayim (״) that Stanga lacks; phone + email |

**Elamy is a decorative script. Never use it for body paragraphs.** It is illegible as running text, especially in Hebrew RTL. This was a real production bug.

---

### The Type Scale — use these classes, nothing else

All sizes are fluid `clamp()`, mobile-first. **Do not hardcode `text-[XXpx]` or ad-hoc weights.**

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

Numbering is cited elsewhere ("rule 5", "rule 8"); full text of each rule in reference §1/§2.

1. **Hierarchy with size + font, not bold.** `.type-quote` vs `.type-body` makes contrast. `font-bold` only on names, card titles, CTAs.
2. **Max two weights per font family** (400 + 700). Elamy 700 = hero H1 and section H2 only; 400 = step numerals and signature.
3. **Line length cap ~65ch** on desktop: `max-w-prose` or `Container`'s `maxWidth`.
4. **`BodyText`** (`src/components/primitives/ui/BodyText.tsx`) is the standard paragraph, `type-body` by default. To change size pass a `type-*` class: `<BodyText className="type-lead">` (it skips adding `type-body`).
5. **Never put `type-body` and another `type-*` class on the same element** (`type-body` is declared later and silently wins). Use BodyText's `className` or a plain `<p className="type-lead ...">`.
6. **Latin:** Stanga has no A–Z/a–z, no © and no gershayim (U+05F4); the fallback to Roboto Condensed is automatic. Put `.font-latin` on phone numbers and email addresses. Do not touch `adjustFontFallback: false` in `src/app/fonts.ts` or the `stanga-fb`/`elamy-fb` blocks in `globals.css` without reading reference §2.
7. **No ad-hoc sizes.** Only the `.type-*` classes (plus the blog exception): no `text-[...]`/`clamp()` size overrides, no `font-black`/`font-sans`, no `leading-[...]`/`tracking-[...]` on `.type-*` text (allowed: `tracking-[-0.01em]` on `.type-display`). Buttons and desktop nav links are `.type-lead font-bold`; hero subtext is `.type-quote`.
8. **Section subtitle** = `.type-quote` + `max-w-prose`, `mt-3 md:mt-4` under the title. Write the lockup with `<SectionHeader align="center">` (or `<SectionTitle>` + `<SectionSubtitle>`); never add `font-bold`/`tracking-[-0.01em]` to `.type-title` or re-type the subtitle classes (the sanity suite fails on it). The Services side column is the named variant `align="column"`. Details: reference §1.

---

## Color System

### The palette (4 colors only — do not add new hexes)

| Token | Hex | Role |
|---|---|---|
| `--color-plum` | `#7A5978` | Dark plum — dark card bg / primary text on light |
| `--color-mauve` | `#C49AB8` | Mid mauve — accent card bg / brand |
| `--color-blush` | `#ECC8CE` | Light blush — soft accent card bg |
| `--color-cream` | `#FFF5F0` | Warm cream — light card bg / page bg |

> `--color-white` is aliased to `#FFF5F0` (the cream), **not** `#ffffff`. Never use `bg-white` for a brand surface — it gives pure white, not the brand cream.

**Colour utilities:** write the named theme utilities (`text-plum`, `bg-cream`, `bg-mauve`, `ring-cream/35`, `border-mauve`). Never `text-[var(--color-plum)]`, never the `-white` utilities (`text-white`, `bg-white/35`) or retired aliases (`-text-primary`, `-dark`, `-bg-light`, `-brand-primary`). Tints are opacity modifiers (`bg-plum/60`), never hand-written `color-mix(... transparent)`. The sanity suite (`source-scan.test.ts`) fails on violations. Derived tokens (`hover:bg-plum-hover`, `hover:bg-cream-hover`, `bg-whatsapp`, `focus-ring`, scrims) and the few deliberate arbitrary values: reference §3.

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

**Rule of thumb:** Dark backgrounds → cream text. Light + Cream backgrounds → dark text. **Mid has no compliant text pair** — use it for surfaces that carry no text (shapes, fills, image frames, decorative highlights) or only non-essential text; do not place essential copy on it.

---

### Content-aware color assignment

Because Light only passes WCAG AA for large text and Mid fails it entirely, **assign card tone by content type** — do not force body copy bold to compensate (that flattens the type hierarchy):

- **Dark / Cream** → paragraph-heavy cards (running body text, captions, contact details, forms, credential lists). Full type freedom at any size/weight (AA).
- **Light** → cards with display/quote-scale text only (`.type-title`, `.type-quote`, ≥24px) or image-dominant cards with minimal text.
- **Mid** → no essential text. Reserve it for decorative surfaces, shapes and image-dominant cards; if a card needs readable text, move it to Dark or Cream.
- Nested card surfaces (TestimonialCard, StepCard) are judged by their **own visible background**, not the parent section tone.
- Inner cards on mid (mauve) sections use `--surface-veil` (cream 85% over mauve, 4.97:1 vs plum) so lead/body copy is allowed; solid blush inner cards need quote-scale text.

**Owner-approved exceptions (2026-10-09) — deliberate, NOT bugs; future contrast work must NOT "fix" them** (tests: the `OWNER_EXCEPTIONS` table in the sanity suite; details in reference §5):
- Cream titles on the mauve sections Intro, Reignite (title and subtitle) and ContactOffice (2.11–2.22).
- The WhatsApp half of the ContactFAB keeps native green `#25D366` with a white label (1.98).

### Section primitive

```tsx
<Section tone="dark" fit="free">   // tone: dark | mid | light | cream — sets bg + text colour (data-bg-tone)
<Section tone="light" fit="lock">  // fit: free | lock | grow
```

No need to pass `onDark` to children. Bespoke `<section>`: add `data-bg-tone="dark|mid|light|cream"`. More: reference §6.

---

## Layout

- **Desktop (lg and up): every solid card fills at least 100svh**, via `fit` on `Section` (or `lg:screen-fit flex flex-col justify-center` on bespoke sections). Never spell `min-h-[100svh]` / `min-h-lvh` in a component (the unit lives in `--card-h`, `globals.css`). **Never `dvh` on a card.**
- **Below lg, cards are content-height** (no min-height). Exactly four stay one screen on a phone: the **hero, the credentials card, the CTA band and the footer** (`phone="screen"` on `Section`; hero is bespoke `hero-fit`; footer `screen-visible`). Changing that list means editing the `PHONE` table in `tests-unit/sanity/one-screen.test.tsx`.
- **Soft snap** is a desktop-only JS slide pager (>= 1024px with a fine pointer); below that and on any coarse pointer the page scrolls natively. **Do not reintroduce touch snap on phones** (it made iPhones feel stuck). No CSS scroll-snap.
- **Header/nav:** below `md` the nav collapses to a hamburger with a full-screen overlay menu; don't reintroduce a squeezed inline nav on mobile.
- Reusable surfaces live in `src/components/primitives/` (`Card`, `Photo`, `MaskIcon`, `IconButton`; see its `README.md`). Don't hand-write `bg-[var(--color-cream)]` or re-type `object-cover` frames.
- **Mobile:** test at 375px.
- **No horizontal overflow.** Check `document.documentElement.scrollWidth > document.documentElement.clientWidth` after any layout change.

---

## When to read the reference (`docs/design-system-reference.md`)

- Full text of typography rules 1–5, 7, 8 (SectionHeader variants, size bans) -> §1
- Touching fonts, `fonts.ts`, `stanga-fb`/`elamy-fb`, Latin/phone/email glyphs -> §2
- Colour utilities, derived/hover tokens, WhatsApp token, `focus-ring`, scrims, allowed arbitrary values -> §3
- Palette re-tune history, translucent mauve contrast -> §4
- Contrast work on mauve sections or the ContactFAB (owner exceptions) -> §5
- Section `tone`/`fit` details, card-background sequencing, bespoke sections -> §6
- Card heights, hero/footer one-screen, iOS 26 overshoot, `--card-h`/`--hero-h` -> §7
- SoftSnap / SlidePager / `slide-pager.ts` -> §7
- Header/mobile menu portal, reusable surfaces (Card/Photo/MaskIcon/IconButton) -> §7
- Embedding the site in an iframe, CSP `frame-ancestors`, RevealObserver -> §8
