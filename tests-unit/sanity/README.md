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
| `one-screen.test.tsx` | `min-h-[100svh]` on every solid card; exact lock-vs-grow table, checked as `data-fit` AND the classes that implement it (the two must agree); CTA band `free`, hero/footer carry no `data-fit`; contiguous `lg:flex-1` + `min-h-0` chain to the photo grid, `object-cover`, no aspect ratio left on at lg; `<main>` (via `PageShell overflow="clip"`) is `overflow-clip` | Cards ran 1.3 screens (aspect-driven), then clipped; `overflow-hidden` on `<main>` killed soft snap |
| `section-primitive.test.tsx` | `Section` `fit` emits `data-fit` + its classes (lock / lock without floor / grow / free), `center` (column / start / middle), `tone`, `pad`, `seam`, `anchor`, always `relative overflow-hidden`, `data-fit`/`data-bg-tone` not overridable, `floor`/`center` type-restricted (`@ts-expect-error`, checked by tsc), `Container` `gutter` (one `px-*` class); lock/grow height classes are written only in `Section.tsx`; the repeated clamp paddings are tokens; every token utility Section/Container emits has its `--spacing-*` in `@theme` | Hand-spelled one-screen shells coming back; a `data-fit` that lies; an undefined token silently producing no CSS |
| `soft-snap.test.tsx` | SoftSnap constants in range, no CSS scroll-snap, its selector excludes the footer; behaviour: glides near an edge, does nothing below 1024px or under reduced motion | CSS snap felt wrong, JS snap fired on phones / reduced motion / over the hero entrance |
| `type-scale-css.test.ts` | each `.type-*` clamp min/max, family, weight, line-height; size budget (11), 14px floor; `.type-quote` is Stanga; `--latin-scale` 0.88 and `.font-latin`; `--surface-veil` in `@theme static`; `--font-body` stack; `[data-bg-tone]` rules map tone to bg/text/header colour; `--color-white` is cream; Elamy only on display/title/signature | 21 ad-hoc sizes; `.type-quote` was once Elamy; the veil card went transparent; Latin fell to Arial |
| `type-usage.test.tsx` | one `type-*` per element; `font-latin` only on inner spans; subtitle lockup (type-quote, 65ch, margins, Services exception); buttons / nav / hero subtext / contact rows; bio and intro lead copy; headings and step numerals | Stacked type classes (later CSS rule wins), compounding latin scale, uppercase + tracking + `py-*` buttons |
| `source-scan.test.ts` | positive-control table for every scan regex; colour utilities are the `@theme` names (no `text-[var(--color-*)]` arbitrary form, no `text-white` / `bg-white` / `ring-white/35` (rule `white-utility`); `ALLOWED` table for any exception, empty today; the four palette names exist in `@theme`); no `dir="rtl"` below `<html>` (rule `rtl-dir`, `ALLOWED` table empty; `dir="ltr"` is fine; `<html dir="rtl">` and the CSS `direction: rtl` must remain); no `text-[Npx]`, `text-[clamp(`, `font-black`, `font-sans`, removed classes, `fontSize:`, `h-screen`, ungated `h-[100svh]`, `<main overflow-hidden>` / `<PageShell overflow="hidden">` outside the blog, Elamy set in a component; `leading-`/`tracking-` overrides next to type classes; `app/fonts.ts` fonts (3 local, no google, no Stanga 300) applied in `layout.tsx`; hex palette lock with documented allow-list | Template-export leftovers reappearing; Vercel prod build failing on `next/font/google`; off-palette hexes |
| `ui-primitives.test.tsx` | `Card` (surface, owned `data-bg-tone`), `Photo` (radius + `safari-clip`, ratio / `fillCellAtLg`, parallax and reveal frames, `next` engine, overlays), `MaskIcon` (span and `as="a"`), `IconButton`, `SectionTitle` / `SectionHeader` (center, column, onPhoto) emit their variants; type-restricted props stay restricted (`@ts-expect-error`); the title class list, mask style, cover-fit photo and icon-button classes are written only in their primitive | A frame that silently loses `safari-clip`; the Services subtitle exception spreading; a component re-typing a lockup the primitive owns |
| `page-integrity.test.tsx` | every `href="#x"` has a target id, ids unique, all visible text sits under a `type-*` element, nav is `hidden md:flex` + hamburger | Dead anchors after a refactor, text escaping the type scale, squeezed inline nav on mobile |
| `positive-controls.test.tsx` | in-memory proof that every parser/predicate flags a known-bad sample (mutated css strings, DOM fragments, tolerant SoftSnap parsing) | A green suite caused by a blind checker |
| `single-source.test.tsx` | `content/ids.ts` ids are unique readable kebab-case and none is a random export id; every `ID`/`ANCHOR` entry exists on the rendered home page; no file outside `content/site.ts` re-types the phone, email, street, postal code or map query; every `tel:` / `mailto:` / `wa.me` link equals the `SITE`-built one (one E.164 `tel:` everywhere); JSON-LD business node and one `Service` per Expertise card come from the content | Phone in 3 formats with disagreeing `tel:` hrefs; 16-char Canva ids as hooks; JSON-LD service text drifting from the cards |
| `brand-guards.test.tsx` | WhatsApp FAB green + plum pill, bottom-left; no underline decoration in section h2s; hero "ביחד." stroke, `.hero-enter` blocks and couple line-art paths remain | Owner rulings: WhatsApp stays green, no title underlines, hero motion sequence |

## Known gaps (deliberate, not hidden)

- `about-credentials` and `contact-social` only carry `min-h-[100svh]` (no desktop lock/grow, no `lg:py-12`). CLAUDE.md only requires the min-height there, so they are `free` rows in `DESKTOP` (`one-screen.test.tsx`). Changing a row is a decision, not drift.
- Blog pages use `<PageShell overflow="hidden">` (an `overflow-hidden` `<main>`); they do not mount SoftSnap, so this is tolerated (only the home page must clip).
- The Services subtitle has no `max-w-[65ch]` and uses `mt-5 md:mt-9` (Elamy "?" descender); encoded in `SUBTITLES`.

## Adding a rule

Prefer the rendered page + a helper over reading a component file. If a rule needs a known exception,
put it in a named table with a reason (see `SUBTITLES`, `DESKTOP`, `ALLOWED`) so a silent change fails.
