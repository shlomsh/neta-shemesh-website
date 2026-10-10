# Sanity suite

Fast structural guard for the rules in `CLAUDE.md`. jsdom has no layout, so tests render the real home page (server-rendered once per file) and inspect DOM and classes, or scan `src/**/*.{ts,tsx,css}`.

```
npm run test:sanity     # this folder only
npm run test:unit       # all of tests-unit/ (what the Vercel gate runs)
```

**One guard per rule, stated once in the file that owns it.** After a refactor, edit `helpers.ts` (predicates, `SCAN_RULES`, `CONTRAST_BANS`, `EXPECTED_SECTIONS`, `SUBTITLES`), never relax a test. Sections are found by literal ids in `EXPECTED_SECTIONS` (not imported from `content/ids.ts`, so a wrong rename fails), source files by path suffix (`sourceNamed('app/layout.tsx')`). Every scan rule carries bad/good samples, so a blind regex fails. `helpers.ts` is ~70 KB: grep it.

| File | Guards |
|---|---|
| `helpers.ts` | Shared predicates, `SCAN_RULES`, `CONTRAST_BANS`, the contrast resolver, ratchet helpers. Not a test. |
| `source-scan.test.ts` | All static bans: type/size/weight and removed classes, card-height units, CSS scroll-snap, Google Fonts, hex palette lock, white/arbitrary-var colour utilities, NS-42 contrast/focus bans, lockups written once, font declarations, RTL only on `<html>`. |
| `cards-rotation.test.tsx` | Strict 4-tone rotation, no adjacent same tone, `.on-dark` only on photo bands, mid veil card, office card. |
| `one-screen.test.tsx` | Every card is at least one screen at every width: below lg `screen-fit` (a card that loses it fails), from lg the `DESKTOP` lock/grow table. Hero `hero-fit`, footer `screen-visible`, `--card-h`, flex chain to the photo grid, `<main>` is `overflow-clip`. |
| `section-primitive.test.tsx` | `Section` `fit`/`tone` contract (`data-*` plus implementing classes, not overridable). |
| `ui-primitives.test.tsx` | `Card`, `Photo`, `MaskIcon`, `IconButton`, `SectionTitle`/`SectionHeader` contracts. |
| `type-scale-css.test.ts` | `.type-*` values, closed set, 14px floor, Latin scale, font tokens, Elamy reserved roles. |
| `type-usage.test.tsx` | Rendered type usage: no stacked `type-*`, `font-latin`, subtitle lockup, buttons/nav, headings. |
| `contrast.test.tsx` | Palette maths, resolver fixtures, WCAG matrix over home, `/blog` and every post. |
| `brand-guards.test.tsx` | WhatsApp FAB, no title underlines, hero stroke/entrance, line-art. |
| `page-integrity.test.tsx` | Anchors resolve, text under `type-*`, nav, image URLs, overlays, icon link names. |
| `single-source.test.tsx` | Ids, no phone/email/street literals in any format, links from `SITE`, JSON-LD from content. |
| `hero-first-paint.test.tsx` | The hero never starts hidden. |
| `font-fallback.test.ts` | Metric-matched Hebrew fallbacks match `scripts/font-fallback-metrics.mjs`. |
| `soft-snap.test.tsx` | Pager gate and wiring on the real page (desktop only, no touch, reduced motion, menu open). |
| `component-guards.test.tsx` | Gallery stagger, `LineArt`, parked Testimonials still render. |

Other folders in `tests-unit/`: `slide-pager.test.ts` (pure pager logic), `reduced-motion-hydration`, `reveal-observer`, `cta-band`, `signature`, `map-placeholder`, `cx`, `blog/`, `lib/` (SEO, JSON-LD, sitemap, `llms.txt`, noindex host), `site/` (menu, a11y).

## Contrast resolver limits

`contrastReport` resolves the class list of every ancestor against the `@theme` palette (jsdom has no Tailwind CSS). Deliberate limits:

- Base (mobile) state only: `hover:`, `focus-visible:`, `group-hover:` and breakpoint colour overrides are not evaluated.
- Size is the nearest `.type-*` mobile minimum (x0.88 per `.font-latin` span); no type class means 16px regular. Large = >= 24px, or >= 18.67px bold.
- Text over a photo cannot be measured: it is skipped and must be listed in `PHOTO_BACKDROP`.
- The paper grain is not modelled (mauve measures 2.26:1, a real render 2.11-2.22). Gradients, `mix-blend-mode`, images and CSS outside class names are not resolved.
- A colour token the resolver cannot evaluate (`text-plum/[0.3]`, `oklch(...)`) is reported as skipped and fails the matrix: teach it in `helpers.ts` (`colourFromToken`, `foregroundOf`, `backdropOf`) with a fixture.

## Ratchet tables

They may only shrink: an unlisted failure fails, and a listed entry that no longer fails fails with "stale allow entry, remove it". A fix deletes its row in the same commit.

- `OWNER_EXCEPTIONS` (`contrast.test.tsx`): the only failures the matrix allows, dated owner decisions (cream titles on the mauve sections, the WhatsApp green). Documented choices, not debt; ratio drift fails too.
- `PHOTO_BACKDROP` (same file): sections with text over photos.
- `BAN_ALLOW` (`source-scan.test.ts`, NS-42 block): current offenders per ban rule, by path suffix and count.
- Hex `ALLOWED` (`source-scan.test.ts`): off-palette hexes, each with a reason.

NS-42 bans: `text-mauve` (use plum/cream), `small-text-blush` (blush needs `type-quote` or larger), `text-colour-mix-transparent` (solid colour; hierarchy by size), `bg-mauve-with-text`, `opacity-on-text`, `focus-outline-none` (add a `focus-visible:` ring), `focus-mask-link` (empty `MaskIcon as="a"` needs a `focus-visible:` outline).

A rule that needs a known exception gets a named table with a reason (`SUBTITLES`, `DESKTOP`, `PHONE`, `ALLOWED`), so a silent change fails.
