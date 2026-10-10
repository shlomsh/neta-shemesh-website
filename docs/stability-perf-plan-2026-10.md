# Mobile stability and rendering performance: plan of record (2026-10-09)

Status: **open, awaiting the architect's final decision** (see §6). Owner: Shlomi. Written by the team-lead session "Netashemesh site visual improvements".

## 1. Where production is

`main` = `0e72f9e`, live on Vercel (deployment: success).

| Commit | What | State |
|---|---|---|
| `8864779` | Contact + Expertise use the spacing tokens (`pad="section"`, wide gutter) | live, verified |
| `fd0ba7b` | Footer fills the visible screen (`min-h-dvh`, svh fallback), content centred; soft snap includes the footer and ran on mobile ("gentle" touch mode) | live; **mobile part regressed** |
| `992a790` | Section fit cards use `max-lg:min-h-lvh` so a collapsed iOS toolbar shows no strip of the next card; hero stays svh | live |
| `0e72f9e` | **Hotfix:** soft snap disabled below 1024px again (the page felt "stuck" in an iOS in-app browser) | live |

Desktop (≥1024) behaviour is unchanged by all of the above.

## 2. Owner-reported problems (iPhone, Safari and a Google-app-style in-app browser)

1. **Stuck page after `992a790`.** The hero shows and the page won't progress or scroll properly. Hot-fixed by turning mobile snap off. The root cause is not yet confirmed.
2. **Elamy headings render clipped right after load and heal a moment later** (e.g. "להצית מחדש את הקשר הזוגי"). The same class of bug the owner fixed by hand for the hero in `25f07f8` (padding the h1 box).
3. **General latency.** "Not lightly rendered, not running smooth, a strange latency in rendering and effects."

## 3. Working hypotheses (to be confirmed by measurement, not assumed)

- **H1, mobile snap:** in WKWebView in-app browsers, touch and momentum event ordering differs (no `touchend` after momentum, scroll events during momentum, `innerHeight` changes as chrome toggles). The gentle-snap state machine (`touching`, `TOUCH_SETTLE_MS`, the 100lvh probe, the svh hero vs lvh cards) can glide against the user or pin to the hero.
- **H2, clipped glyphs:** Elamy's ink overflows its line box. While ScrollReveal (framer-motion: opacity, transform, will-change) animates, WebKit composites the element as a layer clipped to its border box, so ascenders and descenders are cut until the animation ends and the layer is dropped. `overflow-hidden` on every Section (3a) may contribute.
- **H3, latency:**
  - ~40 framer-motion `ScrollReveal` wrappers and per-frame `ParallaxFrame` (`useScroll`/`useTransform`) do JS work on the main thread during scroll.
  - Many composited layers (will-change) pressure iOS memory.
  - The hero waits on a sequenced CSS entrance.
  - 6 preloaded woff2 fonts.
  - A paper-grain `::before` overlay.
  - Plain `<img>` without responsive sizing in places.

## 4. Workstreams in flight

| # | Workstream | Agent | Output | Ships? |
|---|---|---|---|---|
| A | Root-cause H1 (stuck scroll) and H2 (clipping) in the iOS Simulator; prototype ONE shared heading fix modelled on `25f07f8` (padding-block plus a compensating negative margin in `.type-title`/`.type-display`/SectionTitle) | sonnet, scratch worktree on `0e72f9e` | root-cause report plus a local commit, not pushed | only after review and owner OK |
| B | Performance audit, measure first: Lighthouse mobile ×2, CPU-throttled Playwright trace (long tasks, frame times during scroll, hydration), layer count, per-route JS and framer-motion share, font/image/LCP path, iOS Simulator sequencing | sonnet, read-only | `perf-audit-2026-10.md` with ranked causes and fixes | no (audit only) |

Results from A and B will be appended to this doc (§8) when they land.

## 5. Proposed direction (pending A and B evidence)

Ordered by expected impact on the "latency" feeling. **BN** = behaviour-neutral; **VC** = visual change that needs owner approval.

1. **Replace framer-motion reveals with CSS (VC: timing only).** One IntersectionObserver toggles a class (or CSS scroll-driven animation with a fallback); opacity and transform only, no lingering `will-change`. SSR must render content visible when JS is off or under reduced motion, which keeps the `[data-reveal]` CSS guard (bug fixed in `8fcd901`). Expected: a large cut in scroll-time JS and layers, and fixes H2 at the source.
2. **Drop parallax below lg (VC, subtle)**, or move it to CSS scroll-driven animation. Removes per-frame JS on phones.
3. **Shared Elamy ink-box fix (BN once settled):** headings get padding-block with a compensating negative margin (or font-metric overrides) so the glyph ink sits inside the box; this removes the per-heading hero patch.
4. **Hero first paint (VC):** content visible immediately; decorative strokes and the line art animate after, never gating text.
5. **Fonts:** preload only what's above the fold (likely Elamy 700 + Stanga 400); the rest swap in (BN).
6. **Images:** `next/image` with correct `sizes`/`priority` for LCP and mosaics (BN by pixel diff, after load).
7. **Below-fold work:** `content-visibility: auto` on non-hero sections and a cheaper grain overlay (BN, verify).
8. **Mobile snap:** stays OFF on mobile unless A proves a safe design. Re-enabling needs a real-device check (Safari + in-app browser), not just the simulator.

## 6. Decisions requested from the architect (final call)

1. Is CSS reveal plus IntersectionObserver the target, vs keeping framer-motion with tuned settings, vs CSS scroll-driven animations (consider iOS support)? Should framer-motion be removed from the bundle entirely?
2. Parallax: remove on mobile, move to CSS, or remove everywhere?
3. Where does the ink-box fix live: type classes in `globals.css`, `SectionTitle`, or a font-metric approach (`ascent-override`/`descent-override` in `@font-face`)?
4. Mobile snap: retire for good on touch devices, or a safe redesign (criteria)?
5. Batching and gates for executing items 1–7 (each gate sized to its blast radius; desktop pixel-identical after settle where BN).
6. Anything in the architecture review that supersedes or reorders this plan.

## 7. Constraints (from CLAUDE.md and session lessons)

- Design contract: 4-colour palette, type scale, contrast pairs, one-screen cards at lg+, Hebrew RTL, hero motion order (h1 → word stroke → blob → couple pen → hearts).
- SSR correctness: never ship `opacity:0` that only JS can undo. Reduced motion shows everything static.
- iOS first: validate in the simulator, and on a real device before re-enabling any touch behaviour.
- Keep gates lean: verification scoped to the change's blast radius, ≤2 builds per change, servers stopped by PID. Full-site pixel sweeps only for shared-primitive or CSS changes.
- Agents commit in scratch worktrees; pushes to `main` need the owner's approval.

## 8. Evidence log

_(to be appended: root-cause report from A; measured numbers from B)_

## 9. Decisions and outcome

The architect's answers to the questions in §6 are in `docs/archive/architecture-review-2026-10.md` §6; that section is the record of the decisions. What shipped from this plan (ticket ids refer to the live board):

- **NS-11** shared Elamy ink-box fix for headings (replaces the per-heading hero patch).
- **NS-13** CSS reveal with one IntersectionObserver instead of framer-motion reveals.
- **NS-16** touch snap retired for good; soft snap stays at widths >= 1024px only.
- **NS-26** hero first paint: text visible immediately, decorative strokes animate after.
- **NS-37 / NS-39** card heights (full-screen cards fill the visible screen on mobile).
- **NS-42** contrast guard in the sanity suite.
- **NS-33** contrast fixes on the blog cards.
- **NS-45** inline ink box (in progress).

The live kanban, https://claude.ai/artifact/GV4NpXrzjzc4wQ1XgBthwt, is the board of record for status. This plan is kept as the problem statement and evidence trail; it may lag the board.
