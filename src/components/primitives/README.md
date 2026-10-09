# Primitives

Small, typed building blocks the section components in `src/components/sections/*`, the site chrome in `src/components/site/` and the blog compose. Nothing here knows about page content (a primitive never imports `content/`). Folder rules and the dependency direction: `../README.md`.

## Layout (`primitives/layout/`)

### `<Section id? tone? fit? floor? center? pad? seam? anchor? className? …props>`
The `<section>` shell: always `relative w-full overflow-hidden` (no `dir`: `<html dir="rtl">` sets the direction, and `dir` is not a Section prop), plus whatever the props below ask for. `id` is optional (Expertise has none). `data-fit` and `data-bg-tone` are owned by `fit` and `tone`; a hand-passed attribute cannot override them.
- `tone`: `dark | mid | light | cream`. Sets `data-bg-tone`; `globals.css` then paints the background, the text colour and `--header-color`, so children need no colour classes. Omit it for photo sections (CTA band): no `data-bg-tone`.
- `fit` (published as `data-fit`; omit for content height at every width, e.g. blog sections). From lg every fit is at least one screen (`lg:screen-fit` = `min-height: var(--card-h)`, `100svh` there; grow uses its own `lg:min-h-[max(100svh,720px)]`).
  - `free`: from lg one screen at minimum, then grows with its content (about-credentials, contact-social, CTA band).
  - `lock`: from lg exactly one screen, `lg:h-[max(100svh,720px)] lg:py-12`; the content must fit through a `lg:flex-1 lg:min-h-0` chain to the photo grid. On a viewport shorter than 720px it is 720px tall.
  - `grow`: from lg at least one screen, `lg:min-h-[max(100svh,720px)] lg:py-12`; for running text that must never be clipped (about-me).
  - `floor={false}` (typed: only accepted with `fit="lock"`): drop the 720px floor, i.e. exactly `lg:h-[100svh]` (Expertise only; do not use elsewhere without proving the content fits).
- `phone` (typed: only accepted with a `fit`; published as `data-phone`): the height BELOW lg (NS-39). `content` (default): no min-height, the section is as tall as its content + padding, so a phone card never leaves a void and never cuts off. `screen`: `screen-fit` at every width, i.e. `min-height: var(--card-h)` where `--card-h` is `100svh` and `100lvh` below lg (the collapsed-toolbar height, static, so no strip of the next card and nothing shifts when the toolbar toggles). Only the credentials card and the CTA band use `screen`; the hero (`min-h-[100svh]`, `--hero-h`; moves to the token with NS-26/NS-25) and the footer (`screen-visible` = the token upgraded to `100dvh` where supported) are bespoke. Never write the unit by hand in a component. The lg+ heights are the same for both modes.
- `center` (typed: only accepted with a `fit`): `column` (default, `flex flex-col justify-center`) | `start` (the same, plus `lg:justify-start`: Expertise, whose card grid takes the remaining height) | `middle` (`flex items-center justify-center`, a single child centred on both axes: photo bands).
- `pad`: `section` (`py-section`) | `tight` (`py-section-tight`) | `none` (default, no vertical padding of its own: the section is padded by `lg:py-12` (lock/grow), by its content (Services) or by a one-off `py-*` in `className` (the CTA band)). The About, Expertise and Contact sections all use `pad="section"` with `Container gutter="wide"` (Expertise and Contact joined on 2026-10-09). On a `lock`/`grow` section `lg:py-12` takes over from lg up, so `pad` only sets the padding below lg there. Never put a second `py-*` in `className` next to a `pad` token: two utilities for one property are decided by CSS source order.
- `seam`: `-mt-px` (hides a sub-pixel gap between two toned sections; TODO visual-roadmap #2).
- `anchor`: renders a `ScrollAnchor` with that id immediately before the section.
- There is no `overflow` prop: every section clips (`overflow-hidden`) and is a positioning context. (Making the four sections that used to be unclipped clip too was measured at 0 px at six viewports.)
- The tests (`tests-unit/sanity/helpers.ts`: `fitOf`, `oneScreenMode`, `isOneScreen`) read `data-fit` AND check the classes that implement it, so one cannot lie without the other.

### `<Container maxWidth? gutter? className? …props>`
Centred column. `maxWidth`: `md` 768, `lg` 1024, `xl` 1100, `2xl` 1280 (default), `3xl` 1440, `none`. `gutter` (one class, no cascade fight): `default` `px-gutter` clamp(16px,4vw,48px) | `wide` `px-gutter-wide` clamp(24px,5vw,80px) | `none` (when the parent Section already pads the sides).

### `<Grid colsMobile? colsTablet? colsDesktop? className? …props>`
Responsive CSS grid using static class lookup maps (Tailwind v4 cannot compile `grid-cols-${n}`). Defaults 1 / 2 / 2 columns.

### `<Card surface pad className? …props>`
An inner card on a toned section: `rounded-card` + padding, nothing else (the layout of the content, e.g. `flex flex-col gap-4` or `w-full`, goes in `className`).
- `surface` (required): `cream` (solid cream, plum text 5.55:1; the office card that frames details + map) | `veil` (cream 85% over mauve via `--surface-veil`, 4.97:1 against plum, so lead copy is allowed; mauve sections only, the about-intro text). Both publish `data-bg-tone="cream"`, which paints the background and sets the text/title colours, so there is no hand-written `bg-[var(--color-cream)]`.
- `pad` (required): `md` `p-6 md:p-8` | `lg` `p-6 md:p-8 lg:p-10`.
- `data-bg-tone` is owned by the primitive and cannot be overridden. The parked `TestimonialCard`, `AuthorCard` and `PostCard` are mixed-colour surfaces and stay on a bare `rounded-card`.

### `<ScrollAnchor id>`
Zero-height invisible anchor placed *before* a section so in-page links land at its top.

## UI (`primitives/ui/`)

### `<SectionTitle as? onDark? className? …props>`
The one title style: `type-title font-bold tracking-[-0.01em]`, colour from `--header-color` (so it follows the nearest `[data-bg-tone]`). `as`: `h2` (default) | `h1` (blog page titles) | `p` (the footer tagline, a title-scale line that is not a heading). `onDark` is for a title on a photo band with no `data-bg-tone` (adds `.on-dark`). Renders no wrapper element.

### `<SectionHeader id title subtitle align onPhoto? subtitleClassName?>` / `<SectionSubtitle align onPhoto? className?>`
The title + subtitle lockup of CLAUDE.md typography rule 8, as two sibling elements (a fragment): the caller keeps its own wrapper and `ScrollReveal`. `SectionSubtitle` is a `BodyText` at `type-quote`.
- `align` (required): `center` (title centred; subtitle `max-w-[65ch] mx-auto mt-3 md:mt-4`) | `column` (side column, centred below md and right-aligned from md: the Services exception, `mt-5 md:mt-9` for the Elamy "?" descender and no 65ch cap).
- `onPhoto`: cream title + cream subtitle (`text-cream`), both with `drop-shadow-md` (the CTA band, which has no tone).
- `subtitleClassName` / `className`: layout extras only (the margin to the next block).
- When the title and the subtitle reveal separately (About gallery) use `SectionTitle` and `SectionSubtitle` directly.

### `<BodyText centered? className? …props>`
The standard paragraph. Renders `type-body` unless `className` already carries a `type-*` class (then that class wins, avoiding the CSS-order collision). Right-aligned by default, `centered` for centred. Colour is inherited from the nearest `[data-bg-tone]` ancestor; there is no colour prop.

### `<ButtonLink href variant? size? className? …anchorProps>`
The only button-shaped link. Always a pill (`rounded-full`) with a lift-on-hover.
- `variant="primary"` (default): plum fill + cream text. Use on cream / blush / mauve sections.
- `variant="secondary"`: cream fill + plum text. Use on plum sections and photo sections (hero, CTA band, footer).
- Both pairs are 5.55:1. Never fill a button with mauve: no text colour passes on it.
- One type style for every button: `.type-lead` bold (18-22px), no uppercase, no tracking. `size` only changes padding: `md` (default) is the full CTA (~56-60px tall); `sm` is the compact ~48-52px pill (hero CTA, nav phone). Do not override font size via `className`.
- Pass layout extras (`w-full`, `mt-*`, `relative z-10`, `min-h-*`) via `className`; do not restyle fill, radius or padding there.

### `<Photo src alt radius ratio? fillCellAtLg? objectPosition? outlined? zoom? safariClip? motion? engine? sizes? loading? className? style? children?>`
A photo in a clipped frame, cover-fitted. The frame is `relative overflow-hidden` + the radius + the optional aspect ratio; the photo is `absolute inset-0 w-full h-full object-cover`.
- `radius` (required): `card` (`rounded-card`, 24px) | `tile` (`rounded-tile`, 12px) | `none` (full-bleed bands). `safari-clip` is on by default for both, so a frame cannot forget it; `safariClip={false}` turns it off only where an ancestor already carries it (ExpertiseCard: stacking it on a nested frame shifts the rounded-edge antialiasing in Chromium).
- `alt` (required; `""` for decorative). `ratio`: `square | 4/3 | 4/5 | 2/3 | 348/531 | 100/62 | 100/58` (the last two are the blog covers), the aspect-ratio of the frame (on mobile when `fillCellAtLg`). Never fake a ratio with a `padding-top` spacer div (`pt-[62%]`): the sanity suite fails on it. `fillCellAtLg`: from lg the ratio is dropped and the grid cell gives the height (`lg:aspect-auto lg:h-full`), the contract of every photo in a `lock` section's flex chain. `objectPosition`: CSS crop, e.g. `"48.1% 47.7%"`. `outlined`: plum 1.5px outline. `zoom`: slow scale-up of the photo, `self` (when the photo is hovered: gallery tiles) | `group` (when the enclosing `group` card is hovered: the blog post cards).
- `engine`: `img` (default, plain `<img>`, `loading` `lazy` by default or `eager` above the fold) | `next` (`next/image` with `fill`; `sizes` is then required). Never switch a call site between the two: it changes the srcset and so the pixels.
- `motion`: none (a `<div>` frame; `children` are overlays drawn over the photo: gradients, labels) | `{ parallax: n }` (ParallaxFrame: the photo drifts n% inside the frame; no overlays) | `{ reveal: delay }` (the frame itself is the `ScrollReveal` element, so the grid cell is the frame and no wrapper is added; no overlays, no `style`).
- `className`: placement and one-off surface extras of the frame (`w-full`, `h-full`, `shadow-*`). `style`: grid placement (Contact mosaic).

### `<MaskIcon src size as? …>`
A single-colour SVG file painted with `currentColor` through a CSS mask, so it follows the text colour. `size`: `sm` 24px (contact rows) | `lg` 44px (social links). Default renders an empty decorative `<span>`; `as="a"` (`href`, `label`, `external?`) makes the anchor the sized box and focus ring; an inner aria-hidden span carries the mask.

### `<IconButton label className? …buttonProps>`
Round 44px icon-only `<button type="button">` in the cream-on-plum header style with the keyboard focus ring (hamburger, menu close). `label` is the required accessible name; the icon is `children`; `onClick`, `aria-expanded`, `aria-controls`, `ref` and visibility (`md:hidden`) come from the caller.

## Related (outside `primitives/`)
- `motion/ScrollReveal` (a server component; `motion/RevealObserver` in `PageShell` drives it), `motion/ParallaxFrame`, `motion/SoftSnap` are the motion pieces (`Photo` builds on the first two, which is why motion is a sibling layer that primitives may import, never the other way round); `site/ContactFAB` is the contact pill. Reveal delays come from `lib/motion.ts` (`stagger(i)`); do not pass `delay={0}`.
- `site/PageShell` is the `<main>` shell shared by the home page and both blog pages (`overflow` is a required prop: `clip` for home, `hidden` for blog; the surface is always `bg-cream`); `site/JsonLd` renders a JSON-LD script.

## Colour utilities
Primitives and components write colours as the `@theme` names: `text-plum`, `bg-cream`, `ring-cream`, `outline-plum`, `border-mauve`, `ring-offset-cream` (and `/35` style opacity). Never `text-[var(--color-plum)]`, never `text-white` / `bg-white/35` (cream and white are the same computed colour here, say cream). Exceptions that stay arbitrary: `bg-[var(--surface-veil)]` (`Card` veil), `text-[color:var(--header-color)]` (`SectionTitle`, follows the tone), `color-mix(...)` tints.

## Spacing tokens
`@theme` in `globals.css`: `--spacing-gutter`, `--spacing-gutter-wide`, `--spacing-section`, `--spacing-section-tight` (generate `px-gutter`, `px-gutter-wide`, `py-section`, `py-section-tight`). Only values repeated 3+ times are tokens. Note that a `--spacing-*` token also creates `gap-`, `w-`, `h-`, `m-`, `inset-` ... utilities with that name (e.g. `gap-section`), so keep the names unambiguous. Tailwind emits a `@theme` variable only when a utility that names it is used; a token consumed only through an arbitrary `[var(--x)]` utility must go in `@theme static`.

## Radius scale
Defined in `@theme` in `globals.css`: `rounded-tile` (12px: gallery cells, map, inputs, thumbnails), `rounded-card` (24px: cards, photo frames, panels) and the built-in `rounded-full` (pills, buttons, avatars). Do not use `rounded-[Npx]` or `%` radii.

## Notes
- Decorative clip-path / SVG scaffolding (`OrganicBg`, `CoupleLineArt`, the hero underline) stays inline in its own component.
- Anything with a safari border-radius clip needs the `safari-clip` utility on the rounded, `overflow-hidden` parent (see `agents.md`). `Photo` radius `card`/`tile` does this for photo frames.
- The class lockups a primitive owns (the title class list, the mask style, the cover-fit photo, the icon-button classes) are written only in that primitive; `tests-unit/sanity/ui-primitives.test.tsx` fails when a component re-types them.
