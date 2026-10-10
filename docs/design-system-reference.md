# Design System Reference

> Detail moved out of `CLAUDE.md` to keep the auto-loaded context lean. `CLAUDE.md` holds the core rules (type scale, palette, contrast pairs, layout summary); this file holds the full text and mechanics. Where a core rule and this file differ in wording, they are the same rule: this file is the long form. Architecture and project context: `agents.md`.

Contents: §1 Typography rules, full text · §2 Latin and metric-matched fallbacks · §3 Colour-utility conventions · §4 Palette and contrast notes · §5 Owner-approved exceptions · §6 Card backgrounds and the Section primitive · §7 Layout · §8 Embedding the site in an iframe · §9 Type scale history

---

## §1 Typography rules, full text

(Rule numbers match `CLAUDE.md`; other docs and code comments cite "typography rule 5" and "rule 8". Rule 6 is in §2.)

1. **Build hierarchy with size + font, not bold.** Use `.type-quote` (large, regular) vs `.type-body` (smaller, regular) to create contrast. `font-bold` belongs only on names, card titles, and CTAs — not on body paragraphs.

2. **Max two weights per font family.** Stanga: 400 (body) + 700 (bold for names, card titles, nav, CTAs). Elamy: 400 + 700 (700 for headings only: hero H1 and section H2; 400 for step numerals and the signature). Roboto Condensed: 400 + 700.

3. **Line length cap ~65ch** on desktop for comfortable reading. Use `max-w-prose` (`--container-prose`) or the `Container` primitive's `maxWidth` prop.

4. **`BodyText` primitive** (`src/components/primitives/ui/BodyText.tsx`) is the standard paragraph component. It renders at `type-body` (16–18px/400) and inherits color from the nearest `[data-bg-tone]` ancestor. To override size, pass a `type-*` class via `className`:
   ```tsx
   <BodyText className="type-lead">...</BodyText>  // renders at type-lead, not type-body
   ```
   BodyText detects the `type-*` prefix and skips adding `type-body` to avoid cascade collisions.

5. **Never add both `type-body` and another `type-*` class to the same element manually.** The CSS declaration order means `type-body` (declared later) would win, silently overriding your intended size. Use BodyText's `className` prop or a plain `<p className="type-lead ...">` instead.

7. **No ad-hoc sizes.** Components use only the `.type-*` classes above (plus the blog exception). No `text-[...]`/`clamp()` size overrides, no `font-black`/`font-sans`, no `leading-[...]` or `tracking-[...]` on text that carries a `.type-*` class (allowed: `tracking-[-0.01em]` on `.type-display`; `.type-title` already carries it). Buttons and desktop nav links are `.type-lead font-bold` (18–22px) with no uppercase and no tracking; the hero subtext is `.type-quote`. `data-body-large` has been removed.

8. **Section subtitle** (the one line under an H2, part of the title lockup) = `.type-quote` + `max-w-prose`, aligned with the title (centred when the title is centred, right-aligned otherwise), `mt-3 md:mt-4` under the title. `.type-lead` is for the first paragraph of running copy, not for subtitles. Write the lockup with `<SectionHeader align="center">` (or `<SectionTitle>` + `<SectionSubtitle>` when the two lines reveal separately); never add `font-bold` / `tracking-[-0.01em]` to `.type-title` (700 and the tracking are baked into the class) or re-type the subtitle's `type-quote max-w-prose mt-3 md:mt-4` in a component (the sanity suite fails on it). The one documented exception, the Services side column (`mt-5 md:mt-9`, no 65ch cap, for the Elamy "?" descender), is the named variant `align="column"` (title and subtitle centred below md, right-aligned from md).

---

## §2 Latin and metric-matched fallbacks (typography rule 6)

6. **Latin: Stanga has no Latin letters** (no A–Z / a–z), no © and no gershayim (U+05F4); it does carry the digits 0–9. The Latin companion is **Roboto Condensed** (`--font-latin`, 400 + 700, self-hosted via `next/font/local`). `--font-body` is `stanga, latin, sans-serif`, so Latin inside Hebrew text falls through to the companion automatically, never Arial. Use the `.font-latin` utility explicitly on phone numbers and email addresses. Stanga's `adjustFontFallback` stays `false` in `src/app/fonts.ts` so no generated Arial fallback sits ahead of the companion. **Metric-matched Hebrew fallbacks (NS-35/46):** `--font-body` is `stanga, "stanga-fb", latin, sans-serif` and `--font-display` is `elamy, "elamy-fb", cursive`. `stanga-fb` / `elamy-fb` are `@font-face` blocks in `globals.css` over `local(Arial)` (Arial Hebrew / Noto Sans Hebrew as backups) with `size-adjust` + ascent/descent/line-gap overrides, restricted by `unicode-range` to Hebrew + the space/punctuation/digits Stanga carries, **never A-Z/a-z**, so Latin still falls to Roboto Condensed and never to a local Arial. The numbers come from `node scripts/font-fallback-metrics.mjs` (fontkit) and are pinned by `tests-unit/sanity/font-fallback.test.ts`; re-run the script when a font file changes. Elamy keeps `adjustFontFallback: false` too (the generated `elamy Fallback` would otherwise precede `elamy-fb`).

---

## §3 Colour-utility conventions

**Write colours as the named theme utilities** (`text-plum`, `bg-cream`, `bg-mauve`, `ring-cream/35`, `outline-plum`, `border-mauve`, `focus-visible:ring-offset-cream` ...): each `@theme` colour name is the utility. Do not write the arbitrary form `text-[var(--color-plum)]` and do not use the `-white` utilities (`text-white`, `bg-white/35`) or the retired aliases (`-text-primary`, `-dark`, `-bg-light`, `-brand-primary`); say cream/plum/mauve. The sanity suite (`source-scan.test.ts`, rules `arbitrary-colour-var` and `white-utility`) fails on them. Tints are Tailwind opacity modifiers (`outline-plum/15`, `bg-plum/60`), never a hand-written `color-mix(... transparent)`. Derived tokens live once in `@theme` (NS-23) and are used as utilities: `hover:bg-plum-hover` (plum 88% over black, solid plum buttons and the FAB phone half), `hover:bg-cream-hover` (cream 85% over blush, cream buttons), `bg-whatsapp` / `hover:bg-whatsapp-hover` (`#25D366` / `#1EBE5B`, the ContactFAB WhatsApp half only, see the owner exception below; its `#FFFFFF` label stays a literal because `--color-white` is the cream), `max-w-prose` (`--container-prose: 65ch`, the reading measure), and the `focus-ring` utility (`focus-visible:outline-none focus-visible:ring-2`; the ring colour/offset stays at the call site: `focus-ring focus-visible:ring-plum focus-visible:ring-offset-2`). Photo scrims use `bg-linear-to-t from-black/60 ...`. What stays arbitrary on purpose: `bg-[var(--surface-veil)]` (the cream-over-mauve veil), `text-[color:var(--header-color)]` (follows the section tone) and the one opaque mix `bg-[color:color-mix(in_srgb,var(--color-blush)_28%,var(--color-cream))]` (AuthorCard).

---

## §4 Palette and contrast notes

> **2026-10-08:** the palette was re-tuned; the values below (matching `@theme` in `src/app/globals.css`) are the canonical ones. The earlier #574964 / #9F8383 / #C8AAAA / #fff0e4 set is retired.

A translucent mauve surface (`bg-mauve/75` = mauve at 75% over plum ≈ `#B28AA8`) with cream text measures 2.76:1 — also below 3:1 (the old hero pill; the hero nav/CTA are now cream-on-plum buttons, 5.55:1).

---

## §5 Owner-approved exceptions

**Owner-approved exceptions (2026-10-09)** — deliberate, not bugs; future contrast work must not "fix" them:
- Cream titles stay directly on the mauve (mid) sections Intro, Reignite (title and subtitle) and ContactOffice, at 2.11–2.22, below even the large-text threshold. The owner saw the alternatives (a cream panel behind the title, or re-toning the sections to plum) and kept them as they are.
- The WhatsApp half of the ContactFAB keeps WhatsApp's native green `#25D366` with a white label and glyph, at 1.98. It is the brand CTA; the owner overruled a contrast fix.

The sanity suite's `OWNER_EXCEPTIONS` table (NS-42) holds the matching entries.

---

## §6 Card backgrounds and the Section primitive

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

## §7 Layout, full text

- **Desktop (lg and up): every solid card fills at least 100svh.** Use `fit` (`free` | `lock` | `grow`) on the `Section` primitive (it applies `lg:screen-fit` = `min-height: var(--card-h)`, or the grow's own `lg:min-h-[max(100svh,720px)]`, and publishes `data-fit`) or `lg:screen-fit flex flex-col justify-center` on bespoke sections. Never spell `min-h-[100svh]` / `min-h-lvh` in a component: the unit decision lives in `--card-h` (`globals.css`). Cards whose content is taller than the viewport simply grow past 100svh, which is fine.
- **Phones and portrait tablets (below lg): cards are content-height** (owner-approved 2026-10-09, NS-39; this replaces the old "every card is a full screen on mobile" rule). A card is as tall as its content plus its section padding (`pad="section"` etc.), with no min-height, so there is no empty void under short content and no cut-off or awkward full-screen card. Exactly four cards stay one screen on a phone: the **hero, the credentials card, the CTA band and the footer**. On `Section` that is `phone="screen"` (`screen-fit` at every width, published as `data-phone`); the hero is bespoke (`hero-fit` = `min-height: var(--hero-h)`) and the footer is `screen-visible`. Below lg `--card-h` and `--hero-h` are `100lvh` (the collapsed-toolbar height, static, so a one-screen card leaves no strip of the next card and nothing resizes when the toolbar toggles); never `dvh` on a card. Adding a card to the one-screen list is a decision: edit the `PHONE` table in `tests-unit/sanity/one-screen.test.tsx` with it.
  - **iOS 26 hero overshoot:** on iOS 26 Safari the hero token is `calc(100lvh + 80px)` (iOS WebKit with anchor positioning, below lg only). The page is drawn edge to edge under the floating bottom bar, which `lvh` excludes, so a 58pt strip of the next card would otherwise show beside the bar at scroll 0. Re-measure on each new iOS major; remove the +80px if lvh starts covering the area under the bottom bar.
- **Photo cards** (Hero, CTA band, Footer) are exempt from the palette rotation and keep their one-screen height on phones — their height is controlled by their photographic content. The Footer is the exception that fills the *visible* screen: `screen-visible` (`--card-h` upgraded to `100dvh` where supported), because on iOS Safari `svh` is shorter than the screen once the toolbar collapses and a strip of the previous card shows. Its content group is centred (`my-auto`) with the copyright last.
- **Soft snap** (`SoftSnap` gate, `SlidePager`, pure decisions in `src/lib/slide-pager.ts`) is a slide show on desktop: at >= 1024px with a fine pointer (`(min-width: 1024px) and (pointer: fine)`), one wheel / trackpad gesture or key (Arrow, Page, Space, Home, End) moves exactly one card (`main > section` and the footer) with a ~650 ms slide; a card taller than the screen scrolls natively until its edge. Below 1024px, and wherever the primary pointer is coarse (phones, tablets, at any width), the page scrolls natively with no snap, and no pager code is downloaded; the touch snap that made iPhones feel stuck was deleted, do not reintroduce it. `SoftSnap.tsx` is a tiny gate that loads the pager by dynamic `import()` (started on page load, only where the query matches); the pager skips paging while the mobile menu overlay is open (`main[inert]` / body scroll lock). No CSS scroll-snap. Off under `prefers-reduced-motion`; `?snap=off` is a hidden escape hatch.
- **Reusable surfaces** (`src/components/primitives/`, see its `README.md`): an inner card on a toned section is `<Card surface="cream|veil" pad="md|lg">` (it publishes `data-bg-tone="cream"`; never add a hand-written `bg-[var(--color-cream)]`); every framed photo is `<Photo radius="card|tile|none">` (bakes in `overflow-hidden`, the radius, `safari-clip` and the cover fit; do not re-type `object-cover` frames); single-colour SVG icons are `<MaskIcon size="sm|lg">`; icon-only round buttons are `<IconButton label>`.
- **Mobile:** all cards reflow to single-column and size to their content (see above). Test at 375px. Body text at 375px uses the clamp minimum — ensure it's comfortable (`.type-body` floor is 16px, `.type-lead` floor is 18px, blog `.type-read` floor is 18px / `.type-read-lead` 20px).
- **Header/nav:** below `md` the nav collapses to a hamburger that opens a full-screen overlay menu (`site/SiteNav` + `site/MobileMenu`); the inline link row is `hidden md:flex`. Don't reintroduce a squeezed inline nav on mobile. The overlay is portaled to `document.body` for stacking safety: no ancestor sets `will-change` any more (framer-motion, whose `will-change` once trapped `position:fixed` inside the bar, is gone), but a `transform`/`translate` on any ancestor would, and the portal keeps the overlay out of the header's stacking context.
- **No horizontal overflow.** Check `document.documentElement.scrollWidth > document.documentElement.clientWidth` after any layout change.

---

## §8 Embedding the site in an iframe

The site is not iframe-embeddable by design (`frame-ancestors 'none'` in the CSP, `next.config.ts`). If that ever needs to change:

1. Relax the CSP `frame-ancestors` directive.
2. The reveal side needs no change: IntersectionObserver doesn't fire reliably inside an iframe, which used to leave content stuck at `opacity: 0`, so `RevealObserver.tsx` already skips iframes (it never arms the hidden state there and everything stays visible).

This was learned the hard way; a previous attempt (with the old framer-motion reveals) needed two fixes and still didn't render reliably (reverted in `c95a8e0`).

---

## §9 Type scale history

The random sizes from the original template export (13/15/16/18.67/28/31px) have been replaced with this canonical scale.
