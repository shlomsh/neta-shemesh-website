# Primitives

Small, typed building blocks the section components in `src/components/layout/*` compose. Nothing here knows about page content.

## Layout (`primitives/layout/`)

### `<Section id? tone? fit? floor? center? pad? seam? anchor? className? …props>`
The `<section>` shell: always `relative w-full overflow-hidden`, `dir="rtl"`, plus whatever the props below ask for. `id` is optional (Expertise has none). `data-fit` and `data-bg-tone` are owned by `fit` and `tone`; a hand-passed attribute cannot override them.
- `tone`: `dark | mid | light | cream`. Sets `data-bg-tone`; `globals.css` then paints the background, the text colour and `--header-color`, so children need no colour classes. Omit it for photo sections (CTA band): no `data-bg-tone`.
- `fit` (published as `data-fit`; omit for content height, e.g. blog sections). Every fit is `min-h-[100svh]` at ALL breakpoints:
  - `free`: one screen at minimum, then grows with its content (about-credentials, contact-social, CTA band).
  - `lock`: from lg exactly one screen, `lg:h-[max(100svh,720px)] lg:py-12`; the content must fit through a `lg:flex-1 lg:min-h-0` chain to the photo grid. On a viewport shorter than 720px it is 720px tall.
  - `grow`: from lg at least one screen, `lg:min-h-[max(100svh,720px)] lg:py-12`; for running text that must never be clipped (about-me).
  - `floor={false}` (typed: only accepted with `fit="lock"`): drop the 720px floor, i.e. exactly `lg:h-[100svh]` (Expertise only; do not use elsewhere without proving the content fits).
- `center` (typed: only accepted with a `fit`): `column` (default, `flex flex-col justify-center`) | `start` (the same, plus `lg:justify-start`: Expertise, whose card grid takes the remaining height) | `middle` (`flex items-center justify-center`, a single child centred on both axes: photo bands).
- `pad`: `section` (`py-section`) | `tight` (`py-section-tight`) | `none` (default). `pad="none"` plus a padding in `className` is the sanctioned interim form for one-off paddings (Contact `py-[80px] px-[24px]`, Expertise); they are near-duplicates of the tokens pending a visual decision (TODO(visual) in the call sites). Never put a second `py-*` in `className` next to a `pad` token: two utilities for one property are decided by CSS source order.
- `seam`: `-mt-px` (hides a sub-pixel gap between two toned sections; TODO visual-roadmap #2).
- `anchor`: renders a `ScrollAnchor` with that id immediately before the section.
- There is no `overflow` prop: every section clips (`overflow-hidden`) and is a positioning context. (Making the four sections that used to be unclipped clip too was measured at 0 px at six viewports.)
- The tests (`tests-unit/sanity/helpers.ts`: `fitOf`, `oneScreenMode`, `isOneScreen`) read `data-fit` AND check the classes that implement it, so one cannot lie without the other.

### `<Container maxWidth? gutter? className? …props>`
Centred column. `maxWidth`: `md` 768, `lg` 1024, `xl` 1100, `2xl` 1280 (default), `3xl` 1440, `none`. `gutter` (one class, no cascade fight): `default` `px-gutter` clamp(16px,4vw,48px) | `wide` `px-gutter-wide` clamp(24px,5vw,80px) | `none` (when the parent Section already pads the sides).

### `<Grid colsMobile? colsTablet? colsDesktop? className? …props>`
Responsive CSS grid using static class lookup maps (Tailwind v4 cannot compile `grid-cols-${n}`). Defaults 1 / 2 / 2 columns.

### `<ScrollAnchor id>`
Zero-height invisible anchor placed *before* a section so in-page links land at its top.

## UI (`primitives/ui/`)

### `<BodyText centered? className? …props>`
The standard paragraph. Renders `type-body` unless `className` already carries a `type-*` class (then that class wins, avoiding the CSS-order collision). Right-aligned by default, `centered` for centred. Colour is inherited from the nearest `[data-bg-tone]` ancestor; there is no colour prop.

### `<ButtonLink href variant? size? className? …anchorProps>`
The only button-shaped link. Always a pill (`rounded-full`) with a lift-on-hover.
- `variant="primary"` (default): plum fill + cream text. Use on cream / blush / mauve sections.
- `variant="secondary"`: cream fill + plum text. Use on plum sections and photo sections (hero, CTA band, footer).
- Both pairs are 5.55:1. Never fill a button with mauve: no text colour passes on it.
- One type style for every button: `.type-lead` bold (18-22px), no uppercase, no tracking. `size` only changes padding: `md` (default) is the full CTA (~56-60px tall); `sm` is the compact ~48-52px pill (hero CTA, nav phone). Do not override font size via `className`.
- Pass layout extras (`w-full`, `mt-*`, `relative z-10`, `min-h-*`) via `className`; do not restyle fill, radius or padding there.

## Related (outside `primitives/`)
- `ui/SectionTitle` is the section `<h2>` (`type-title`, bold, colour from `--header-color`; `onDark` for titles on photo bands).
- `ui/ScrollReveal`, `ui/ParallaxFrame`, `ui/SoftSnap` are the motion pieces; `ui/ContactFAB` is the contact pill. Reveal delays come from `lib/motion.ts` (`stagger(i)`); do not pass `delay={0}`.
- `site/PageShell` is the `<main>` shell shared by the home page and both blog pages (`overflow` is a required prop: `clip` for home, `hidden` for blog); `site/JsonLd` renders a JSON-LD script.
- `primitives/ui/maskIcon.ts` (`maskIconStyle(src)`) is the style for single-colour SVG icons painted as a `currentColor` mask (contact rows, social links).

## Spacing tokens
`@theme` in `globals.css`: `--spacing-gutter`, `--spacing-gutter-wide`, `--spacing-section`, `--spacing-section-tight` (generate `px-gutter`, `px-gutter-wide`, `py-section`, `py-section-tight`). Only values repeated 3+ times are tokens. Note that a `--spacing-*` token also creates `gap-`, `w-`, `h-`, `m-`, `inset-` ... utilities with that name (e.g. `gap-section`), so keep the names unambiguous. Tailwind emits a `@theme` variable only when a utility that names it is used; a token consumed only through an arbitrary `[var(--x)]` utility must go in `@theme static`.

## Radius scale
Defined in `@theme` in `globals.css`: `rounded-tile` (12px: gallery cells, map, inputs, thumbnails), `rounded-card` (24px: cards, photo frames, panels) and the built-in `rounded-full` (pills, buttons, avatars). Do not use `rounded-[Npx]` or `%` radii.

## Notes
- Decorative clip-path / SVG scaffolding (`OrganicBg`, `CoupleLineArt`, the hero underline) stays inline in its own component.
- Anything with a safari border-radius clip needs the `safari-clip` utility on the rounded, `overflow-hidden` parent (see `agents.md`).
