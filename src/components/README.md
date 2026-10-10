# Components

```
src/components/
  primitives/   content-agnostic blocks   layout/ (Section Container Card)  ui/ (BodyText ButtonLink HaloWrap SectionTitle SectionHeader Photo MaskIcon IconButton)
  motion/       behaviour, no content     ScrollReveal RevealObserver ParallaxFrame SoftSnap SlidePager
  site/         shared chrome             PageShell JsonLd ContactFAB BrandLogo LineArt SiteNav MobileMenu NavLink footer/ hooks/ icons.tsx
  sections/     one folder per section    hero intro expertise bio credentials reignite services cta-band gallery contact testimonials (parked)
  blog/         blog-only                 BlogHeader PostBody PostCard AuthorCard
```

## Dependency direction

`content -> lib -> motion -> primitives -> site -> (sections | blog) -> app`: each layer imports only from layers to its left. `sections` and `blog` never import each other, and a section never imports another section (`app/page.tsx` composes them). `primitives` never import `content`; `motion` never imports a primitive (`Photo` builds on `ScrollReveal`/`ParallaxFrame`). `site` must not import `sections`, which is why the footer lives in `site/footer/`.

Enforced by `no-restricted-imports` blocks in `eslint.config.mjs` (`npm run lint`, so CI). A new top-level folder under `components/` makes the config throw; a new section folder is picked up automatically.

## Folder rules

- **`primitives/`** earns a place only if it knows nothing about this site's copy, ids or facts. A one-off layout belongs in the section that uses it.
- **`sections/<slug>/`**: the component has the PascalCase folder name (`cta-band/CtaBand.tsx`), renders exactly one `<section>` (plus its scroll anchor), sub-components beside it. Folder = section slug, not topic: `reignite/` is the "להצית מחדש" band, `gallery/` the six-photo grid, `intro/` the "ליווי מקצועי לזוגות" collage, `bio/` "קצת עלי". `contact/` holds two sections (`ContactSocial`, `ContactOffice`) that share leaves.
- **A component earns its own file** only if it is reused, has state or logic, or is a real visual unit (art, a background composition, a multi-slot card). A logic-free single-use leaf is written inline in its parent.
- **`site/`** holds the header, `PageShell` (required `overflow` prop: `clip` for home and 404, `hidden` for blog), `Footer`, the contact pill, `JsonLd`. One-off decorative SVG stays beside its section.
- Named exports everywhere; only Next route files use `export default`. The parked `sections/testimonials/` stays (see CLAUDE.md).
- Tests find sources by path suffix (`sourceNamed('SoftSnap.tsx')` in `tests-unit/sanity/helpers.ts`) and sections by the ids in `content/ids.ts`: a move updates the suffix, never loosens an assertion.

**Adding a section:** `sections/<slug>/<Name>.tsx` with one `Section`, ids from `content/ids.ts`, copy from `content/`; mount it in `app/page.tsx` in page order; add its row to `EXPECTED_SECTIONS` (`helpers.ts`) and `DESKTOP`/`PHONE` (`one-screen.test.tsx`); run `npm run test:sanity` and `npm run vr -- HEAD`.

## Motion (`motion/`)

Reduced motion is CSS-only (`[data-reveal]`, `[data-parallax]` in `globals.css`).
- `ScrollReveal`: server component, `<div data-reveal="io">`, delay as `--reveal-delay` (from `stagger(i)`); no hidden state in the HTML.
- `RevealObserver`: the one client island (in `PageShell`). Arms `html[data-reveal-armed]` only after its first IntersectionObserver callback, never under reduced motion or in an iframe, so a failure leaves the page visible. A `ScrollReveal` mounted after its effect is never observed.
- `ParallaxFrame`: server component, CSS `view()` drift; it, `Section` and the footer use `overflow-clip`, never `overflow-hidden`.
- `SoftSnap` (client gate) dynamically imports `SlidePager` only where `SNAP_MEDIA` matches (`lib/soft-snap.ts`; logic in `lib/slide-pager.ts`).

## Primitive contracts

**`Section`** (`id? tone? fit? phone? floor? center? pad? seam? anchor?`): always `relative w-full overflow-clip`, no `dir` prop. `data-fit`/`data-phone`/`data-bg-tone` are owned by the props; tests check them against the implementing classes.
- `tone` `dark | mid | light | cream` sets `data-bg-tone` (`globals.css` paints background, text, `--header-color`). Omit it for photo sections.
- `fit` (omit for content height, e.g. blog): from lg at least one screen. `free` grows; `lock` is exactly `lg:h-[max(100svh,720px)]` + `lg:py-12`, content must fit via a `lg:flex-1 lg:min-h-0` chain to the photo grid; `grow` is at least that, for text that must never clip. `floor={false}` (lock only) drops the 720px floor (Expertise).
- `phone` (needs a `fit`): below lg. `content` (default) = content + padding; `screen` = `min-height: var(--card-h)`. Only credentials and the CTA band use it; hero (`hero-fit`) and footer (`screen-visible`) are bespoke. Never write the unit by hand.
- `center` (needs a `fit`): `column` (default), `start` (top-aligned from lg: Expertise), `middle` (one child centred: photo bands). `pad`: `section | tight | none`; never a second `py-*` in `className`. `seam` pulls up 1px to hide a sub-pixel gap; `anchor` renders an invisible scroll target before the section.

**`Container`** (`maxWidth? gutter?`): `md | lg | xl | 2xl (default) | 3xl | none`; `gutter` `default | wide | none` (one `px-*` class).

**`Card`** (`surface`, `pad` required): `cream` = solid cream, plum text (5.55:1); `veil` = cream 85% over mauve (`--surface-veil`, 4.97:1), mauve sections only. Both own `data-bg-tone="cream"`. `pad` `md | lg`. Content layout goes in `className`. Mixed-colour surfaces (`TestimonialCard`, `AuthorCard`, `PostCard`) stay on a bare `rounded-card`.

**`SectionTitle`** is the one title style (`as` `h2 | h1 | p`; `onDark` for a toneless photo band; `marker` puts a decorative drawing beside the heading, never inside it). **`SectionHeader`** (`id title subtitle align onPhoto? marker?`) renders title and subtitle per CLAUDE.md typography rule 8; `align` `center | column` (Services: `mt-5 md:mt-9`, no 65ch cap, for the Elamy "?" descender). Use `SectionTitle` + `SectionSubtitle` when the two reveal separately. **`BodyText`**: `type-body` unless `className` has a `type-*`; colour from the tone.

**`ButtonLink`**: the only button-shaped link, a pill. `primary` (plum) on light sections, `secondary` (cream) on plum and photos; never a mauve fill. One style (`.type-lead` bold); `size` `md | sm` changes only height. `halo` adds the breathing ring (`HaloWrap`). Layout extras via `className`, never fill, radius or padding.

**`Photo`** (`src alt radius sizes` required): cover-fitted `next/image` in a clipped frame. `radius` `card | tile | none`; rounded frames get `safari-clip` unless `safariClip={false}` (nested in a clipped parent). `sizes` is the width the image renders at, not the frame's (a `ParallaxFrame` layer is scaled by `1 + (2 * amount + 1) / 100`). `ratio` is a closed set, never a `padding-top` spacer; `fillCellAtLg` lets the grid cell set the height from lg. `motion`: none (children are overlays) | `{ parallax: n }` | `{ reveal: delay }`. `quality` must be in `images.qualities`.

**`MaskIcon`** (`src size`): single-colour SVG painted via CSS mask, `sm` 24px | `lg` 44px; `as="a"` (`href label external?`) makes the anchor the focus target. **`IconButton`** (`label`): round 44px icon-only button in the header style; `label` is the accessible name.

The class lockups a primitive owns (title class list, mask style, cover-fit frame, icon-button classes) are written only there; `source-scan.test.ts` fails when a component re-types them.

## Tokens

`--spacing-gutter`, `-gutter-wide`, `-section`, `-section-tight` also generate `gap-`, `w-`, `h-`, `m-`... utilities of that name; a token used only through an arbitrary `[var(--x)]` must go in `@theme static`. Radii: `rounded-tile` (12px), `rounded-card` (24px), `rounded-full`; never `rounded-[Npx]`.
