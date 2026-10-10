# Visual roadmap — "even more alive & creative" (Oct 2026)

Status snapshot after the 2026-10-08 session. Production = main. Each item below is either DONE (shipped), REJECTED (owner decision), or OPEN (not started).

## Shipped on 2026-10-08
- DONE Hero paints on first load (CSS-only entrance, no hydration gate). Commit 7b9da58.
- DONE Two FABs merged into one contact pill; WhatsApp half in WhatsApp green (#25D366, owner decision: bold CTA, brand colour is an intentional palette exception); phone half plum; bottom-left on all breakpoints. Commits 7b9da58, 0d5a93e, and the final pill-position commit.
- DONE Palette docs reconciled to the shipped hexes (plum #7A5978 / mauve #C49AB8 / blush #ECC8CE / cream #FFF5F0); contrast tables recomputed. CLAUDE.md + agents.md.
- DONE One radius scale (`rounded-tile` 12px, `rounded-card` 24px, pills `rounded-full`); all buttons through ButtonLink (primary plum/cream, secondary cream/plum, both 5.55:1). Commit 659fca3.
- DONE Faint paper grain on solid sections (soft-light 0.12 dark/mid, multiply 0.08 light/cream). 659fca3.
- DONE Gallery photo outlines plum (not black); mobile map height fixed; /palette-preview and pallets.html removed. 659fca3.
- DONE Hero line-art couple is an inline SVG (traced, 11 KB) that draws itself with a pen; hearts appear last; then the existing float. Hand-drawn stroke under "ביחד." drawn right-to-left. Mauve blob blooms in. Sequence: h1 0.08–0.78 s → word stroke 1.05–1.85 s → blob 1.5–2.6 s → pen 2.0–4.2 s → hearts 4.2 s. Commit 5bd6955.

## Rejected (do not re-propose)
- REJECTED Hand-drawn underline under every section title ("doesn't fit authentically"). Only the hero word stroke stays.
- REJECTED Recolouring the WhatsApp CTA to the palette.

## Open decision
- OPEN Mauve ("mid") sections carry cream text at 2.26:1 (fails AA): Services "איך זה עובד?" and contact-social "עקבו אחריי". Options: move those sections to plum or cream tone, or accept as decorative-weight text. Owner has not decided.

## Open recommendations (ranked)
1. OPEN Sticky translucent plum header with backdrop blur that appears once the hero scrolls away, with scrollspy active state. Today there is no nav after the hero.
2. OPEN Living section transitions: morph the page background colour with scroll (framer useScroll/useTransform between tones) or let photos/portrait bleed across section boundaries; remove the `-mt-px` seam hacks.
3. OPEN Line-art illustration family (family, parent+child, individual, clinic chair) in the hero style, used as section markers, on Expertise cards, credentials background, 404. The traced-SVG pipeline from this session is in the session scratchpad notes (imagetracerjs centerline → svgo); re-create as needed.
4. OPEN Branded photo treatment: mauve duotone/multiply tint, varied crops (arch for the portrait, one circle, blob masks echoing the hero blob), plum-tinted scrims on CTA band and footer instead of black.
5. OPEN Expertise section as an editorial stage: four Elamy names down one side, one large image crossfading on hover/tap, one line of description each; today the 2x2 grid leaves most of a full-viewport plum section empty.
6. OPEN "איך זה עובד" on mobile as a timeline (round thumb, number, title, bullets, a vertical line that fills on scroll); keep posters on desktop; bullets are 13px, below the 14px floor.
7. OPEN Motion vocabulary beyond the single fade-up: clip-path mask reveals for photos, word-by-word rise for the hero H1, parallax on Expertise and step cards (ParallaxFrame exists), lift+tilt hover on cards.
8. OPEN Replace the captionless 6-photo stock grid with real testimonials once Netta supplies quotes (the block exists, gated by SHOW_TESTIMONIALS=false, lorem ipsum).
9. OPEN Elamy handwritten signature at the end of the bio quote (`.type-signature` exists, unused) — draw-in with the same pen.
10. OPEN Mobile menu overlay: fade + staggered link reveal, hamburger-to-X morph.
11. OPEN Housekeeping: social links point to bare facebook.com / instagram.com / twitter.com; footer "© 2026" has no name; step cards show a faint light rectangle at rounded corners (ScrollReveal + safari-clip + shadow); About portrait `lg:sticky` never sticks because Section/main are overflow-hidden.
