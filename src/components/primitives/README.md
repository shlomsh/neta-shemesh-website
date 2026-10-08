# Primitives

Small, typed building blocks the section components in `src/components/layout/*` compose. Nothing here knows about page content.

## Layout (`primitives/layout/`)

### `<Section id bgVariant? fullHeight? className? …props>`
The `<section>` shell. Always `relative w-full overflow-hidden`, `dir="rtl"`.
- `bgVariant`: `dark | mid | light | cream | transparent` (default `transparent`). Sets `data-bg-tone`; `globals.css` then paints the background, the text colour and `--header-color`, so children need no colour classes. `transparent` emits no `data-bg-tone` (photo sections). `white` is a legacy alias of `cream` with no caller left.
- `fullHeight`: `min-h-[100svh] flex flex-col justify-center`, at every breakpoint. Desktop one-screen locks (`lg:h-[max(100svh,720px)]`, `lg:min-h-…`, `lg:py-12`) are added by the caller via `className`.
- `id` is required (scroll targets, tests).

### `<Container maxWidth? className? …props>`
Centred column with fluid side padding (`px-[clamp(16px,4vw,48px)]`). `maxWidth`: `md` 768, `lg` 1024, `xl` 1100, `2xl` 1280 (default), `none`.

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
- `ui/ScrollReveal`, `ui/ParallaxFrame`, `ui/SoftSnap` are the motion pieces; `ui/ContactFAB` is the contact pill.

## Radius scale
Defined in `@theme` in `globals.css`: `rounded-tile` (12px: gallery cells, map, inputs, thumbnails), `rounded-card` (24px: cards, photo frames, panels) and the built-in `rounded-full` (pills, buttons, avatars). Do not use `rounded-[Npx]` or `%` radii.

## Notes
- Decorative clip-path / SVG scaffolding (`OrganicBg`, `CoupleLineArt`, the hero underline) stays inline in its own component.
- Anything with a safari border-radius clip needs the `safari-clip` utility on the rounded, `overflow-hidden` parent (see `agents.md`).
