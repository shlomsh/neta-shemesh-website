# Architecture review: Netta Shemesh website (2026-10-09)

| | |
|---|---|
| Date | 2026-10-09 |
| Status | **Review complete.** Contrast audit H is in (section 3.3): 16 failing sites, 90 of 390 text instances. Colour fixes need owner approval; focus fixes are keyboard only. NS-11 (Elamy ink box) passed its gate as commit `206a875` (0 px at 1440/390 on home, blog and both posts; Simulator crops clean) and is merging. It is on local `main`; the push needs the owner. |
| Live board (source of truth for ticket status) | https://claude.ai/artifact/GV4NpXrzjzc4wQ1XgBthwt |
| Board snapshot (git history only, may lag) | `docs/archive/sprint-board-2026-10.md` |
| Peer plan this review answers | `docs/stability-perf-plan-2026-10.md` (§6 decisions are answered in section 6 below) |
| Previous refactor (already executed) | `docs/archive/tech-debt-plan-2026-10.md` |
| Design contract | `CLAUDE.md` |

Evidence base: audit reports A to G (A bundle/client/Next 16, B motion/a11y, C Tailwind, D components/tests/layering, E runtime perf, F snap/height, G cache/loading/minify), plus the peer session's `rootcause-2026-10.md` and `perf-audit-2026-10.md`. All numbers below come from those reports, including report H (contrast, section 3.3).

**Legend**

- **BN** behaviour-neutral. **VC** visual change, needs owner approval. **CC** contract change (CLAUDE.md or a documented owner decision), needs owner approval.
- Effort: S under 1 h, M half-day, L a day or more (the reports' scale).
- Finding ids are kept from each report: A* (report A), M* and X* and E1 (B), T* (C), C* and R* and Q* and L* (D), P* (E), S* (F), D* (G). `VIS-*` are the peer session's ids.
- **Id drift on the board.** The board's "Findings" column was drafted before the final D report. For D-report items it uses some shifted ids (for example it cites "C9" for the `.type-title` weight drift, which is D's C11, and "C12" for the Services alignment, which is D's C12 but is cited on the board as C14). This review uses the final report ids. The ticket column in section 3 is authoritative for the mapping.

---

## 1. Executive summary

1. **Remove framer-motion (NS-13, NS-14, NS-15).**
   - It is 121,106 B raw / 39,563 B gz on every route (17.8% of executed first-load JS raw, 19.5% gz). Net saving after the replacement is about 37 KB gz, about 18% of `/` first-load JS.
   - It is used for three trivial effects (scroll fade-in, a delayed FAB entrance, photo parallax).
   - About 52 to 55 hydrated client roots go away, the 68-line vitest mock goes, and about 100 to 150 source lines go.
2. **Make content visible without JS (NS-13).**
   - 46 elements ship `opacity:0` in the SSR HTML, so everything below the hero waits for JS: all first-party JS finishes at 3.39 s on a throttled slow-4G profile.
   - The blog cover's bytes arrive at 388 ms but its LCP is 1316 ms: about 0.9 s of render delay, all of it the JS-gated reveal.
   - The same change removes the past production bug family (8fcd901, dfec2c0).
3. **Resize the favicon and apple-icon (NS-01).** `icon.png` and `apple-icon.png` are 2×354,076 B at 2000×2000. This is about −330 to −350 KB per first visit, zero code, zero risk.
4. **Ship AVIF and right-sized images on the mobile path (NS-30, NS-02).**
   - 748 KB of raw `/images/*.webp` is on the mobile path. AVIF at about −55% (measured on same-size pairs) gives **about −410 KB**. It needs owner approval (lossy, subtle).
   - Oversized assets are a separate, behaviour-neutral win: jigsaw icons 2000×1500 shown at 96 px (about −50 to −59 KB, and slow-4G CLS 0.065 → 0), collage and logo (about −70 and −10 KB).
5. **Cut High-priority font preloads from 6 to 3 (NS-29).** 68.9 KB of 153.4 KB (45%) is not needed above the fold on mobile. On slow 4G the fonts land after LCP and cause the hero swap CLS 0.0275.
6. **Maps embed is 616 KB in 25 requests (NS-28).** A click-to-load facade removes it for visitors who never tap. It is a VC (owner decision).
7. **Scroll snap.**
   - Touch snap is retired for good (NS-16). Native CSS `proximity` pulled a slow 130 px drag back to y=0, the same "stuck hero" failure, so it is not a fallback.
   - The desktop snap is mis-tuned, not slow: 59.5% of resting positions trigger it, and half of those pull **backward** (mean 122 px, up to 173 px in Chromium and 229 px in WebKit). A v2 behind an off/v1/v2 Preview A/B lets the owner choose (NS-36).
8. **Elamy ink box is fixed at the source (NS-11, `206a875`).** Measured glyph ink (ץ +1.516em above the baseline, ך −0.80em below) needs `--ink-top:.72em` and `--ink-bottom:.62em`. The peer prototype's 0.3/0.35em would still clip four live headings.
9. **Code and test simplification, about 285 source lines and about 500 legacy test lines.**
   - Source (D's prioritised table: −55, −80, −150): tighter `BodyText`, `Section`, `Photo` and `PageShell` APIs, `Grid` deleted, `Container fill` plus `FillGrid`.
   - Tests: 14 legacy class-string test files (35 tests) go. Sanity helpers then read `data-fit` and `data-fill` instead of class tokens, so primitive refactors stop turning the suite red.
10. **Cheap hygiene with real exposure.**
    - `/blog` has no `og:image`.
    - A skip link, landmarks, menu `inert` and a visible keyboard focus ring on blog cards are missing.
    - `/images/*` is cached 1 day.
    - Tailwind's scanner reads about 30 non-`src` files (1.46 KB of junk CSS).
    - Contrast (report H, section 3.3): 16 failing sites, 90 of 390 text instances. Colour fixes change the look and need owner approval; focus fixes are keyboard only. No text on a photo fails.
    - Open gap: CI runs Chromium only, so no WebKit regression (Elamy clip, iOS units) can fail a build.

---

## 2. Current architecture map

### 2.1 Layers (enforced by `tests-unit/sanity/component-layers.test.ts`)

Dependency direction is a **chain**, not peers: `content → lib → motion → primitives → site → (sections | blog) → app` (D L2: the README presents `primitives` and `motion` as peers, but `Photo` imports `motion`).

| # | Layer | Path | Holds | Must not import |
|---|---|---|---|---|
| 1 | content | `src/content` | `site.ts`, `ids.ts`, `types.ts`, `home/*` data, `posts/*` | components |
| 2 | lib | `src/lib` | `cx`, `motion` (`stagger`), `soft-snap` (pure), `seo/*` | components (`seo/*` reads content) |
| 3 | motion | `src/components/motion` | `ScrollReveal`, `ParallaxFrame`, `SoftSnap` | primitives |
| 4 | primitives | `src/components/primitives` | `layout/{Section,Container,Grid,Card,ScrollAnchor}`, `ui/{BodyText,ButtonLink,SectionTitle,SectionHeader,Photo,MaskIcon,IconButton}` | content |
| 5 | site | `src/components/site` | `PageShell`, `JsonLd`, `ContactFAB`, `BrandLogo`, `SiteNav`, `MobileMenu`, `NavLink`, `footer/*`, `hooks/*`, `icons/*` | sections |
| 6 | sections, blog | `src/components/sections/*` (home only), `src/components/blog` | 11 home sections plus the parked testimonials; blog components | other sections |
| 7 | app | `src/app` | routes, `layout.tsx`, `fonts.ts`, `sitemap.ts`, `globals.css` | nothing (imports all) |

Layering verdict (D L1): no violations today. Weak spots: `app/` is allowed to lay out markup and the blog pages do (`blog/[slug]/page.tsx` is 152 lines with 5 inline bands); `ContactPhoto` carries grid placement in the content layer (L3); the rule runs only in vitest, with no editor feedback (L2).

### 2.2 The six `'use client'` modules (A §1)

| Module | Lines | Needs client? | Ships on |
|---|---|---|---|
| `motion/ScrollReveal.tsx` | 38 | No (CSS plus one IO would do) | home, blog index, post (41 usages) |
| `motion/ParallaxFrame.tsx` | 70 | Scroll linkage only | FooterBackground (every route), Reignite, ContactSocial ×2 |
| `site/ContactFAB.tsx` | 70 | No (pure CSS keyframe entrance) | every route via `PageShell` |
| `site/SiteNav.tsx` | 91 | Only the hamburger state (A6: boundary too high) | hero (home), `BlogHeader` (blog) |
| `site/MobileMenu.tsx` | 80 | Yes (only mounted when open) | via `SiteNav` |
| `motion/SoftSnap.tsx` | 218 | Yes (imperative effect, renders null) | `/` only |

After NS-13/14/15 the list becomes five modules: `RevealObserver`, `ParallaxIsland`, `SiteNav`, `MobileMenu`, `SoftSnap`. The first two are new, tiny and render null.

### 2.3 Per-route JS (A §2; Vercel and export builds agree within 0.3%)

| Route | Rendering | Executed JS raw / gz | Route-specific JS raw / gz | HTML raw / gz |
|---|---|---|---|---|
| `/` | static | 681,742 / 202,900 | 167,093 / 56,710 | 167,987 / 35,397 (flight payload 79.7 KB, 47%) |
| `/blog` | static | 678,401 / 201,503 | 163,752 / 55,313 | 41,702 / 8,981 |
| `/blog/[slug]` (×2 posts) | SSG | 678,401 / 201,491 | 163,752 / 55,301 | 66,254 / 14,565 |
| `/_not-found` (no first-party client code) | static | 514,649 / 146,190 | n/a | 19,271 / 4,221 |

- The framework floor (react-dom 227,314 B, Next router 150,333 B and 5 smaller chunks) is 514,649 B raw / 146,190 B gz on every route.
- The route chunk (`2h73v…` on home, 160,375 B raw / 53,945 B gz) is **75% framer-motion** (first 121,106 B).
- The same 160,375 B chunk is emitted three times with different hashes (home, blog, post; D5). A home → blog client navigation downloads a second copy of the library, about 54 KB gz. This becomes moot when framer is removed.
- A `noModule` polyfill chunk (112,594 B) is not downloaded by modern browsers. CSS is 44.5 KB raw / 9.3 KB gz plus a 1.4 KB hero-module sheet. Six preloaded woff2 files total 151.6 KB.
- Next 16 checklist is clean (A §4): everything is statically prerendered, no `middleware`/`proxy`, `params` awaited, no deprecated config. Cache Components, PPR and the React Compiler are not worth enabling.

### 2.4 Cache policy per asset class (G §1, §4)

| Asset class | Today (Vercel) | Today (Azure SWA export) | Proposed | Ticket |
|---|---|---|---|---|
| `/_next/static/**` (hashed js, css, media) | `public,max-age=31536000,immutable` | **`max-age=30`, must-revalidate** | Vercel: keep. SWA: add a `/_next/static/*` route with immutable. | NS-07 (D3) |
| HTML (`/`, `/blog`, `/blog/*`) | `public, max-age=0, must-revalidate`; edge HIT, TTFB about 215 to 230 ms warm | `max-age=30` | Keep. No `s-maxage`. | none |
| `/images/*` (unhashed) | `max-age=86400, swr=3600` (1 d) | same rule | 7 d + swr 1 d now; fingerprint filenames later, then `immutable` | NS-07 (D1) |
| `/icon.png`, `/apple-icon.png` | `max-age=0, must-revalidate`; 354,076 B | n/a | Shrink first; then 1 d | NS-01 |
| `/opengraph-image.png`, `robots.txt`, `sitemap.xml` | `max-age=0, must-revalidate` | `max-age=30` | Leave | none |
| `/fonts/*.woff2` (unhashed copy, unused by pages) | `max-age=0` | **`immutable` 1 y on an unhashed file** | Move font sources out of `public/`; delete the SWA `/fonts/*` rule | NS-07 (D11, D3) |
| `/_next/image` | inherits the `/images/*` rule | n/a (unoptimized) | Follows upstream | none |
| Source maps | 403 | n/a | Keep 403 | none |

`compare:deploys` has no Cache-Control check, so host drift is unguarded (D4, in NS-07).

---

## 3. Findings

Sorted by impact: measured user-felt cost first, then correctness and contract, then maintainability, then deferred or declined. When several reports found the same thing, the row lists all ids.

### 3.1 Findings table

Columns: **Class** is BN, VC or CC. **Ticket** is the board id.

| Id | Area | Evidence | Proposal | Risk | Effort | Class | Ticket |
|---|---|---|---|---|---|---|---|
| **A1, M1, M2, M3, M12, P8, P9, C5** (M4 skipped) | Motion / SSR / blog LCP | framer 121 KB raw / 39.6 KB gz on every route (A). `ScrollReveal.tsx:21-33`. 46 `opacity:0` in SSR (A, B; E counts 45 of 46). Cover bytes 388 ms, LCP 1316 ms (E; `blog/[slug]/page.tsx:98-110`, `blog/page.tsx:40,59`). | Server `Reveal` + one `RevealObserver` + CSS; `delay` becomes a `step` enum; above-the-fold elements reveal on arming. See 4.2 and 6.1. | Med | M | BN at rest. **VC**: blog above-the-fold entrance removed; delays 0.1/0.2/0.3 round to 0.12/0.24/0.36 s | NS-13 |
| **M5** | Motion | `ContactFAB.tsx:36-43` is `motion.div`, delay 0.8 s | CSS keyframes, `.hero-enter` pattern | Low | S | BN if the ease matches (frame capture) | NS-14 |
| **M6, M3, P10, D5** | Parallax / dependency | 10 mounted frames (about 7 live); 5.7 style recalcs per frame in a phone-width fling and 0.45 s task time in about 1.1 s (F S9); 3 `display:none` frames still subscribe (E P10). | About 1 KB vanilla island on lg+; static midpoint crop below lg; then remove `framer-motion`, the vitest alias and the mock. | Low-Med | M | **VC** below lg | NS-15 |
| **A2, D2, P1** | Assets | `icon.png`, `apple-icon.png` 2000×2000, 354,076 B each, `max-age=0`, declared `sizes="2000x2000"` | 512 px icon and 180 px apple icon (ideally also 32/48) | None | S | BN | NS-01 |
| **P-IMG1, A7a** | Images | 748 KB raw webp on the mobile path via `Photo` `engine:'img'` (`Photo.tsx:122`). AVIF vs same-size webp: −59%, −60%, −53% (E). | `engine:'next'` with correct `sizes` on Vercel; pre-generated AVIF with `<picture>` for the unoptimized export; add a `priority` pass-through to `Photo` | Med | M | **VC** (subtle; lossy re-encode) | NS-30 |
| **S1, S2, S3** | Desktop snap | Rest 971 → glide to 799 (−173 px) after a 142 ms idle, 524 ms long (D1). 59.5% of resting positions trigger, 50% of those backward, mean 122 px. WebKit D3 reversed 229 px. | v2: direction-aware, armed by a gesture ≥ 0.15 vh, threshold 0.2 vh, settle 180 to 220 ms, glide about 380 ms; off/v1/v2 Preview A/B | Low | S | **VC** (desktop feel; owner picks) | NS-36 |
| **S5, M11, X12, D8** | Touch snap | Peer Simulator repro: a slow 130 pt swipe released at y=110 glided back to 0; replay on prod geometry snaps 29.7% of positions at 390×844, 35% of them backward. Native `proximity`/`mandatory` also pulled a 130 px drag to 0 (F M4). SoftSnap chunk 2.8 KB gz ships to phones where it is inert (G D8). | Retire touch snap permanently; gate on `(min-width:1024px) and (pointer:fine)` (also fixes iPads at ≥1024); delete gentle mode, `TOUCH_SETTLE_MS`, the lvh probe and the `largeViewportHeight` input; do not load the chunk on touch | Low | S | BN vs production (`0e72f9e` already off below 1024) | NS-16 |
| **P4, D10** | Third party | Maps iframe 616 KB, 25 requests, about 250 ms Google scripts; two long tasks coincided in one run (E) | Click-to-load facade (static image + button) | Low | S-M | **VC** | NS-28 |
| **E1** | Elamy ink box | Ink reaches +1.106em / −0.562em, final forms ץ +1.516em, ך −0.80em; Chromium does not reproduce; peer Simulator repro (B §8) | `--ink-top:.72em; --ink-bottom:.62em`, padding + equal negative margin on the 3 Elamy classes; blog `mb-*` onto a wrapper; sanity rule `ink-box-margin` | Low | S-M | BN at rest | NS-11 (shipped `206a875`) |
| **P-FONT1, A8, P-IMG3** | Fonts | 6 High-priority preloads, 68.9 KB (45%) not needed on mobile; slow-4G fonts done 1.93 to 2.32 s, after LCP 1.96 s (E) | Preload Elamy 700, Stanga 400, Stanga 700 only; `preload:false` on Elamy 400 and both Roboto Condensed (separate `localFont` entries); `fetchpriority="high"` on the logo | Low | S | BN | NS-29 |
| **A3, P5, P-IMG2** | Assets | `jigsaw-puzzle-6/7.webp` 2000×1500 shown 96×72, ×6, no `width/height`: 59 KB, CLS 0.065 on slow 4G (E); collage-1/2 1.6 to 1.7× over at DPR 3; logo 2.2× over | Resize to 288×216 (+`width`/`height`), collage to about 480 px, logo to about 480×143; `about-credentials-art` about −20 KB (A) | None | S | BN (pixel check at 96 px) | NS-02 |
| **P12** | Prefetch | `/?_rsc` ×3 (about 20 KB) at 833 ms from BrandLogo/NavLink; opening the menu prefetches `/blog` (4 RSC + 56.5 KB chunk) and coincides with 51 and 58 ms long tasks | `prefetch={false}` on BrandLogo and the mobile-menu links | Low | S | BN | NS-34 |
| **D1, P7, D3, D4, D11** | Caching | See 2.4 | See 2.4; fonts out of `public/`; `compare:deploys` checks Cache-Control | Low | S, then M-L (fingerprinting) | BN | NS-07 |
| **F §6.3b, T5, X7** | Card height | Same lvh decision is written in 3 places (Section, Hero, Footer); Footer uses dvh while cards use lvh below lg (B X7) | One `--card-h` token plus `screen-fit` utility; hero gets its own `--hero-h` (= `100svh`) so the change stays BN | Med | M | BN | NS-37 |
| **S6, F §6.3c** | Phone heights | At 390×844 only 5 of 11 cards equal 1.0 vh; at 375×667 3 of 11; landscape 1 of 12 (F) | Content-height cards below lg; only hero, credentials, CTA band, footer stay one screen | Med | M | **CC** | NS-39 |
| **C3e, F §6.2** | Hero strip | Hero is `svh`; cards `lvh`. About 40 px of the next card shows under the hero when the toolbar collapses (714 → 754 in the Simulator) | Hero on `Section` and `--card-h` | Low | S | **VC** | NS-25 |
| **A4, A5** | SEO / Next | `/blog` has no `og:image`; `dynamicParams` unset; sitemap `lastmod` is `new Date()`; JSON-LD `JSON.stringify` unescaped `<` | Explicit default OG image; `dynamicParams=false`; content-derived `lastmod`; escape `<` | Low | S | BN | NS-03 |
| **X1, X2, X3, X5, X6** | a11y | `<footer>` and `<header>` inside `<main>` (`PageShell.tsx:33-38`); no skip link; background not `inert` and menu state survives crossing `md`; blog index jumps h1 → h3 (`PostCard.tsx:40`); hero `aria-label` names a region "main heading" | Skip link + `id=main`; interim landmark roles; `inert` on main while the menu is open and close on `md`; `PostCard headingLevel`; hero `aria-labelledby` | Low | S (M for full X1) | BN | NS-09 (full X1 unticketed) |
| **X4** | a11y | `PostCard.tsx:21` author `outline` at 18% beats the UA focus ring: near-invisible keyboard focus (WCAG 2.4.7/2.4.11) | `focus-visible:outline-[3px] focus-visible:outline-mauve` | Low | S | **VC** (keyboard focus only) | NS-10 |
| **M7, M8** | Reduced motion | `html{scroll-behavior:smooth}` not gated (`globals.css:68`); hover/active transforms not gated | `scroll-behavior:auto` under reduce; `motion-safe:` on hover/active transforms | Low | S | BN (except reduce-motion users) | NS-05 |
| **H** | Contrast | 16 failing sites, 90 of 390 text instances (3.3). Mid-tone titles, translucent plum, blush and mauve text; no text on photos fails | F1, F2, F3, F5, F6, F7 colour (NS-33); F4 (NS-43); F8 focus (NS-10, NS-41); guard with allow-table (NS-42). F9 unassigned, low priority | Med | M | **VC** (colour); keyboard only (focus) | NS-33, NS-43, NS-41, NS-10, NS-42 |
| **P-FONT2** | CLS | Hero swap CLS 0.0275 at 2.32 s on slow 4G; Stanga has no metric-adjusted fallback | Hebrew-only fallback face with `size-adjust` for Stanga | Med | M | **CC** (`adjustFontFallback`) | NS-35 |
| **S7, S8, M10, P11, P3** | WebKit paint (unmeasured) | Grain `::before` with blend on 11 sections; 28 `safari-clip` masks; 92 non-visible overflows; Chromium shows no cost (E: Task 1.935 s grain off vs 1.739 s on; frames p95 9.3 ms both) | Measure first in the iOS Simulator: grain off, `clip-path: inset(0 round …)` instead of the mask, `overflow:clip`; `?paint=lite` preview toggle; keep only what shows a difference | Med | M | BN if pixel-identical, else VC | NS-38 |
| **VIS §5.4, P3** | Hero | Hero staging runs about 4.7 s; infinite `floaty` loop | Decorative strokes after text; pause the loop after the first run | Low | S | **VC** | NS-26 |
| **C1, C6, C3 (minus Hero, seam), R2** | Components | `BodyText`: the default branch is never taken (8 of 8 sites pass `type-*`), regex sniff at `:24`; `Grid` has 1 use, all props at defaults; `Container maxWidth="xl"` has 0 uses; blog pads re-typed 4× as `clamp(48px,7vw,96px)` | `BodyText size` required; delete `Grid`; `Section` pad tokens `blog`/`band`, `labelledBy`; `content/images.ts` + image-exists test | Low | S-M | BN | NS-18 |
| **C2, C4, C8, C10 (4), R5, L2, L3, R4** | Components / layering | The `lg:flex lg:min-h-0 lg:flex-1 lg:flex-col` chain is hand-typed at 4 sites (`Intro.tsx:17`, `Gallery.tsx:19`, `Reignite.tsx:19`, `Expertise.tsx:19`); `ExpertiseCard`/`StepCard` are the same shell; blog `page.tsx` files lay out markup; `ContactPhoto.extraStyle` is redundant with the grid template | `Container fill` + `FillGrid` (`data-fill`); `Photo` fit/radius/shadow unions; card shell via `Photo`; `PostIntro`/`PostGrid`/`PostHero`/`PostCta`; "pages compose" sanity rule | Med | M-L | BN (possible 1 px shadow shifts) | NS-19 |
| **C7, C9, C10 (5), C13, C14, R1, R3, R4** | Components (mechanical) | 4 hand-rolled anchors; 6 single-child fragments; 21 exported types with 0 external importers; `SectionFit` referenced nowhere; `PageShell` props coupled by a comment; `SiteNav basePath: string` | `Section anchor=`; drop fragments; un-export; `PageShell snap`; `crossRoute`; delete `extraStyle`; `RichParagraph` | Low | S-M | BN | NS-17 |
| **C11, T6 (doc part)** | Contract drift | `.type-title` is `font-weight:400` in CSS, call site adds `font-bold tracking-[-0.01em]` (`SectionTitle.tsx:24`); CLAUDE.md says 700; the comment at `SectionTitle.tsx:17` is false | Bake 700 + tracking into the class (and update `type-scale-css.test`), or fix the doc | Low | S | BN | NS-12 |
| **C12** | Alignment | Services text column is `text-center md:text-right`; subtitle forced `text-right` (`BodyText.tsx:26`). At 375 px title centred, subtitle right. Not verified in a browser. | `SectionHeader align` gains `'center-md-start'`; verify in the VR set first | Low | S | **VC** | NS-24 |
| **Q1** | Tests | 14 legacy files / 35 tests assert class strings (about 500 lines); one assertion is vacuous (`not.toContain('sm:block')`) | Delete after mapping each to a stronger sanity test; fold `soft-snap-wiring` into the sanity soft-snap test | Low | S-M | n/a | NS-20 |
| **Q3** | Tests | Playwright 25 active tests; `track-c` (10) re-tests a CSS clamp; `fonts` tests a tautology; `text-visibility` asserts `toBeVisible()` which ignores `opacity:0` | 25 → about 10; remove 3 timing waits; speed `layout-fit` with reduced motion | Low | S | n/a | NS-20 |
| **Q2** (and Q4 in NS-18, Q5/Q6 in NS-04) | Tests (gaps) | No unit coverage for `MobileMenu`, `SiteNav`, `useFocusTrap`, `PostBody`, `pageMeta`, `sitemap`, `IS_PRODUCTION_HOST` (the noindex-on-staging rule), `blogPostingJsonLd`; blog pages are rendered by no unit or Playwright test | Blog index and post render tests; SEO plumbing; MobileMenu behaviour; about 40 tests, under 0.5 s | None | M | n/a | NS-21 |
| **Q5 L4 (Q6 on the board)** | Tests (VR) | No committed visual regression; the A/B harness `shots.cjs` lives in a scratchpad. Gates depend on it. | Commit the two-build A/B harness: 5 viewports home (60 shots), 3 blog index, 3 post = about 66 images, about 1 min per build; no committed PNGs | Low | S | n/a | **NS-04 (first)** |
| **L2, L3** | Layering | Rule runs only in vitest | ESLint `no-restricted-imports` mirroring `component-layers`; README says "chain" | Low | S | n/a | NS-22 |
| **T3, T7, T12** | Tailwind tokens | 13 `color-mix(…transparent)` uses; hover mixes; WhatsApp hex; `@theme static` veil workaround; 4 repeats of the focus-ring pair | `text-plum/82` style modifiers; derived tokens (`--color-plum-hover`, `--color-veil`, `--color-whatsapp`); `--container-prose`; `focus-ring` utility; `bg-linear-to-t` | Low | S-M | BN | NS-23 |
| **T1, T2, T9, T10** | Tailwind hygiene | `@source` half-scoped, about 30 non-src files read, about 1.46 KB junk CSS (6 `.container` rules); `--font-elamy: var(--font-elamy)` cycle works only by cascade accident; `.hero-enter-0` is a no-op; default palette still compiles | `@import "tailwindcss" source(none); @source "../";`; delete the self-referential tokens; delete the no-op; `--color-*: initial` | Low | S | BN | NS-08 |
| **A7b, A9** | Lint / tsc | 9 `@next/next/no-img-element` warnings; `tsc` fails locally on stale `.next/dev/types/validator.ts` | Scoped disables with reasons, `--max-warnings 0`; drop the `.next/dev/types` include | None | S | BN | NS-06 |
| **R8** | Repo hygiene | `reference/` (908 KB) and `design_handoff_hero_05b/` (3.1 MB) tracked | Archive out of the working tree | None | S | n/a | NS-27 |
| **A6** | Client boundary | `SiteNav.tsx` is client for the whole component; only the hamburger needs it | Server `SiteNav` + small client `MobileNavToggle` (about 1 to 3 KB raw) | Low | S-M | BN | unticketed, optional, after NS-13 |
| **D6, D7, D9, D12** | Delivery | Inline RSC flight is 50.0% of home HTML (83,977 B); edge brotli is weaker than gzip-9 for large JS; second hero CSS file (1,436 B) is render-blocking; `Link` prefetch cost small | Class instead of the repeated inline `filter:` style (D6, 1 to 3 KB br); D7 is an infra limit; D9 inline or merge the hero module CSS; D12 leave | Low | S-M | BN | unticketed (D6, D9); D7, D12 no action |
| **T4** | Tailwind | 121 arbitrary px values, 114 on the 4 px scale; consistency, not bytes | Codemod to scale utilities + sanity rule `arbitrary-px-on-grid`; `ui-primitives.test.tsx:152,165,224` must change in the same commit | Low | M | BN | unticketed, optional |
| **X8** | iPad | `lg:` heights are `svh` only; iPad Safari 1024 to 1366 has a collapsing toolbar, so the strip bug is plausibly still there (unverified) | Check in an iPad Simulator | Med | S | unknown | fold into NS-37 verification |
| **T13, T14, R7, T11, T8, C15, R6** | Declined or deferred | See 6.7 and section 7 | Deferred or no action | n/a | n/a | n/a | none |

### 3.2 Where two reports disagree, and who wins

| # | Topic | Position 1 | Position 2 | Winner and why |
|---|---|---|---|---|
| 1 | **Grain overlay and LCP** | Peer: the grain is a real paint cost behind a "2.87 s render delay" LCP; fix with a PNG tile (VIS-B #5) | E: the grain LCP candidate fires exactly at FCP in three loads (576, 1316, 404 ms), area about 30 px². A/B grain off vs on: Task 1.935 s vs 1.739 s, frames p95 9.3 ms in both. A pre-rendered tile is 62 KB (DPR 1), 229 KB (DPR 2), 481 KB (DPR 3), same raster time. | **E.** Measured on three loads plus an A/B plus a micro-benchmark. The Lighthouse swing (2.9 s vs 5.85 s) is a tiny-candidate metric artefact. NS-31 dropped. |
| 2 | **Blog cover LCP** | Peer: resource discovery problem, add `fetchpriority="high"` (VIS-B #6) | E: bytes arrive at 388 ms; LCP is 1316 ms; the cover is inside `<ScrollReveal>` so it is `opacity:0` until hydration + IO + fade. About 930 ms render delay, no discovery delay. | **E.** `fetchpriority` cannot move it; NS-13 fixes it. |
| 3 | **Oversize bytes** | Peer (Lighthouse): about 213 KB home, 129 KB post | E: true downscale headroom is about 150 KB at DPR 3 (231 KB at DPR 2); most photos are at or below 1× of the 3× pixel need (soft, not oversized). The big lever is format (−410 KB), not resize. | **E.** Computed per image from rendered pixel need. |
| 4 | **`will-change` layers** | Peer: left mid-animation uncaptured; suspects iOS layer pressure | E sampled while reveals were in flight: 0 at all 10 points. F: `auto` on all 46 reveals before and after. | **E and F** (measured, Chromium). iOS layer memory stays unmeasured. |
| 5 | **Reveal hidden-state gating** | A1: gate with `@media (scripting: enabled)`, "hidden-until-JS stays as is" | B: server HTML and base CSS must contain no hidden state; arm only after the first IO callback; reduce-gated. History: 8fcd901, 7b9da58, dfec2c0. | **B.** `scripting: enabled` still hides content when hydration is slow or IO never fires (the iframe failure). |
| 6 | **Parallax tech** | A1 and peer: CSS `animation-timeline: view()` (A1 also offers an rAF island) | B: `view()` binds to the nearest scroll container; `Section`, `Footer`, blog `main` are `overflow-hidden`, so timelines never progress; Chrome/Edge 115+, Safari 26+ only, none on iOS < 26 or Firefox | **B.** Code evidence (`Section.tsx:130`); F counted 92 non-visible overflows. Revisit after NS-38. |
| 7 | **LazyMotion saving** | A: −12.7 KB gz (rolldown isolated; both sides include `useScroll`/`useTransform`) | B: about −19 KB gz (framer rollups: `motion` 39.3 vs `m` 6.4 + `domAnimation` 13.9; excludes the 6.3 KB scroll hooks) | **A** is like-for-like (20.3 + 6.3 scroll ≈ 26.6 vs 39.3 gives the same −12.7). Moot: the stop-gap is skipped. |
| 8 | **Ink-box values and clip-path** | Peer prototype `b5dfce8`: `.3em/.35em`. F S11 ladder adds `clip-path: inset(-50% -10%)` on `[data-reveal]` as "S, BN". | B: computed per heading string. "קביעת פגישת ייעוץ" needs 0.616em top; "איך זה עובד?" needs 0.550em bottom; the prototype misses four live headings. `clip-path` is unproven and probably ineffective (does not enlarge the layer). | **B**, shipped as `206a875`. `clip-path` may be tried once in the Simulator as an experiment, not relied on. |
| 9 | **Mobile snap fallback** | Peer rootcause: if touch snapping returns, make it forward-only, or use native `proximity` on touch (architect decision) | F: native `proximity` and `mandatory` pulled a slow 130 px drag back to y=0 (M4) | **F** (measured, Chromium mobile emulation; not iOS). No benefit demonstrated, so retire. |
| 10 | **Lazy-loading the SoftSnap chunk** | A §6: not worth it (about 3 KB, needs a client wrapper) | G D8: 2.8 KB gz plus a request shipped to phones where it is inert | Resolved inside **NS-16** (the same wrapper is being rewritten). If the wrapper costs complexity, drop it; the saving is 2.8 KB gz. |
| 11 | **Image cache TTL** | E P7: 30 d + SWR, or hashed + immutable | G D1: 7 d + swr 1 d now (a same-name photo swap stays stale up to 7 d), fingerprint then `immutable` | **G.** Staleness on same-name replacement is the binding constraint. NS-07 uses 7 d. |
| 12 | **Tint replacement** | D R6: Tailwind v4 `text-plum/80` mixes in oklab, so it is a tiny visual change; leave it | C T3: micro-compile shows `text-plum/82` emits `color-mix(in oklab, … transparent)`, premultiplied, so identical to the srgb form | **C** (verified by compile). Gate with one screenshot. |
| 13 | **Hero joining `--card-h`** | F §6.4: BN except aligning the hero | Board NS-25: VC, the hero becomes about 40 px taller on phones (714 → 754) | **Board.** Resolution: NS-37 introduces `--hero-h: 100svh` (BN); NS-25 later points the hero at `--card-h`. |
| 14 | **`ScrollReveal` props** | B: keep `delay`, `className` | D C5 and board: `step` enum (7 magic delays across 28 raw-seconds sites) | **D/board.** Rounding is a stated VC (at most 0.06 s). |
| 15 | **Wrapper count** | A and B: 46 `opacity:0` elements | E: 46 wrappers, 45 ship `opacity:0` in SSR HTML | Immaterial. This review cites 46. |

### 3.3 Contrast (report H)

Report H measured WCAG 2.x AA on production `0e72f9e` (home, `/blog`, and two posts, at 375×812 and 1440×900; 390 visible text elements). Each text element is judged on the lower of its computed ratio and its rendered pixel median and worst decile (P10). Paths are relative to `src/`. Fix ids F1–F9 are H's.

**Result: 16 failing source sites, 90 of 390 text instances.** Non-text and focus failures are in the last tables.

#### A. Fail counts by severity

Critical = below 3.0 on meaningful text. High = 3.0 to under 4.5 on normal-size text. Watch = passes, but with under 0.3 margin or large-only.

| Severity | Source sites | Instances | Ratio | Scope |
|---|---|---|---|---|
| Critical | 9 | 40 | 1.98 to 2.29 | WhatsApp label; Expertise pill titles; mauve text (PostCard category, AuthorCard ×2); cream titles on mauve (4) |
| High | 7 | 50 | 3.00 to 3.79 | Translucent plum (4 sites); blush on plum (3 sites) |
| Watch | 4 | n/a | 3.74 to 4.83 | Post hero lead; hero blush quote; veil card lead; Expertise/Services H2 |
| **Total fail** | **16** | **90 of 390** | | |

Instances: WhatsApp label 8; Expertise pill 8; text-mauve 16; cream-on-mauve titles 8; translucent plum 28; blush-on-plum 22.

#### B. Critical fails

Req = 4.5 for normal text, 3.0 for large (≥24px, or ≥18.67px bold).

| # | Element | file:line | fg / bg | Ratio | Req | Fix (label) | Ticket |
|---|---|---|---|---|---|---|---|
| 1 | WhatsApp FAB label, every page | `components/site/ContactFAB.tsx:18-19, 52-53` | #ffffff / #25d366 | 1.98 | 4.5 | F1: plum half-pill with cream label; green kept on the glyph (5.55). Visual change, needs owner approval | NS-33 |
| 2 | Expertise pill titles ×4 | `sections/expertise/ExpertiseCard.tsx:19, 31` | cream / mauve pill at 95% over photo | 2.12 to 2.29 | 4.5 | F2: `bg-cream text-plum` or `bg-plum text-cream`; drop `opacity-95`. Visual change, needs owner approval | NS-33 |
| 3 | PostCard category eyebrow | `components/blog/PostCard.tsx:36` | #c49ab8 / #fff5f0 | 2.26 | 4.5 | F3: `text-plum`. Visual change, needs owner approval | NS-33 |
| 4 | AuthorCard eyebrow "על הכותבת" | `components/blog/AuthorCard.tsx:25` | #c49ab8 / #fae8e6 | 2.05 | 4.5 | F3: `text-plum`. Visual change, needs owner approval | NS-33 |
| 5 | AuthorCard role line | `components/blog/AuthorCard.tsx:29` | #c49ab8 / #fae8e6 | 2.05 | 4.5 | F3: `text-plum`. Visual change, needs owner approval | NS-33 |
| 6 | H2 "ליווי מקצועי לזוגות" (Intro, mid tone) | `sections/intro/Intro.tsx:16` | cream / #c49ab8 | 2.11 | 3.0 | F4: owner picks (a) cream/veil chip, plum on veil 4.98; (b) re-tone to dark, 5.55; (c) documented exception, not recommended. Contract change, needs owner approval | NS-43 |
| 7 | H2 "להצית מחדש את הקשר הזוגי" (Reignite) | `sections/reignite/Reignite.tsx:18` | cream / #c49ab8 | 2.22 | 3.0 | F4 (as row 6) | NS-43 |
| 8 | Reignite subtitle | `sections/reignite/Reignite.tsx` (`SectionSubtitle`) | cream / #c49ab8 | 2.22 | 3.0 | F4 (as row 6) | NS-43 |
| 9 | H2 "המשרד שלי" (ContactOffice) | `sections/contact/ContactOffice.tsx:24` | cream / #c49ab8 | 2.22 | 3.0 | F4 (as row 6) | NS-43 |

#### C. High fails (summary)

| # | Element | file:line | fg / bg | Ratio | Req | Fix (label) | Ticket |
|---|---|---|---|---|---|---|---|
| 10 | PostCard excerpt (82% plum) | `components/blog/PostCard.tsx:44` | plum @0.82 / cream | 3.79 | 4.5 | F5: solid `text-plum` (5.55). Visual change, needs owner approval | NS-33 |
| 11 | AuthorCard bio (82% plum) | `components/blog/AuthorCard.tsx:30` | plum @0.82 / #fae8e6 | 3.53 | 4.5 | F5: `text-plum` (5.04). Visual change, needs owner approval | NS-33 |
| 12 | PostCard date (70% plum) | `components/blog/PostCard.tsx:48` | plum @0.70 / cream | 3.00 | 4.5 | F5 (as row 10). Visual change, needs owner approval | NS-33 |
| 13 | PostCard read-time (70% plum) | `components/blog/PostCard.tsx:48` | plum @0.70 / cream | 3.00 | 4.5 | F5 (as row 10). Visual change, needs owner approval | NS-33 |
| 14 | Blog index and post category eyebrow (blush) | `app/blog/page.tsx:38`; `app/blog/[slug]/page.tsx:75` | blush / plum | 3.72 to 3.77 | 4.5 | F6: `text-cream` (5.55). Visual change, needs owner approval | NS-33 |
| 15 | Post back link "חזרה לכל המאמרים" (blush) | `app/blog/[slug]/page.tsx:65` | blush / plum | 3.74 to 3.77 | 4.5 | F6 (as row 14) | NS-33 |
| 16 | Post meta row: author, date, read-time (blush) | `app/blog/[slug]/page.tsx:82` | blush / plum | 3.74 to 3.77 | 4.5 | F6 (as row 14) | NS-33 |

#### D. Watch list

| Element | file:line | fg / bg | Ratio (nominal to rendered) | Note | Fix |
|---|---|---|---|---|---|
| Post hero lead | `app/blog/[slug]/page.tsx:79` | cream 88% / plum | 4.73 to 4.56 | Margin 0.06 over AA 4.5 | F6 (solid `text-cream`, 5.55 nominal) |
| Hero sub-copy | `sections/hero/HeroContent.tsx:62` | blush / plum | 3.89 to 3.74 to 3.77 | Large only (24 to 32px, 400) | F6 optional, cream |
| About-intro lead on veil | `sections/intro/Intro.tsx:65-74` | plum / #f6e7e8 | 4.98 to 4.79 to 4.83 | Grain costs about 0.17 | None; re-measure if the veil changes |
| Expertise and Services H2 and subtitle | Expertise and Services sections (no single file:line in H) | plum / blush | 3.89 to 3.76 to 3.81 | Large only (52/30px bold; subtitle 32/24px). Correct per CLAUDE.md | None |

#### E. Text over photos

Method: pixel pass with the text hidden; the scrim is the overlay in source. **Every text-on-photo element passes.** The worst decile is 6.02:1 (CTA band H2). The Expertise pill is a mauve fill, not a photo, and is row 2 above.

| Surface | Scrim (source) | Text | Size / weight | Worst decile (P10), d / m | Req | Result |
|---|---|---|---|---|---|---|
| CTA band | `bg-black/20` over a 90% photo | H2 cream | 52 / 30px, 700 | 6.02 / 6.02 (min 5.75) | 3.0 | Pass; lowest photo text |
| Footer | `from-black/60 via-black/30 to-black/20` | Tagline H2 cream | 52 / 30px, 700 | 14.51 / 14.67 | 3.0 | Pass |
| Services StepCards | `from-black/85 via-black/45 to-black/10` | Card titles cream | 30 / 22px, 700 | 14.16 to 18.77 / 16.37 to 18.70 | 3.0 | Pass |
| Services StepCards | same | Bullets cream 90% | 16 / 14px, 400 | 13.18 to 14.95 | 4.5 | Pass |

#### F. Non-text and focus

Focus was measured with real Tab presses, diffing focused against blurred pixels. Fix F8 is keyboard focus only; the F1 focus-ring change is keyboard focus only.

| Component | file:line | Measured | Req | Fix (label) | Ticket |
|---|---|---|---|---|---|
| PostCard link (blog list, "more posts") | `components/blog/PostCard.tsx:21` | No visible focus change (diff 1.00 to 1.01). The author outline replaces the UA ring | 3.0 | F8: `focus-visible` outline in plum (5.55); keep the resting outline. Keyboard focus only | NS-10 |
| Social icon links (Facebook, Instagram, Twitter) | `sections/contact/SocialLinks.tsx`, `primitives/ui/MaskIcon.tsx:46-58` | The mask clips the UA outline: 0 changed pixels | 3.0 | F8: ring on a plain `<a>`, mask on an inner span. Keyboard focus only | NS-41 |
| WhatsApp FAB half | `components/site/ContactFAB.tsx:19` | White ring vs #25d366: 1.98 | 3.0 | F1 ring to cream (5.55). Keyboard focus only | NS-41 |

Informational: the PostCard resting outline is 1.28:1 (fixed with F8). The ContactFAB pill boundary is 1.01 to 1.15 on plum sections; the label identifies the control, so no fix is required. All other focus rings measured 3.5 or higher (lowest: the primary ButtonLink ring on blush, 3.50 to 3.81).

#### G. Link distinguishability (1.4.1)

- Running text has no inline links (`PostBody` renders no anchors), so 1.4.1 is not triggered.
- The contact phone and email rows match the plain address row above them in colour, with no underline. This is a usability note only. Optional fix F9, an underline (visual change, needs owner approval; low priority). Unassigned.
- Hover states below 4.5: FAB phone half on mauve 2.26 (F7, visual change, needs owner approval); back link hover 2.92 and contact tel/mail `hover:opacity-80` 3.65 (opacity changes; H suggests underline or weight instead). Unassigned beyond F7.

#### H. Proposed sanity contrast guard (NS-42, behaviour-neutral)

- New `tests-unit/sanity/contrast.test.tsx` and a helper. The palette is read from `@theme` in `src/app/globals.css`. Positive controls: mauve on cream 2.26 is flagged, plum on cream 5.55 passes, plum at 70% on cream 3.00 is flagged.
- Resolver for each rendered text element: size and weight from its `type-*` class (large if ≥24px, or ≥18.67px bold); colour from the nearest text utility or the tone; background from the nearest ancestor; ancestor `opacity-*` multiplies the alpha.
- Assertion over `/`, `/blog`, and each `/blog/[slug]`: 4.5 for normal text, 3.0 for large. Exceptions only through a `CONTRAST_ALLOWED` table with selector or text, reason, and measured ratio.
- Source-scan rules, with the same allow-table: no `text-mauve`; no translucent `color-mix(... transparent)` text; no `opacity-*` on an element that holds text; no `text-blush` below quote scale.
- **Allow-table seeded with today's 16 sites (90 instances)**, so the suite stays green and NS-42 changes no behaviour. Each F-fix removes its rows. H's own suggestion was an empty table, which turns the suite red until the fixes land; this review does not take that route.
- Photo surfaces: check the scrim alpha at the text position (CTA band at least 0.20; footer gradient start at least 0.60).
- Doc fidelity: add the missing blush-on-plum row (3.89, large only) to `CLAUDE.md`'s pair table, and label the 5.55 and 4.97 figures as nominal.

#### I. Board mapping

| Ticket | Scope | Approval | Notes |
|---|---|---|---|
| **NS-33** | F1, F2, F3, F5, F6, F7 (colour) | Visual change, owner approval | F4 is in the brief's range "F1–F5" but is the contract change under NS-43, so it is excluded here. F1's focus-ring part is under NS-41. |
| **NS-43** | F4: cream titles on mauve (rows 6 to 9) | Contract change, owner approval | Conflicts with sanity rule A2 in `cards-rotation.test.tsx`, which whitelists the mauve H2 and one subtitle. Change A2 in the same commit. |
| **NS-41** | F8: MaskIcon social icons; FAB focus ring | Keyboard focus only | Behaviour-neutral for pointer users. |
| **NS-10** | F8: PostCard focus | Keyboard focus only | Already on the board as VC, keyboard only. |
| **NS-42** | Contrast guard with allow-table (H) | Behaviour-neutral | Seeded with today's 16 sites. |
| Unassigned | F9: optional underline (contact rows) | Visual change, owner approval; low priority | Not in any ticket. Owner to assign. |

### 3.4 Unticketed findings (proposed additions)

Add a row per the board protocol (rule 6) if the owner wants them. None is blocking.

| Finding | Proposal | Size | Suggested placement |
|---|---|---|---|
| X1 (full) | `PageShell` renders `header` slot + `<main>` + `<footer>`; the SoftSnap selector becomes `main > section, body > footer`; update `soft-snap.test.tsx:64` and the one-screen tests | M | After NS-17 (PageShell lock) |
| A6 | Server `SiteNav` + client `MobileNavToggle` | S-M | After NS-13 |
| D6, D9 | Class for the jigsaw inline `filter:` style; inline or merge the 1.4 KB hero CSS | S | With NS-02 / NS-08 |
| T4 | Px → scale codemod plus sanity rule | M | After NS-23 |
| C3 `tone="photo"` | Photo bands on `Section`; removes `onDark`/`onPhoto`/`.on-dark` | M | Fold into NS-25 |
| X8 | iPad Simulator check of the `svh` strip at 1024 to 1366 | S | Part of the NS-37 gate |

---

## 4. Proposed target APIs

Design rules for all signatures below: closed unions only, discriminated where props depend on each other, whole class strings in lookup maps (Tailwind reads them verbatim), `className` removed or restricted to placement, no stringly escape hatches. Each block names the ticket that lands it.

### 4.1 Primitives (report D; NS-17, NS-18, NS-19, NS-25)

```ts
// BodyText: NS-18 (C1). Emits exactly one type-* class, so CLAUDE.md rule 5 cannot occur.
type TextSize = 'quote' | 'lead' | 'body' | 'small';
type BodyTextProps = Omit<React.ComponentProps<'p'>, 'className'> & {
  size: TextSize;                    // lookup: { quote: 'type-quote', lead: 'type-lead', ... }; no regex sniff
  align?: 'start' | 'center';        // default 'start' = text-start (== today's forced text-right in RTL)
  measure?: 'prose';                 // max-w-[65ch] (3 uses)
};
// D proposed "start = no class". Rejected: under a text-center parent that is not neutral (see C12).
```

```ts
// Container + FillGrid: NS-19 (C2). Replaces the hand-typed lg flex chain at 4 sites;
// sanity asserts data-fill instead of 12 class tokens.
type ContainerWidth = 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'none';   // 'xl' (1100) is adopted by ContactOffice/Social (R2)
type ContainerProps = React.ComponentProps<'div'> & {
  maxWidth?: ContainerWidth;
  gutter?: 'default' | 'wide' | 'none';
  fill?: boolean;                    // lg:flex lg:min-h-0 lg:flex-1 lg:flex-col, publishes data-fill
};

type FillGridProps = Omit<React.ComponentProps<'div'>, 'className'> & {
  rows: 1 | 2;
  cols: { base: 1 | 2; sm?: 3; md?: 2 | 3 };
  gap: 'tile' | 'card';
  floor?: 'photo-320' | 'none';      // lg:min-h-[320px] or lg:min-h-0
};
```

```ts
// Section: NS-18 (pad, labelledBy, lock-exact), NS-25 ('photo', seam removal). The best-typed primitive already.
type SectionPad = 'section' | 'tight' | 'blog' | 'band' | 'none';    // blog = clamp(48px,7vw,96px), band = clamp(80px,8vw,192px)
type SectionSurface = { tone: 'dark' | 'mid' | 'light' | 'cream' | 'photo' };   // 'photo' publishes data-bg-tone="photo" (NS-25)
type SectionHeight =
  | { fit?: undefined; center?: never }
  | { fit: 'free' | 'grow'; center?: 'column' | 'middle' }
  | { fit: 'lock' | 'lock-exact'; center?: 'column' | 'start' };    // 'lock-exact' replaces floor={false}
type SectionProps = SectionSurface & SectionHeight & {
  id?: string;
  labelledBy?: string;               // aria-labelledby: sections become labelled landmarks
  anchor?: string;                   // the only anchor mechanism; ScrollAnchor becomes private
  pad?: SectionPad;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, 'id' | 'dir' | 'className'>;
// No className: padding goes through `pad`, other styling through a wrapper. `seam` is replaced by
// CSS [data-bg-tone] + [data-bg-tone] { margin-top: -1px } (the existing TODO's own outcome; pixel check).
```

```ts
// Photo: NS-19 (sizing, radius, area, shadow), NS-30 (priority). One frame component for every photo.
type PhotoRadius = 'card' | 'card-nested' | 'tile' | 'none';        // card-nested = no safari-clip
type PhotoSizing =
  | { fit?: 'natural'; ratio?: PhotoRatio }                         // caller sizes the frame
  | { fit: 'cell'; ratio?: PhotoRatio }                             // lg: grid cell decides; replaces fillCellAtLg + w-full h-full
  | { fit: 'backdrop'; ratio?: never };                             // absolute inset-0 (CtaBand, FooterBackground)
type PhotoDelivery =
  | { engine?: 'img'; loading?: 'lazy' | 'eager'; sizes?: never; priority?: never }
  | { engine: 'next'; sizes: string; priority?: boolean; loading?: never };   // priority is new (blog cover LCP)
type ParallaxAmount = 8 | 9;                                        // 8 footer, 9 everywhere else
type PhotoMotion =
  | { motion?: undefined; children?: React.ReactNode }              // children = overlays
  | { motion: { parallax: ParallaxAmount }; children?: never }
  | { motion: { reveal: RevealStep }; children?: never };
type PhotoProps = PhotoSizing & PhotoDelivery & PhotoMotion & {
  src: string; alt: string; radius: PhotoRadius;
  area?: 'p1' | 'p2' | 'p3';                                        // replaces style={{ gridArea }}
  shadow?: 'none' | 'lg' | '2xl';                                   // merges the ExpertiseCard/StepCard shells (C8)
  objectPosition?: string; outlined?: boolean; zoom?: PhotoZoom;
};
// Never switch an existing call site between engines without a pixel diff (changes srcset and pixels).
```

```ts
// SectionHeader: NS-18 (drop subtitleClassName), NS-24 (center-md-start, VC). The margin to the next block moves to the reveal wrapper.
type HeaderAlign = 'center' | 'column' | 'start' | 'center-md-start';
type SectionHeaderProps = {
  id: string; title: React.ReactNode; subtitle: React.ReactNode;
  align: HeaderAlign;                // applied to title AND subtitle (CLAUDE.md rule 8)
  onPhoto?: boolean;
};
```

```ts
// PageShell: NS-17 (C13). One prop instead of two coupled ones; mounts the behaviours itself.
type PageShellProps = { snap?: boolean; children: React.ReactNode };
// snap ⇒ overflow-clip + <SoftSnap/>; otherwise overflow-hidden.
// Always mounts: <RevealObserver/>, <ParallaxIsland/>, <Footer/>, <ContactFAB/>.
```

```ts
// SoftSnap gate: NS-16. Keyed on input, not width.
declare function isSnapActive(env: { innerWidth: number; reducedMotion: boolean; finePointer: boolean }): boolean;
// finePointer = matchMedia('(pointer: fine)').matches; innerWidth >= 1024
type SnapMode = 'off' | 'v1' | 'v2';  // NS-36: NEXT_PUBLIC_SNAP_MODE; ?snap= honoured only if NEXT_PUBLIC_SNAP_AB=1 (Preview)
```

### 4.2 Server `Reveal`, the `RevealObserver` island and its CSS (report B; NS-13)

```ts
// src/components/motion/Reveal.tsx: SERVER component. No 'use client'. Same markup on server and client;
// never branches on useReducedMotion(), matchMedia or window.top (8fcd901).
export type RevealStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;          // delay = step × 0.12 s, via lib/motion
type RevealProps = {
  step?: RevealStep;                                        // replaces delay: number (7 magic values at 28 sites)
  as?: 'div' | 'li';
  className?: string;                                       // layout passthrough only
  children: React.ReactNode;
};
// Renders <div data-reveal="" class={className} style={{ '--reveal-delay': '.24s' }}>. The style is
// emitted only when step > 0, from a closed lookup, never an inline opacity or transform.
```

`RevealObserver` contract (`'use client'`, renders `null`, mounted once in `PageShell`):

| Rule | Detail |
|---|---|
| Do nothing (content stays visible) if | `matchMedia('(prefers-reduced-motion: reduce)').matches`; or not top-level (`window.top !== window.self`, read inside try/catch because it throws in sandboxed frames); or `IntersectionObserver` is missing |
| Observer | ONE shared `IntersectionObserver` over all `[data-reveal]`, `threshold` ladder `[0, .05, .1, .15, .2]` |
| Per-element threshold | One IO cannot hold a per-target threshold, so the callback applies the cap `min(0.2, 0.9 * innerHeight / el.offsetHeight)` (M12: framer's `amount:.2` never fires for an element taller than 5 viewports) |
| First callback batch | IO delivers one initial entry per target. Mark every target already past its cap `data-revealed` synchronously, **then** set `document.documentElement.dataset.revealArmed = ''`. Arming never happens if the callback never fires |
| Later intersections | Set `data-revealed`, then `unobserve` (once) |
| Hydration | Mutates attributes post-mount only; `<html suppressHydrationWarning>` as a belt |
| Failure modes | JS off, IO missing or not firing, iframe, slow hydration, script-blocking in-app browsers: all degrade to "visible, un-animated" |

CSS (in `globals.css`, a hot-file edit):

```css
/* Hidden state exists ONLY when: JS armed it AND the user has no reduced-motion preference. */
@media (prefers-reduced-motion: no-preference) {
  html[data-reveal-armed] [data-reveal]:not([data-revealed]) {
    opacity: 0;
    translate: 0 24px;
  }
  /* The transition lives on the REVEALED state: a transition declared on the hidden state would
     animate the arming itself (a fade-out of every below-fold element). Same curve, 0.7 s, 24 px. */
  html[data-reveal-armed] [data-reveal][data-revealed] {
    transition:
      opacity .7s cubic-bezier(.22, 1, .36, 1) var(--reveal-delay, 0s),
      translate .7s cubic-bezier(.22, 1, .36, 1) var(--reveal-delay, 0s);
  }
}
/* Belt: keeps tests/reduced-motion.spec.ts meaningful. No inline styles remain, so no !important war. */
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { opacity: 1 !important; translate: none !important; }
}
```

The transition placement is this review's refinement of report B's CSS (B put the transition on `[data-reveal]` itself). Verify it with a frame capture at arming in the NS-13 gate. Timing is otherwise identical to today (0.7 s, `cubic-bezier(.22,1,.36,1)`, 24 px). `translate` needs Safari 14.1+; older browsers simply show the content.

Tests that ship with it: unit "SSR HTML contains no inline `opacity:0` and `Reveal` renders the same markup"; the rewritten `reduced-motion-hydration.test.tsx`; the 68-line `framer-motion` mock goes with NS-15.

### 4.3 `ParallaxIsland` contract (report B; NS-15)

```ts
// ParallaxFrame becomes a SERVER component: <div class="… overflow-hidden"><div data-parallax="9" class="absolute inset-0">…</div></div>
// ParallaxIsland: 'use client', renders null, mounted in PageShell. ~0.8 to 1 KB gz.
```

| Rule | Detail |
|---|---|
| Activation | Only when `matchMedia('(min-width:1024px) and (prefers-reduced-motion: no-preference)')` matches, with a `change` listener. Below lg it exits at once: no phone cost |
| Tracking | An IO tracks which `[data-parallax]` frames are near the viewport |
| Update | One passive scroll listener plus `requestAnimationFrame`, writing `--p` (0 to 1, a full traverse: frame top at viewport bottom → frame bottom at viewport top) on those frames only |
| Pre-arming and below-lg state | `--p` unset = the drift midpoint: `translateY(0) scale(1.19)`, the mid-scroll crop today. This is a **VC** below lg: the image no longer drifts on phones |

```css
[data-parallax="9"] { --amount: 9%; --scale: 1.19; }   /* scale = 1 + (2a + 1) / 100, as ParallaxFrame.tsx:62 */
[data-parallax="8"] { --amount: 8%; --scale: 1.17; }   /* footer */
[data-parallax] {
  transform: translateY(calc((var(--p, .5) * 2 - 1) * var(--amount))) scale(var(--scale));
}
```

The sign matches `useTransform(progress, [0,1], [-a%, +a%])` in today's `ParallaxFrame.tsx:46`. Pixel parity at a fixed scroll position on lg+ is the gate. CSS `animation-timeline: view()` is reconsidered after the `overflow:clip` prerequisite (NS-38) and a Safari 26 share check (6.2).

### 4.4 `--card-h` token (report F §6.3b, C T5; NS-37)

```css
/* globals.css: the unit decision lives in ONE place. svh everywhere; lvh below lg (static, so nothing
   resizes when the iOS toolbar toggles); dvh only for the footer. Never dvh for cards. */
:root {
  --card-h: 100svh;
  --hero-h: 100svh;                       /* BN: the hero keeps svh. NS-25 (VC) later points it at --card-h. */
}
@supports (height: 100lvh) {
  @media (width < 64rem) { :root { --card-h: 100lvh; } }
}

@utility screen-fit {                     /* card height contract, replaces min-h-[100svh] max-lg:min-h-lvh */
  min-height: var(--card-h);
}
@utility screen-visible {                 /* footer: fills the VISIBLE screen at the bottom of the page */
  min-height: var(--card-h);
  @supports (height: 100dvh) { min-height: 100dvh; }
}
```

`Section` then reads `FIT_CLASS.free = 'screen-fit'`, and `lock = 'screen-fit lg:h-[max(100svh,720px)] lg:py-12'`. The lg+ heights are unchanged, so the gate is a geometry diff at 11 viewports plus a pixel diff at 1280/1440/1920. The sanity helpers (`hasMobileFill`, `isOneScreen`) assert `screen-fit` plus a CSS-text assertion on the utility body (same style as `type-scale-css`). The lvh decision still lives in one place (the token).

### 4.5 `focus-ring` utility (report C T7; NS-23)

```css
@utility focus-ring {                     /* the pair repeated at ButtonLink:43, IconButton:13, ContactFAB:15, SiteNav:34-36 */
  @apply focus-visible:outline-none focus-visible:ring-2;
}
/* Per-site ring colour stays at the call site: class="focus-ring ring-plum". */
```

---

## 5. Execution plan

Mirrors board batches 0 to 6. Ticket status is on the live board; the notes below are about **gates and rollback**.

### 5.1 Gate sizes (blast radius decides, not habit)

| Gate | Used for | What runs |
|---|---|---|
| **G0** asset or config | Images, favicon, headers, metadata, eslint/tsconfig | `tsc`, lint, `test:unit`, one build (Vercel mode); a second (export) build only if config or metadata is touched; `curl -I` after the owner deploys. No pixel sweep. |
| **G1** isolated component or test | One component or one section | Unit and sanity; scoped pixel diff of the affected routes at 375 and 1440 (or judged by eye for resampled assets) |
| **G2** shared primitive or CSS (hot files) | `globals.css`, `Section`, `PageShell`, `Photo`, `Container` | Full VR sweep from NS-04: about 66 shots (home 12 sections × 5 viewports 1280×900, 1440×900, 1920×1080, 768×1024, 375×812; blog index ×3; post ×3), about 1 min per build; plus a geometry diff where heights are touched |
| **G3** WebKit-sensitive | Anything that animates opacity or transform, or clips, or uses viewport units | iOS Simulator (iPhone SE and 17 Pro), mid-animation crops with the reveal slowed; one WebKit Playwright run at the end of the loop (Chromium cannot reproduce the Elamy clip) |
| **G4** touch behaviour | Anything that changes touch handling | Playwright touch test asserting zero site `scrollTo` calls at 390; Simulator slow 130 pt swipe; real device before any touch behaviour is re-enabled (not needed for retirement) |

Rules for all gates (board protocol and lean-gates rule): at most 2 builds per ticket, stop servers by PID, no full-site sweep for a one-file change.

### 5.2 Order of work

| Wave | Tickets (run in parallel inside a wave, mind the locks) | Why here |
|---|---|---|
| 1 | **NS-04 first** (VR harness), then NS-01, NS-02, NS-03, NS-06, NS-07, NS-16, NS-20, NS-21 | NS-04 unlocks most gates. The rest touch disjoint files. NS-07 must precede NS-29 (both edit `src/app/fonts.ts`; the board's Depends column does not encode this). |
| 2 | NS-05, NS-08, NS-09, NS-12, NS-29 | `globals.css` is a hot file: NS-05 → NS-08 → NS-12 in sequence. NS-11 has already merged, so the board's NS-08 → NS-11 → NS-12 chain is satisfied. `PageShell` is hot: NS-09 merges before NS-13 starts. |
| 3 | NS-13 → NS-14 → NS-15; NS-37 | The motion chain holds `globals.css` and `PageShell` in turn. NS-37 holds `globals.css` and `Section`, so it waits between NS-14 and the next `globals.css` owner. |
| 4 | NS-17 → NS-18 → NS-19; NS-22, NS-23, NS-34, NS-36 | NS-17 needs NS-09 and NS-13 (`PageShell` lock). `Section` serial order: NS-37 → NS-18 → NS-19 → NS-25 / NS-39. NS-15 also mounts `ParallaxIsland` in `PageShell` (HOT), a lock its Files column omits. |
| 5 | Owner decisions: NS-10, NS-24, NS-25, NS-26, NS-27, NS-28, NS-30, NS-35, NS-39, NS-33 (H in, section 3.3) | Everything marked VC or CC. Nothing here blocks waves 1 to 4. |

### 5.3 Batch 0: quick, isolated, mostly behaviour-neutral

| Ticket | Items | Gate | Depends / locks | Rollback |
|---|---|---|---|---|
| NS-01 | Favicon and apple-icon to 512/180 px | G0 + check the icon at tab size | none | One revert; assets only |
| NS-02 | Resize jigsaw, credentials art, collage-1/2, logo; add `width`/`height` | G1, by eye at 375 and 1440 (resampling differs by a few px) | none; lock `CredentialsList.tsx` | One revert; asset commit separate from the code line |
| NS-03 | Default OG image, `dynamicParams=false`, sitemap `lastmod`, JSON-LD escape | G0 + unit test on meta; Vercel and export builds | none | One revert |
| NS-04 | Commit VR harness: per-section shots, 5 viewports home, 3 blog, A/B between two builds, no committed PNGs | Run against itself = 0 px | none (new files) | One revert; no runtime code |
| NS-05 | `scroll-behavior:auto` under reduce; `motion-safe:` on hover transforms | G1: unit and sanity | `globals.css` (HOT) | One revert |
| NS-06 | Lint zero-warn, drop stale `.next/dev/types` include | `tsc` + lint | `eslint.config.mjs` lock (NS-22 depends) | One revert |
| NS-07 | `/images/*` 7 d; SWA routes; fonts out of `public/`; `compare:deploys` checks Cache-Control | G0: build + export build; `curl -I` after deploy | locks `fonts.ts` before NS-29 | One revert; header rules are config only. Both hosts' files (`next.config.ts` and `public/staticwebapp.config.json`) go in the same commit |
| NS-08 | `source(none)` + `@source "../"`; delete self-referential font tokens; dead CSS; `--color-*: initial` | G2-lite: compiled-CSS diff shows only the expected rules removed; sanity | NS-05 (lock) | One revert |
| NS-09 | Skip link, landmarks (interim), hero `aria-labelledby`, `PostCard` heading level, `MobileMenu inert` + close at md | Unit tests for the menu (focus, Esc, inert) + home 375/1440 pixel diff = 0 | NS-05 (PostCard lock); holds `PageShell` | One revert |
| NS-10 | `PostCard` focus ring | Blog 1280 focus screenshot | NS-09; **needs owner** (VC, keyboard only) | One revert |

### 5.4 Batch 1: Elamy ink box

| Ticket | Items | Gate | Depends / locks | Rollback |
|---|---|---|---|---|
| **NS-11** | `--ink-top:.72em; --ink-bottom:.62em` on `.type-display/.type-title/.type-signature`; hero patch deleted; blog `mb-*` onto a wrapper; sanity rule `ink-box-margin`. **Passed its gate: commit `206a875`** (0 px at 1440/390 on home, blog and both posts; Simulator crops clean). | G2 + G3 (done) | Merged ahead of NS-08; holds nothing now | `git revert 206a875` restores the bare box (headings clip mid-animation on WebKit again) |
| NS-12 | `.type-title` weight drift: bake 700 + tracking, or fix the doc | Sanity + home 1440 pixel diff = 0 | NS-11 (done) → unblocked; `globals.css` (HOT) | One revert |

### 5.5 Batch 2: motion

| Ticket | Items | Gate | Depends / locks | Rollback |
|---|---|---|---|---|
| NS-13 | `Reveal` + `RevealObserver` + CSS; `step` enum; 41 call sites; blog above-the-fold reveals on arming | G2 (full-site reduced-motion pixel diff, end frames = 0) + G3 (Simulator mid-animation headings) + frame capture at arming | NS-04 (needs it), NS-11 (done); `PageShell` + `globals.css` (HOT); **needs owner** (VC: blog entrance, step rounding) | One revert restores framer; safe while NS-14/15 are not merged. If they are, revert in reverse order (15, 14, 13) |
| NS-14 | `ContactFAB` as CSS keyframes | G1: frame capture of the ease vs today | NS-13; `globals.css` (HOT) | One revert |
| NS-15 | Parallax island; static midpoint below lg; remove `framer-motion`, vitest alias and mock | G2 at lg+ with scroll position fixed = 0 px; 375 by eye | NS-13, NS-14; also mounts in `PageShell` (HOT); **needs owner** (VC below lg) | One revert restores the dependency. Commit `package-lock.json` with `package.json` (the board's Files column lists only `package.json`) |

### 5.6 Batch 3: snap and card height

| Ticket | Items | Gate | Depends / locks | Rollback |
|---|---|---|---|---|
| NS-16 | Retire touch snap; `(min-width:1024px) and (pointer:fine)`; delete gentle mode, `TOUCH_SETTLE_MS`, lvh probe; no chunk on touch; no snap while the menu is open; docs and CLAUDE.md Layout bullet say "no snap on touch" | G4-lite: unit + sanity; Playwright touch test (zero `scrollTo` at 390); desktop D1 run unchanged | none; `SoftSnap.tsx`, `soft-snap.ts`, tests, `CLAUDE.md` | One revert returns to `0e72f9e` behaviour (still off below 1024), so it is safe |
| NS-36 | Desktop snap v2 + off/v1/v2 Preview A/B | F §6.5 #4: 0 backward glides in D1/D3; no glide from a single notch; snap-phase frame p95 under 20 ms | NS-16; **needs owner** (VC, desktop feel) | Env flag `NEXT_PUBLIC_SNAP_MODE=v1` or `off` needs no revert |
| NS-37 | `--card-h` token and `screen-fit`; replace the 3 spellings; footer keeps its dvh override; hero on `--hero-h` | G2 geometry diff at 11 viewports identical + pixel 1280/1440/1920 = 0; iPad Simulator check (X8) | NS-16; `globals.css` + `Section.tsx` (HOT) | One revert |
| NS-38 | iOS Simulator experiments: grain off, `clip-path` instead of the `safari-clip` mask, `overflow:clip` (check `Bio` `lg:sticky`); `?paint=lite` toggle | Measurement on iPhone SE and 17 Pro; iOS 17/18/26 for `safari-clip` | none; preview branch only | Nothing merges. Any kept change becomes its own ticket |
| NS-39 | Phone cards content-height (hero, credentials, CTA band, footer stay one screen) | Simulator + VR 375/390 | NS-37; **needs owner** (CC) | One revert |

### 5.7 Batch 4: components and tests (behaviour-neutral)

| Ticket | Items | Gate | Depends / locks | Rollback |
|---|---|---|---|---|
| NS-17 | Mechanical, DOM-identical cleanup; `PageShell snap`; icons into one file; `Section anchor=` | G1: sanity + home 375/1440 pixel diff = 0 | NS-09, NS-13 (`PageShell`) | One revert |
| NS-18 | `BodyText size`, delete `Grid`, `Section` pad tokens + `labelledBy`, `content/images.ts` + image-exists test | G2-lite: sanity + pixel diff home + blog at 375/1440 = 0 | NS-17; `Section.tsx` (HOT) | One revert |
| NS-19 | `Container fill` + `FillGrid`; `Photo` unions; card shells via `Photo`; blog extraction; helpers read `data-fit`/`data-fill` | **G2 full sweep** (5 viewports home + 3 blog) = 0 | NS-04, NS-18 | One revert (split into primitives / sections / blog commits so a revert is partial) |
| NS-20 | Delete the 14 legacy files; prune 3 Playwright specs | `npm run test:unit` green; Playwright smoke | none | One revert |
| NS-21 | Blog index and post render tests, SEO plumbing, MobileMenu behaviour | `test:unit` | none | One revert |
| NS-22 | ESLint `no-restricted-imports` mirroring `component-layers`; README wording | lint | NS-06 | One revert |
| NS-23 | Opacity modifiers, derived tokens, `--container-prose`, `focus-ring`, `bg-linear-to-t` | Compiled-CSS diff + blog/home 375/1440 pixel diff = 0 (one screenshot confirms the oklab tint) | NS-12; `globals.css` (HOT) | One revert |

### 5.8 Batch 5: owner decisions and visual changes

| Ticket | Items | Gate | Depends / locks | Rollback |
|---|---|---|---|---|
| NS-24 | Services title/subtitle alignment below md | VR 375, verified first | NS-04; **needs owner** | One revert |
| NS-25 | Hero on `Section` and `--card-h` (taller on phones) | iOS Simulator | NS-37; **needs owner** | One revert |
| NS-26 | Hero first paint | iOS Simulator + LCP | NS-11 (done); **needs owner** | One revert |
| NS-27 | Archive `reference/` and `design_handoff_hero_05b/` | none | **needs owner** | `git revert` restores the files |
| NS-28 | Map facade | Owner review | **needs owner** | One revert |

### 5.9 Batch 6: performance, images, fonts, contrast

| Ticket | Items | Gate | Depends / locks | Rollback |
|---|---|---|---|---|
| NS-29 | 3 font preloads; `fetchpriority` on the logo | Slow-4G font timing + CLS; sanity font tests | NS-07 (`fonts.ts` lock); `BrandLogo.tsx` | One revert |
| NS-30 | AVIF path; `Photo priority`; `<picture>` for the static export | Pixel diff (lossy) + Safari clip check | NS-19 (`Photo` lock); **needs owner** (VC) | One revert; keep asset generation in a separate commit |
| NS-31 | Dropped (grain tile) | n/a | n/a | n/a |
| NS-32 | Dropped (`content-visibility`) | n/a | n/a | n/a |
| NS-33 | Colour fixes F1, F2, F3, F5, F6, F7 (section 3.3); F4 is NS-43, the guard is NS-42 | VR + ratio table | H in (section 3.3); **needs owner** (VC) | One revert |
| NS-34 | `prefetch={false}` | Unit + network check | NS-09 (`MobileMenu` lock), NS-29 (`BrandLogo` lock) | One revert |
| NS-35 | Metric-matched Hebrew fallback for Stanga | CLS on slow 4G | NS-29; **needs owner** (CC) | One revert |

**Dependency summary.** Critical path: NS-04 → NS-13 → NS-14 → NS-15. Independent tracks: assets and config (NS-01, 02, 03, 06, 07), touch snap (NS-16 → NS-36, NS-37), tests (NS-20, NS-21). Reverting a ticket means reverting every ticket that depends on it first, newest first.

---

## 6. Architect decisions (answers to `docs/stability-perf-plan-2026-10.md` §6)

### 6.1 Reveal technology (plan §6.1)

**Decision: CSS plus ONE shared IntersectionObserver.** Tickets NS-13 and NS-14.

- A server `Reveal` component; content is visible by default.
- The hidden state exists only under `html[data-reveal-armed]` AND `prefers-reduced-motion: no-preference`. It is armed after IO's first callback, and only when top-level.
- framer-motion is removed from the bundle entirely. The `LazyMotion` stop-gap is skipped: it saves only about 19 KB gz and still ships SSR `opacity:0`.
- CSS `animation-timeline: view()` is rejected for reveal: it scrubs and reverses, has no iOS 17/18 or Firefox support, and dies inside `overflow:hidden` ancestors.
- Specification: 4.2.

### 6.2 Parallax (plan §6.2)

**Decision: a ~1 KB vanilla island on lg+ only.** Below lg, a static midpoint crop (a visual change, owner approval). CSS `view()` parallax is reconsidered later, after the `overflow:clip` prerequisite (NS-38) and the Safari 26 share. NS-15 then removes the framer-motion dependency. Specification: 4.3.

### 6.3 Ink box (plan §6.3)

**Decision: option (a).**

- `--ink-top:.72em; --ink-bottom:.62em` padding plus a compensating negative margin on `.type-display`, `.type-title` and `.type-signature` in `globals.css`, with margins moved to wrappers and a sanity rule.
- The values come from measured Elamy glyph ink (ץ +1.516em, ך −0.80em).
- Rejected: font-metric overrides (they move the baseline 3 to 10 px) and `SectionTitle`-only (it misses display and signature).
- Removing the reveal layer alone does not fix it: any opacity or transform animation, including the CSS `.hero-enter` and a CSS reveal transition, creates the same layer.
- Shipped as NS-11 / `206a875`.

### 6.4 Mobile snap (plan §6.4)

**Decision: retired permanently on touch.** Gate: `(min-width:1024px) and (pointer:fine)`, which also fixes iPads at ≥1024 that run desktop rules (NS-16).

- Native CSS snap is not a touch fallback: proximity and mandatory both pulled a slow 130 px drag back to y=0.
- Desktop snap gets a v2 (direction-aware, gesture-armed) behind an off/v1/v2 Preview A/B, and the owner picks (NS-36).
- Height model: one `--card-h` token (NS-37). Content-height cards on phones are offered as a contract change (NS-39).

### 6.5 Batching and gates (plan §6.5)

**Decision: the board protocol.**

- Claim a ticket before work, only if it is `todo` and its Depends are `done`.
- File locks: two `in-progress` tickets never touch the same file. The hot files are `globals.css`, `PageShell` and `Section`; one ticket holds each at a time.
- Executors work in their own `git worktree` off local `main`. No stash, checkout, reset or clean in the shared tree.
- One `merging` ticket at a time. Commit each validated ticket; set it to `done` with the commit hash.
- No pushes without the owner.
- Gates are sized to blast radius (5.1). Full-site sweeps only for shared primitives and CSS.
- At most 2 builds per ticket; stop servers by PID.

### 6.6 Superseded or reordered (plan §6.6)

- **Dropped**
  - The grain PNG tile (NS-31): 62 to 481 KB, no faster; the grain LCP is a metric artefact.
  - `content-visibility` (NS-32): under 50 ms saving, breaks SoftSnap and Safari anchoring, clips Elamy ink.
  - `fetchpriority` as the blog-LCP fix: the cover sits inside a reveal; NS-13 fixes it.
- **Reordered:** commit the VR harness (NS-04) first, because most gates depend on it.

### 6.7 Tailwind

- Keep the `.type-*` scale as plain classes in `@layer components`.
- Don't convert it to `@utility` (it doesn't remove the rule-5 hazard) or to `--text-*` tokens.
- Skip container queries.
- Defer the rem-vs-px question (T13).

Reasoning, from report C:

- `@utility type-*` lands in the utilities layer ordered alphabetically, so `type-lead` would beat `type-body`. It replaces "later in file wins" with "alphabetically later wins". The real guard stays `type-usage.test` (one `type-*` per element), and the new `BodyText size` prop (4.1) removes the sniffing.
- `--text-*` tokens emit no `font-family`, so one `type-*` class would no longer set the whole style, and the `type-usage`, `page-integrity` and `type-scale-css` suites would need a rewrite.
- Container queries add containment (a containing block for fixed and absolute descendants) that interacts with reveal transforms, `safari-clip` masks and the grid stretch chain, for one plausible win (`Card` padding).
- T13 (px → rem, pixel-identical at the default 16 px) only affects users who changed their browser font size. It is a decision, not a fix.

---

## 7. "Do not do" list

Merged and deduplicated from reports A to G and the two peer reports.

### Design contract

- Do not remove `[data-bg-tone]` rules or move them out of `@layer components`: utilities (`text-cream`, `bg-*`) must keep overriding tone colour, and `Section`, `Card` and the grain pseudo rely on that.
- Do not convert `.type-*` to `--text-*` tokens: there is no `font-family`, which breaks the one-class contract.
- Do not assume `@utility type-*` fixes rule 5: two `type-*` classes on one element still collide, with an alphabetical winner.
- Do not drop the call-site `font-bold` / `tracking-[-0.01em]` unless `.type-title` is re-baked to 700 in the same commit.
- Do not move `@theme static` / `--surface-veil` without the matching sanity test changes (`type-scale-css` has 2 tests, plus `isSurfaceBg`).
- Do not put `--color-white` back to `#fff` or use `bg-white` / `text-white`: cream is the brand surface and the sanity rule `white-utility` fails on it.
- Do not use the arbitrary `clamp()` text-size form (it silently fails) or add colours beyond the 4 palette values plus the documented WhatsApp and black-scrim exceptions. New mixes must be derived tokens.
- Do not remove `html{font-size:16px}` or switch to rem partially: rem-based spacing assumes the pinned 16 px.
- Do not change the grain `::before` `z-index:-1` / `isolation:isolate` or the unlayered tail (hero animations, reduced-motion block): unlayered rules beat every layer, and moving them into a layer would let utilities override them.
- Do not mass-replace `[Npx]` without a sanity update: `ui-primitives.test.tsx:152,165,224` pin `w-[44px] h-[44px]`.
- Do not mass-replace `left` / `right` / `text-right` with logical classes: `ContactFAB left-4` is intentionally bottom-left in RTL. `text-right` → `text-start` and `border-r/pr` → `border-s/ps` are safe only case by case.
- Do not put margin utilities on Elamy-class elements (the negative margin cancels the ink padding); do not use `ascent-override` / `descent-override` to "fix" ink (the baseline moves 3 to 10 px and Safari support is doubtful).
- Do not remove `overflow-hidden` from `Section` except as `overflow-clip` with a pixel diff.
- Do not change `adjustFontFallback:false`, `next/font/local`-only, or the import order in `fonts.ts` without flagging the CLAUDE.md contract. Do not preload fewer than the three above-the-fold faces.
- Do not exclude `src/content/*.ts` or `src/app/blog/**` from the Tailwind `@source` (they carry class strings); `@source "../"` covers all of `src`.
- Do not use container queries or fix the duplicate `.font-latin` definition: no gain, real risk.
- Do not replace the grain with a PNG tile expecting a gain (481 KB at DPR 3, same raster time), and do not remove it on Chromium evidence alone.

### Contrast and focus (report H)

- Do not add a colour to fix contrast: no lighter or darker mauve, no `#5a3f58`, no black label on the WhatsApp half. Plum, cream, blush, mauve and the veil cover every pair.
- Do not fix low contrast by making body copy bold (CLAUDE.md typography rule 1). Change the surface or the colour pair.
- Do not fix translucent text by raising the percentage: 92% still fails on #fae8e6 (4.24). Use solid `text-plum`.
- Do not use `text-mauve` for any text. Do not put cream or plum text on mauve at any size (2.26 and 2.46, below even the 3.0 large threshold).
- Do not put small blush text on plum (3.89, large only), and do not shrink the hero blush quote below `type-quote`.
- Do not use `opacity-*` on an element that holds text (the ExpertiseCard pill). Use a solid colour.
- Do not treat a nominal ratio as final where the grain applies. Render costs up to 0.29. Keep a 0.3 margin or re-measure.
- Do not rely on axe alone for contrast. It misses alpha-text cases and reports 18 to 67 incomplete nodes per page.
- Do not change the WhatsApp brand green itself (owner ruling). Change what sits on it.
- Do not "solve" the mid-tone titles with `text-shadow`, `drop-shadow` or a darker stroke. The pair does not change, and a ratio check still fails.
- Do not replace the PostCard outline with `outline-none`, put `mask-image` on a focusable element, or weaken the UA focus ring where no replacement exists.

### iOS and viewport

- Do not use `100dvh` on cards (it resizes every card on every toolbar frame and shifts content above the reader), unprefixed `lvh`, or `100vh`. Keep the `svh` base plus `max-lg:min-h-lvh` (in `--card-h` after NS-37). The footer's `supports-[height:100dvh]:min-h-dvh` stays.
- Do not gate `min-h-[100svh]` behind `lg:` (CLAUDE.md), and do not "fix" the hero to `lvh` without looking at the first-view toolbar-expanded state (NS-25 is an owner decision).
- Superseded 2026-10-09 by NS-37/NS-39 (see CLAUDE.md Layout): the two bullets above predate `--card-h`/`screen-fit` and the content-height phone cards.
- Do not change the lg+ heights (`lg:h-[max(100svh,720px)]`, `lg:min-h-[max(100svh,720px)]`, Expertise `floor={false}`) without the three-size pixel parity check.
- Do not re-enable touch snap in any form (JS `scrollTo`, or CSS `proximity` / `mandatory`).
- Do not replace SoftSnap with CSS `scroll-snap`, and do not add `scroll-snap-type` without deliberately updating the sanity ban (`tests-unit/sanity/soft-snap.test.tsx`).
- Do not make `<main>` or `<body>` `overflow:hidden` or a scroll container (breaks snap, sticky and the toolbar collapse); `PageShell` `overflow="clip"` on home stays.
- Do not add `transform`, `will-change` or `filter` to ancestors of `position:fixed` elements (the reason `MobileMenu` is portaled).
- Do not add `viewport-fit=cover` without handling landscape insets.
- Do not add `content-visibility:auto` to sections: SoftSnap geometry, no Safari scroll anchoring, anchor jumps, paint containment clips Elamy ink; the gain is under 50 ms.
- Do not break anchor navigation: `html{scroll-behavior:smooth}` and `ScrollAnchor` rely on it, and SoftSnap overrides it inline only during a glide and must restore it.
- Do not touch the 28 `safari-clip` masks or the Section overflow on Chromium evidence: they exist for a real Safari bug. Experiment in the Simulator first (NS-38).

### SSR and motion

- Do not branch render on `useReducedMotion()`, `matchMedia` or `window.top`: hydration mismatch and SSR `opacity:0` (8fcd901, dfec2c0).
- Do not put `opacity:0` or `translate` in server HTML or base CSS. The hidden state exists only under a JS-set attribute AND `prefers-reduced-motion: no-preference`, armed after the first IO callback.
- Do not gate the hero or any above-the-fold content on IO or JS, and do not wrap the hero in a reveal (LCP; 7b9da58). Do not use async `LazyMotion` features for above-the-fold reveals.
- Do not use `animation-timeline` unguarded or inside `overflow:hidden` ancestors; always `@supports`, default state visible.
- Do not use `next/dynamic` to defer `ScrollReveal` or `ContactFAB` (deferral lengthens invisible content), and do not lazy-load the hero logo, the LCP assets or the font preloads (the hero must not gate on JS).
- Do not drop the reduced-motion paths: the `isSnapActive` gate, the `[data-reveal]` / `[data-parallax]` CSS forcing, `scroll-behavior:auto`.
- Do not "fix" `will-change` (measured 0 in Chromium; there is nothing to remove).
- Do not add `fetchpriority="high"` to the blog cover as the fix; the delay is the JS-gated reveal.
- Do not touch SoftSnap as part of motion or perf work; NS-16 and NS-36 own it.

### SEO and static export

- Do not propose a nonce-based strict CSP: `script-src 'self' 'unsafe-inline'` exists because Next's inline flight scripts need it, and a nonce would force dynamic rendering. Do not weaken it for analytics, and keep `frame-ancestors 'none'`.
- Do not hide content with `display:none` or client-only rendering (SEO), and keep JSON-LD server-rendered. Do not move the site-graph JSON-LD to home only without an owner call.
- Do not enable Cache Components, PPR or the React Compiler (migration risk to the export path, no benefit).
- Do not add a header or redirect in only one place: `output:'export'` ignores `headers()` and `redirects()`, so every rule must also go in `public/staticwebapp.config.json`.
- Do not add extensionless generated files (SWA serves them as `application/octet-stream`); metadata routes need `dynamic='force-static'`.
- Do not switch `Photo` engine call sites to `next/image` without a pixel diff and a plan for the `unoptimized` static export (`next/image` gives nothing on Azure).
- Do not add `productionBrowserSourceMaps` or `removeConsole`, and do not add a custom `browserslist` to drop the 112 KB polyfill (it is `noModule`; output is already ES2020+).
- Do not `React.lazy` sections (everything is server-rendered; nothing client-side to defer).
- Do not add a `preconnect` to `maps.google.com`: it wastes a connection for visitors who never scroll to the map.

### Caching

- Do not set `immutable` on unhashed `/public` files (`/images/*`, `/icon.png`, `/apple-icon.png`, `/opengraph-image.png`, `/robots.txt`, `/sitemap.xml`, `/fonts/*`). The existing SWA `/fonts/*` rule is already that mistake; do not copy it to other classes.
- Do not set `s-maxage` or a long `stale-while-revalidate` on HTML (Vercel already caches the prerender and purges on deploy).
- Do not use `?v=hash` query versioning for `next/image` sources (`localPatterns.search` is `""`), and do not change `Photo` engine to change caching.
- Do not widen `frame-src` or `img-src` for a map image CDN without need.

### Tests

- Do not rely on Chromium-only Playwright to validate WebKit layer clipping, iOS toolbar units, momentum scroll or any WebKit paint change. CI runs Chromium only; use the iOS Simulator and a WebKit run.
- Do not commit PNG baselines (macOS vs Linux antialiasing drift); the harness compares two builds.
- Do not read the Lighthouse home LCP (2.9 / 5.85 s) as a rendering cost: it is the 30 px² grain candidate.
- Do not delete `reduced-motion-hydration` outright when framer goes: it is a real hydration guard. Rewrite it into "SSR HTML has no inline `opacity:0`" and move its source greps into `source-scan`.
- Do not pin Netta's copy in tests (`text-content` and `EXPECTED_SECTIONS` headings go red on a pure copy edit).
- Do not run a full-site pixel sweep per commit, more than 2 builds per ticket, or a Playwright run inside a fixer loop; sweeps are for shared primitives and CSS only.

---

## Appendix: limits of this review

- **Report H (contrast)** is summarised in section 3.3. Its limits: production `0e72f9e` at 375 and 1440 only (no tablet widths 768 or 1024); hover and active states from computed values, not rendered; the cross-origin map iframe and the parked testimonials were not measured. Axe reports 18 to 67 incomplete nodes per page, so the pixel pass is the measurement of record.
- Not measured anywhere: real iOS Safari or WKWebView behaviour (layers, blend groups, mask repaint, momentum, favicon fetch), WebKit paint cost of the grain and the 28 masks, a real GPU raster, glyph-level font subsetting, DPR 2 as an actual load. Touch decisions rest on the peer's iPhone 17 Pro Simulator repro (iOS 26.2) plus Chromium mobile emulation.
- The peer Simulator repro could not use a real WKWebView host, so in-app-browser-specific causes of the "stuck" page are ruled neither in nor out. Retiring touch snap makes the question moot.
- Most runtime numbers are N=1 per scenario (the home mobile scroll is N=2). The Lighthouse runs show large variance (home LCP 2.92 vs 5.85 s back to back).
- Sprint-board statuses in this file are as of the snapshot. The live board is the source of truth.
