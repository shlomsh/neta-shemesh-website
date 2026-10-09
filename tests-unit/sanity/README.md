# Sanity suite

Fast structural guard for the whole site (under 2 s). jsdom has no layout, so these tests render
the real home page (`src/app/page.tsx`, server-rendered once per file) and inspect DOM + classes,
or statically parse `src/**/*.{ts,tsx,css}`. They exist because of a "short blanket" effect: fixing
card heights broke font sizes, fixing font sizes broke tones, and so on.

```
npm run test:sanity     # just this folder
npm run test:unit       # everything (includes this folder)
```

Every "how do I recognise X" decision lives in `helpers.ts` (`isOneScreen`, `toneOf`,
`topLevelSections`, `typeClassesOf`, `readSources`, the structure predicates `isGrowItem` / `isHeightDrivenFrame` / `buttons(root)` / `desktopNav` ..., the `SCAN_RULES` regex table and the `EXPECTED_SECTIONS` / `SUBTITLES` tables).
Sections are found by `ids` (the current readable id first; written as literals, not imported from `content/ids.ts`, so a wrong rename there fails the suite) with a fallback to the h1/h2 text; source files by path suffix (`sourceNamed('app/layout.tsx')`, throws if ambiguous).
`isSurfaceBg` recognises a surface class either as the named utility (`bg-cream`, `bg-plum`, `bg-mauve`, `bg-blush`, optional `/N`) or the older arbitrary `bg-[var(--color-*)]` / `--surface-veil` form; its controls are in `positive-controls.test.tsx`.
After a refactor (files moved, a change in how `Section` implements `fit`), edit `helpers.ts`, not the tests. `isOneScreen` / `oneScreenMode` read `data-fit` AND the implementing classes and report `inconsistent` when they disagree; their positive controls (a lying `data-fit`, classes without it) are in `positive-controls.test.tsx`.
Assertion messages name the section id and heading, e.g. `about-gallery (#about-gallery "...") lost its one-screen height`.

| File | Guards | Regression it prevents |
|---|---|---|
| `cards-rotation.test.tsx` | exact section order and tones; no adjacent same tone; mauve carries only the h2 + the one approved subtitle; blush paragraphs at quote scale or larger; office = one cream card with details + map; gallery subtitle not in a card | Tones shuffled repeatedly; body copy on mauve (2.26:1) and 16px text on blush (3.89:1); "a card for a subtitle" |
| `one-screen.test.tsx` | `min-h-[100svh]` on every solid card, plus `max-lg:min-h-lvh` (never an unprefixed lvh) on every fit card and the CTA band; exact lock-vs-grow table, checked as `data-fit` AND the classes that implement it (the two must agree); CTA band `free`, hero/footer carry no `data-fit`; the footer keeps the `min-h-[100svh]` fallback plus `supports-[height:100dvh]:min-h-dvh`, no `justify-between`, a `my-auto` content column; contiguous `lg:flex-1` + `min-h-0` chain to the photo grid, `object-cover`, no aspect ratio left on at lg; `<main>` (via `PageShell overflow="clip"`) is `overflow-clip` | Cards ran 1.3 screens (aspect-driven), then clipped; `overflow-hidden` on `<main>` killed soft snap |
| `section-primitive.test.tsx` | `Section` `fit` emits `data-fit` + its classes (lock / lock without floor / grow / free), `center` (column / start / middle), `tone`, `pad`, `seam`, `anchor`, always `relative overflow-hidden`, `data-fit`/`data-bg-tone` not overridable, `floor`/`center` type-restricted (`@ts-expect-error`, checked by tsc), `Container` `gutter` (one `px-*` class); lock/grow height classes are written only in `Section.tsx`; the repeated clamp paddings are tokens; every token utility Section/Container emits has its `--spacing-*` in `@theme` | Hand-spelled one-screen shells coming back; a `data-fit` that lies; an undefined token silently producing no CSS |
| `soft-snap.test.tsx` | SoftSnap constants in range (read from `lib/soft-snap.ts`; the pure decision itself is table-tested in `tests-unit/soft-snap.test.ts`), no CSS scroll-snap, the gate loads the engine only by dynamic `import()`, no touch code anywhere, the engine selector is every `main > section` plus the footer (last); behaviour: glides near an edge at desktop (fine pointer), does nothing on a coarse pointer at any width (and never imports the engine), below 1024px, under reduced motion, or while the mobile menu is open | CSS snap felt wrong, JS snap fired under reduced motion / under a finger / over the hero entrance / pulled readers back up a tall mobile section, the footer was not a target |
| `type-scale-css.test.ts` | each `.type-*` clamp min/max, family, weight, line-height; size budget (11), 14px floor; `.type-quote` is Stanga; `--latin-scale` 0.88 and `.font-latin`; `--surface-veil` in `@theme static`; `--font-body` stack; `[data-bg-tone]` rules map tone to bg/text/header colour; `--color-white` is cream; Elamy only on display/title/signature | 21 ad-hoc sizes; `.type-quote` was once Elamy; the veil card went transparent; Latin fell to Arial |
| `type-usage.test.tsx` | one `type-*` per element; `font-latin` only on inner spans; subtitle lockup (type-quote, 65ch, margins, Services exception); buttons / nav / hero subtext / contact rows; bio and intro lead copy; headings and step numerals | Stacked type classes (later CSS rule wins), compounding latin scale, uppercase + tracking + `py-*` buttons |
| `source-scan.test.ts` | positive-control table for every scan regex; colour utilities are the `@theme` names (no `text-[var(--color-*)]` arbitrary form, no `text-white` / `bg-white` / `ring-white/35` (rule `white-utility`); `ALLOWED` table for any exception, empty today; the four palette names exist in `@theme`); no `dir="rtl"` below `<html>` (rule `rtl-dir`, `ALLOWED` table empty; `dir="ltr"` is fine; `<html dir="rtl">` and the CSS `direction: rtl` must remain); no `text-[Npx]`, `text-[clamp(`, `font-black`, `font-sans`, removed classes, `fontSize:`, `h-screen`, ungated `h-[100svh]`, `<main overflow-hidden>` / `<PageShell overflow="hidden">` outside the blog, Elamy set in a component; `leading-`/`tracking-` overrides next to type classes; `app/fonts.ts` fonts (3 local, no google, no Stanga 300) applied in `layout.tsx`; hex palette lock with documented allow-list; the NS-42 block at the end (rule ids `text-mauve`, `small-text-blush`, `text-colour-mix-transparent`, `bg-mauve-with-text`, `opacity-on-text`, `focus-outline-none`, `focus-mask-link`, all in `CONTRAST_BANS`, each with `BAN_ALLOW` per file name + count, same ratchet) | Template-export leftovers reappearing; Vercel prod build failing on `next/font/google`; off-palette hexes |
| `contrast.test.tsx` | rendered-DOM WCAG 2.x contrast matrix over home, `/blog` and every post: each visible text node's effective colour (class -> `@theme` palette, `/NN`, `color-mix`, `--header-color`, ancestor `opacity-*`) against its effective backdrop (nearest opaque bg, translucent layers stacked), 3:1 for large text (type class mobile minimum: >= 24px, or >= 18.67px bold), 4.5:1 otherwise; the six CLAUDE.md palette pairs to two decimals; resolver fixtures; `CONTRAST_ALLOW` ratchet (a new failure fails, a listed pair that now passes fails with "stale allow entry, remove it", a changed ratio fails so the row is updated); `PHOTO_BACKDROP` ratchet for text over photos | A new `text-mauve` / blush-on-plum / translucent-plum pair shipping unnoticed; a contrast fix that forgets to delete its allow row |
| `ui-primitives.test.tsx` | `Card` (surface, owned `data-bg-tone`), `Photo` (radius + `safari-clip`, ratio / `fillCellAtLg`, parallax and reveal frames, `next` engine, overlays), `MaskIcon` (span and `as="a"`), `IconButton`, `SectionTitle` / `SectionHeader` (center, column, onPhoto) emit their variants; type-restricted props stay restricted (`@ts-expect-error`); the title class list, mask style, cover-fit photo and icon-button classes are written only in their primitive | A frame that silently loses `safari-clip`; the Services subtitle exception spreading; a component re-typing a lockup the primitive owns |
| `page-integrity.test.tsx` | every `href="#x"` has a target id, ids unique, all visible text sits under a `type-*` element, nav is `hidden md:flex` + hamburger | Dead anchors after a refactor, text escaping the type scale, squeezed inline nav on mobile |
| `positive-controls.test.tsx` | in-memory proof that every parser/predicate flags a known-bad sample (mutated css strings, DOM fragments, tolerant SoftSnap parsing) | A green suite caused by a blind checker |
| `single-source.test.tsx` | `content/ids.ts` ids are unique readable kebab-case and none is a random export id; every `ID`/`ANCHOR` entry exists on the rendered home page; no file outside `content/site.ts` re-types the phone, email, street, postal code or map query; every `tel:` / `mailto:` / `wa.me` link equals the `SITE`-built one (one E.164 `tel:` everywhere); JSON-LD business node and one `Service` per Expertise card come from the content | Phone in 3 formats with disagreeing `tel:` hrefs; 16-char Canva ids as hooks; JSON-LD service text drifting from the cards |
| `component-layers.test.ts` | the dependency direction between the component folders (`content -> lib -> primitives, motion -> site -> sections, blog -> app`): no upward or sideways import, a section never imports another section, primitives never import `content`, no unknown folder under `components/`; positive controls for each rule | `components/ui` mixing behaviour and a site widget while a primitive imported it; the footer in `layout/` although the shell in `site/` renders it |
| `brand-guards.test.tsx` | WhatsApp FAB: plum pill with cream labels, green on the glyph only, bottom-left; no underline decoration in section h2s; hero "ביחד." stroke, `.hero-enter` blocks and couple line-art paths remain | Owner rulings: WhatsApp stays green, no title underlines, hero motion sequence |

## Contrast matrix: what jsdom can and cannot resolve

jsdom has no Tailwind CSS, so `getComputedStyle` knows nothing about `text-plum` or `bg-mauve/50`. `contrastReport` in `helpers.ts` therefore resolves the CLASS LIST of every ancestor against the palette in `@theme`. It understands `text-` / `bg-` + plum, mauve, blush, cream, white, black (with `/NN`), `text-inherit`, arbitrary `text-[color:...]` / `bg-[...]` holding `#hex`, `var(--color-*)`, `var(--surface-veil)`, `var(--header-color)` and `color-mix(in srgb, A p%, B | transparent)`; `[data-bg-tone]` (read from the tone rules in `globals.css`); `.on-dark`; `opacity-NN` / `opacity-[0.NN]` / inline `opacity`; `hidden` / `md:flex` and `sr-only`; a full-cover `absolute inset-0` sibling (the hero's plum field). Limits, all deliberate:

- Base (mobile) state only: `hover:`, `focus-visible:`, `group-hover:` and breakpoint colour overrides (`md:text-cream`) are not evaluated (none exist today; `md:` is only used for `hidden`/`flex`).
- Sizes come from the nearest `.type-*` class's MOBILE MINIMUM (and x0.88 for `.font-latin`), weight from the nearest `font-bold` / type weight; text with no type class is 16px regular.
- Text over a photo (hero is a solid plum field and IS measured; StepCard photos, the CTA band and the footer are photos) cannot be measured: it is skipped and listed in `PHOTO_BACKDROP`. A new photo-backed text fails until it is listed.
- The paper grain (`[data-bg-tone]::before`, soft-light / multiply, 8-12%) is not modelled, so a mauve surface measures 2.26:1 where a real render measures about 2.11-2.22:1.
- `opacity` is composed: ancestors below the backdrop supplier fade the text only; `opacity` on the supplier or above it fades text and backdrop together against whatever is behind that group (`composeGroupOpacity`). A group over a photo is ignored (unknowable), so the Expertise pill (`bg-mauve opacity-95` over a photo) stays 2.26:1.
- Gradients, `mix-blend-mode`, images and CSS written outside class names (css modules) are not resolved.
- Any `text-` / `bg-` token written as a colour that the resolver cannot evaluate (`text-plum/[0.3]`, `text-[oklch(...)]`, `bg-[rgb(...)]`, `text-[color:var(--c)]/50`, `text-(--unknown)`) is reported as skipped and fails the "nothing is skipped except photos" test; sizes, lengths, urls, images and gradients are recognised as non-colours. The Tailwind v4 shorthand `text-(--color-cream)` / `bg-(--surface-veil)` resolves.
- The matrix keeps one row per section + text + colours + type class, so a passing copy of a text can never hide a failing copy.

Teaching it a new class: edit `colourFromToken` / `foregroundOf` / `backdropOf` in `helpers.ts`, add a fixture to the "resolver controls" block.

## Ratchet allow-tables

`CONTRAST_ALLOW` (contrast.test.tsx), `PHOTO_BACKDROP` (same file) and `BAN_ALLOW` (source-scan.test.ts, NS-42 block) list today's known failures. They may only shrink: a failure that is not listed fails the test, and a listed entry that no longer fails fails with "stale allow entry, remove it". A contrast or focus fix therefore deletes its row in the same commit. Blog copy is CMS-driven, so blog rows are keyed by section + type class (`text: '*'`, `type: 'type-eyebrow'`) rather than by text. Consequence: a wildcard row absorbs any NEW hit of the same section, same type class and same ratio (a new blog post with another mauve eyebrow does not fail); a hit with a different ratio or type class still does.

`OWNER_EXCEPTIONS` (contrast.test.tsx) is a separate table for permanent owner decisions (2026-10-09: NS-43 option C, the cream titles on the mauve sections; the WhatsApp brand green). Those rows are documented decisions, not debt, but they are checked with the same rules: the text disappearing (stale) or the ratio drifting fails. `BAN_ALLOW` keys are path suffixes under `src/` (`blog/[slug]/page.tsx`), because `page.tsx` alone is ambiguous.

## The NS-42 source bans: why, and how to fix a hit

| Rule id | Why | Fix |
|---|---|---|
| `text-mauve` | mauve text has no compliant pair: 2.26:1 on cream, 2.46:1 on plum | `text-plum` (or cream on plum) |
| `small-text-blush` | blush on plum is 3.89:1, large text only | move to `type-quote` or larger, or use `text-cream` |
| `text-colour-mix-transparent` | a translucent text colour has no fixed contrast: it depends on the backdrop | a solid palette colour; build hierarchy with size, not alpha |
| `bg-mauve-with-text` | mauve cannot carry text | `bg-plum` / `bg-cream` / `bg-blush` (quote scale) for the surface; keep mauve for decoration |
| `opacity-on-text` | opacity fades text below its audited contrast | a colour change on hover (`hover:underline`, a solid colour), not an opacity change |
| `focus-outline-none` | `outline-none` without a replacement removes the keyboard focus indicator | add `focus-visible:ring-2 focus-visible:ring-<colour>` (or a `focus-visible:outline-*`) to the same class list |
| `focus-mask-link` | an empty mask-painted anchor has no visible default focus | add a `focus-visible:` ring/outline to the `MaskIcon as="a"` (or to MaskIcon's anchor itself, which clears every usage) |

The `bg-mauve-with-text` and `opacity-on-text` rules use a small JSX scanner in `helpers.ts`; a component counts as text when it has text or an `{expression}` child, or is a `NavLink` with a `label` (`LABEL_AS_TEXT`). Their positive controls include a `NavLink label=` bad sample and a `MaskIcon label=` (an aria-label, not text) good sample.

## Known gaps (deliberate, not hidden)

- `about-credentials` and `contact-social` only carry `min-h-[100svh]` (no desktop lock/grow, no `lg:py-12`). CLAUDE.md only requires the min-height there, so they are `free` rows in `DESKTOP` (`one-screen.test.tsx`). Changing a row is a decision, not drift.
- Blog pages use `<PageShell overflow="hidden">` (an `overflow-hidden` `<main>`); they do not mount SoftSnap, so this is tolerated (only the home page must clip).
- The Services subtitle has no `max-w-[65ch]` and uses `mt-5 md:mt-9` (Elamy "?" descender); encoded in `SUBTITLES`.

## Adding a rule

Prefer the rendered page + a helper over reading a component file. If a rule needs a known exception,
put it in a named table with a reason (see `SUBTITLES`, `DESKTOP`, `ALLOWED`) so a silent change fails.
