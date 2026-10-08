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
Sections are found by `ids` (current id first, add readable ids after it) with a fallback to the h1/h2 text; source files by path suffix (`sourceNamed('app/layout.tsx')`, throws if ambiguous).
After a refactor (files moved, a `fit` prop / `data-fit`), edit `helpers.ts`, not the tests.
Assertion messages name the section id and heading, e.g. `about-gallery (#about-gallery "...") lost its one-screen height`.

| File | Guards | Regression it prevents |
|---|---|---|
| `cards-rotation.test.tsx` | exact section order and tones; no adjacent same tone; mauve carries only the h2 + the one approved subtitle; blush paragraphs at quote scale or larger; office = one cream card with details + map; gallery subtitle not in a card | Tones shuffled repeatedly; body copy on mauve (2.26:1) and 16px text on blush (3.89:1); "a card for a subtitle" |
| `one-screen.test.tsx` | `min-h-[100svh]` on every solid card; exact lock-vs-grow table; contiguous `lg:flex-1` + `min-h-0` chain to the photo grid, `object-cover`, no aspect ratio left on at lg; `<main>` is `overflow-clip` | Cards ran 1.3 screens (aspect-driven), then clipped; `overflow-hidden` on `<main>` killed soft snap |
| `soft-snap.test.tsx` | SoftSnap constants in range, no CSS scroll-snap, its selector excludes the footer; behaviour: glides near an edge, does nothing below 1024px or under reduced motion | CSS snap felt wrong, JS snap fired on phones / reduced motion / over the hero entrance |
| `type-scale-css.test.ts` | each `.type-*` clamp min/max, family, weight, line-height; size budget (11), 14px floor; `.type-quote` is Stanga; `--latin-scale` 0.88 and `.font-latin`; `--surface-veil` in `@theme static`; `--font-body` stack; `[data-bg-tone]` rules map tone to bg/text/header colour; `--color-white` is cream; Elamy only on display/title/signature | 21 ad-hoc sizes; `.type-quote` was once Elamy; the veil card went transparent; Latin fell to Arial |
| `type-usage.test.tsx` | one `type-*` per element; `font-latin` only on inner spans; subtitle lockup (type-quote, 65ch, margins, Services exception); buttons / nav / hero subtext / contact rows; bio and intro lead copy; headings and step numerals | Stacked type classes (later CSS rule wins), compounding latin scale, uppercase + tracking + `py-*` buttons |
| `source-scan.test.ts` | positive-control table for every scan regex; no `text-[Npx]`, `text-[clamp(`, `font-black`, `font-sans`, removed classes, `fontSize:`, `h-screen`, ungated `h-[100svh]`, `<main overflow-hidden>`, Elamy set in a component; `leading-`/`tracking-` overrides next to type classes; layout.tsx fonts (3 local, no google, no Stanga 300); hex palette lock with documented allow-list; no `bg-white` | Template-export leftovers reappearing; Vercel prod build failing on `next/font/google`; off-palette hexes |
| `page-integrity.test.tsx` | every `href="#x"` has a target id, ids unique, all visible text sits under a `type-*` element, nav is `hidden md:flex` + hamburger | Dead anchors after a refactor, text escaping the type scale, squeezed inline nav on mobile |
| `positive-controls.test.tsx` | in-memory proof that every parser/predicate flags a known-bad sample (mutated css strings, DOM fragments, tolerant SoftSnap parsing) | A green suite caused by a blind checker |
| `brand-guards.test.tsx` | WhatsApp FAB green + plum pill, bottom-left; no underline decoration in section h2s; hero "ביחד." stroke, `.hero-enter` blocks and couple line-art paths remain | Owner rulings: WhatsApp stays green, no title underlines, hero motion sequence |

## Known gaps (deliberate, not hidden)

- `about-credentials` and `contact-social` only carry `min-h-[100svh]` (no desktop lock/grow, no `lg:py-12`). CLAUDE.md only requires the min-height there, so they are `free` rows in `DESKTOP` (`one-screen.test.tsx`). Changing a row is a decision, not drift.
- Blog pages use `<main overflow-hidden>`; they do not mount SoftSnap, so this is tolerated (only the home page must clip).
- The Services subtitle has no `max-w-[65ch]` and uses `mt-5 md:mt-9` (Elamy "?" descender); encoded in `SUBTITLES`.

## Adding a rule

Prefer the rendered page + a helper over reading a component file. If a rule needs a known exception,
put it in a named table with a reason (see `SUBTITLES`, `DESKTOP`, `ALLOWED`) so a silent change fails.
