# Token Sheet — Footer (`MDSsSYj5iYQgOZ6x`)

Measured from template (`:8899/couples-therapist/`) at **1280** and **375**. All sizes are
*rendered px* (template runs the vw-rem engine; at 1280 `1rem = 12.8px`, so these px are the
literal on-screen values we pixel-match at the reference width). Rebuild in **px/clamp**, not rem.

## Structure (top → bottom, centered column, RTL for ours)
| # | element | template id | content (ours) |
|---|---------|-------------|----------------|
| 1 | Tagline (display) | `Jlq0wYkaWE3FGqH9` | התגברו על אתגרים וחדשו את הקשר הרגשי והפיזי. |
| 2 | CTA link + highlight | `t7mpFHkutgAWck7G` / badges `Q8pZ…` | מוזמנים ליצור איתי קשר → `#contact` |
| 3 | Brand name (script) | `jkbtaL3OlM9XL5RY` | נטע שמש |
| 4 | Copyright | `oitsbKLtGbXNCxEY` | כל הזכויות שמורות © 2026. |

Full-bleed background **photo** (`images/c2507e38710af194875f96c8ec7aca70.jpg`, couple, dark/muted),
`object-fit: cover`. All text **white**, **centered**.

## Measurements @ 1280 (band 1280 × **720**)
| element | font | line-height | letter-spacing | weight | font var | relY (from band top) |
|---------|------|-------------|----------------|--------|----------|----------------------|
| Tagline | **56px** | 1.10em (61.8) | -0.02em | 400 | `--font-canva-secondary` (serif display) | 207 · h≈186 (3 lines, max-w≈894) |
| CTA text | **18px** | 24.4 | 0.138em (2.49) | 700 | `--font-canva-primary` | 485 |
| CTA highlight | — | — | — | — | 3 overlapping hand-drawn rects, **`--color-brand-primary` @ 0.75 opacity**, ≈429×53 behind link | 469 |
| Brand | **36px** | 1.09em | -0.02em | 400 | `--font-canva-accent` (script) | 610 |
| Copyright | **16px** | 1.50em | 0.012em | 400 | `--font-canva-primary` | 708 (near bottom) |

Vertical rhythm: large display block centered upper-middle → CTA → brand → copyright pinned near
the band's bottom edge. Big breathing gaps (~90–125px) between blocks at 1280.

## Measurements @ 375 (band ≈ 375 × **706**)
| element | font | notes |
|---------|------|-------|
| Tagline | **24.8px** | wraps to ~344 wide |
| CTA text | **16.7px** | — |
| Brand | **38.5px** | stays large (template scales it *up* slightly on mobile) |
| Copyright | **16.3px** | ~constant |
| CTA highlight | **HIDDEN** | badge shapes removed/off-canvas at mobile |

## Proposed rebuild tokens (anchored to 1280, fluid below)
- Tagline: `clamp(24px, 4.4vw, 56px)`, lh 1.1, ls -0.02em, `--font-canva-secondary`, max-w ≈ 56ch/894px.
- CTA: `clamp(15px, 1.4vw, 18px)`, ls 0.138em, uppercase, weight 700, `--font-canva-primary`.
- Brand: `clamp(34px, 2.9vw, 38px)`, lh 1.1, ls -0.02em, `--font-canva-accent`.
- Copyright: `clamp(14px, 1.25vw, 16px)`, ls 0.012em, `--font-canva-primary`.
- Band: full-bleed photo, `min-height` fluid (≈ clamp), vertical centered flex column with the
  copyright pinned to the bottom. No `100rem` SectionBand grid; no inline `gridArea`.
- Animation: `ScrollReveal` per block, slide-up + fade, stagger ≈ index × 0.1s, order top→bottom.

## ✅ GATE 1 — RATIFIED (2026-06-19)
1. **Background:** Full-bleed couple photo **+ subtle dark scrim** (gradient/overlay) so white text
   stays legible across the whole band, including the light left area.
2. **CTA:** **Faithful** — reproduce the 3 hand-drawn brand-primary rounded-rect highlight shapes
   (`--color-brand-primary` @0.75) behind the link; **hidden on mobile** (≤ ~768).
3. **Footer:** **Keep tall & cinematic** — match the template's ~720px full-bleed band with the
   generous vertical rhythm above (fluid via clamp/min-height below 1280).
