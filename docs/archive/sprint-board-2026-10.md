> **Superseded by the live kanban (https://claude.ai/artifact/GV4NpXrzjzc4wQ1XgBthwt), 2026-10-09.** Archived snapshot, kept for git history.

# Sprint board: architecture, stability and performance (2026-10)

> **Source of truth: the live kanban at https://claude.ai/artifact/GV4NpXrzjzc4wQ1XgBthwt** (private to the owner). Its tickets live in the artifact's database, collection `tickets`, with one document per id (`NS-01` …). Sessions read and update them with the `ArtifactData` tool, using pinned `update` writes with `if_version`, not by editing this file. Fields: `status` (needs-owner | blocked | todo | in-progress | review | merging | done | dropped), `owner` (ARCH | VIS | ""), `note`, `commit`, `files` (lock list), `depends`, `kind` (BN | VC | contract | n/a).
>
> This file is a **snapshot from 2026-10-09** kept for git history. It may lag the live board. The protocol below still applies; read "edit your row" as "update the ticket document".

The single shared ticket list for every session and subagent working on the site. If a piece of work isn't on this board, nobody does it.

- **Sessions:**
  - **ARCH** is the "architecture review" session; its findings are in `docs/archive/architecture-review-2026-10.md`.
  - **VIS** is the "Netashemesh site visual improvements" session; its plan is in `docs/stability-perf-plan-2026-10.md`.
- **Source findings:** the audit reports in each session's scratchpad. Finding ids (A*, M*, X*, C*, R*, Q*, L*, T*, D*, E1) refer to them, and the review doc will consolidate them.
- **Owner:** Shlomi. Any item marked **VC** (visual change) needs the owner's approval before it merges. Pushes to `main` always need the owner's approval.

## Protocol (read before claiming a ticket)

1. **Claim before work.** Set `Owner session` and `Status: in-progress`, then edit this file with a small `Edit` on your own row only, never a whole-file `Write`. Only claim tickets that are `todo` and whose `Depends` tickets are `done`.
2. **File locks.** Two `in-progress` tickets must never touch the same file. The `Files` column is the lock list.
   - `src/app/globals.css`, `PageShell.tsx` and `Section.tsx` are **hot files**, so only one ticket may hold each of them at a time.
   - If a ticket you need is blocked by a lock, wait for it or message the holder. Don't work around it.
3. **Isolation.** Executors work in their own `git worktree` off the current local `main`. Never stash, checkout, reset or clean in the shared tree.
4. **Merging.**
   - Commit each validated ticket in its worktree.
   - Before fast-forwarding local `main`, set the ticket to `merging`. There may be only one `merging` ticket on the board at a time.
   - After merging, set the ticket to `done` and add the commit hash.
   - Do not push. Pushes go to the owner.
5. **Gates.** Size each gate to the ticket's blast radius (see the Gate column). Run a full-site pixel sweep only for shared primitives and CSS. Use at most 2 builds per ticket, and stop servers by PID.
6. **New work.** Add a row with the next free id. Cite the finding ids it comes from. Before adding, search the board for overlaps; if one exists, extend that ticket instead.
7. **Statuses:**
   - `todo`, `blocked (reason)`, `in-progress`, `review`, `merging`, `done`, `dropped (reason)`.
   - `needs-owner` means it is waiting on an owner decision.

## Board

### Batch 0: quick, isolated, mostly behaviour-neutral (can run in parallel; mind the file locks)

| ID | Title | Findings | Files (lock) | Gate | BN / VC | Depends | Owner session | Status |
|---|---|---|---|---|---|---|---|---|
| NS-01 | Resize favicon/apple-icon from 2000² (354 KB each) to 512/180 px | A2, D2, VIS-B | `src/app/icon.png`, `src/app/apple-icon.png` | build + check the icon renders at tab size | BN | – | – | todo |
| NS-02 | Resize jigsaw-puzzle-6/7.webp (2000×1500 shown at 96 px; 6.9× over-download at DPR 3) to about 288×216 and add `width`/`height` (removes the CLS 0.065 on slow 4G); also resize about-credentials-art, about-collage-1/2 and the logo | A3, P5, P-IMG2 | `public/images/jigsaw-*`, `about-credentials-art.webp`, `about-collage-1/2.webp`, `logo-horizontal-light.webp`, `CredentialsList.tsx` | Credentials, Intro and header at 375/1440, judged by eye (resampling can differ by a few px) | BN (by eye) | – | – | todo |
| NS-03 | SEO hygiene: `/blog` og:image, `dynamicParams=false`, sitemap lastmod from content, JSON-LD `<` escape | A4, A5 | `src/lib/seo/metadata.ts`, `src/app/blog/[slug]/page.tsx` (config line only), `src/app/sitemap.ts`, `JsonLd.tsx` | build + unit test on meta; normal build plus export build | BN | – | – | todo |
| NS-04 | Commit the visual-regression harness (A/B between two builds; per-section shots; 5 viewports home, 3 blog) | Q6 | `tests/visual/**`, `package.json` (script only) | run once against itself = 0 px | n/a | – | – | todo |
| NS-05 | Reduced-motion gaps: `scroll-behavior:auto` under reduce; `motion-safe:` on hover/active transforms | M7, M8 | `src/app/globals.css` (HOT), `ButtonLink.tsx`, `PostCard.tsx`, `Photo.tsx`, `ContactFAB.tsx` | unit + sanity | BN (except for reduce-motion users) | – | – | todo |
| NS-06 | Lint zero-warn (scoped disables at intentional `<img>`) + `--max-warnings 0`; drop stale `.next/dev/types` include | A7b, A9 | `eslint.config.mjs`, `tsconfig.json`, `BrandLogo.tsx`, `AuthorCard.tsx`, `Bio.tsx` (comment lines only) | lint + tsc | BN | – | – | todo |
| NS-07 | Caching: `/images/*` 7 d + swr; SWA `/_next/static/*` immutable; remove SWA `/fonts/*` immutable; move font sources out of `public/`; `compare:deploys` checks Cache-Control | D1, D3, D4, D11 | `next.config.ts`, `public/staticwebapp.config.json`, `scripts/compare-deploys.sh`, `src/app/fonts.ts`, `public/fonts/` | build + export build; `curl -I` after the owner deploys | BN | – | – | todo |
| NS-08 | Tailwind hygiene: `source(none)` + `@source "../"`; delete self-referencing font tokens; dead CSS bits; palette guard `--color-*: initial` | T1, T2, T9, T10 | `src/app/globals.css` (HOT) | compiled-CSS diff shows only the expected rules removed; sanity suite | BN | NS-05 (lock) | – | todo |
| NS-09 | Accessibility quick wins: skip link + `id=main`; footer/header landmark roles (interim); hero `aria-labelledby`; PostCard heading level; MobileMenu `inert` + close at md | X1 (interim), X2, X3, X5, X6 | `PageShell.tsx` (HOT), `Footer.tsx`, `BlogHeader.tsx`, `Hero.tsx`, `HeroArt.tsx`, `PostCard.tsx`, `MobileMenu.tsx`, `SiteNav.tsx` | unit tests for the menu (focus, Esc, inert) + home 375/1440 pixel diff = 0 | BN | NS-05 (PostCard lock) | – | todo |
| NS-10 | PostCard keyboard focus ring (`focus-visible` outline) | X4 | `PostCard.tsx` | blog 1280 focus screenshot | **VC** (keyboard focus only) | NS-09 | – | needs-owner |

### Batch 1: Elamy ink box (clipped headings mid-animation)

| ID | Title | Findings | Files (lock) | Gate | BN / VC | Depends | Owner session | Status |
|---|---|---|---|---|---|---|---|---|
| NS-11 | Shared ink box on `.type-display/.type-title/.type-signature`: `--ink-top:.72em; --ink-bottom:.62em`, padding + compensating negative margin; delete the hero per-element patch; move the blog `SectionTitle mb-*` onto a wrapper; sanity rule "no `m*` utility on Elamy-class elements"; fix the stale comments. Supersedes prototype b5dfce8 (.3/.35em is too small). | E1, VIS-A H2 | `src/app/globals.css` (HOT), `HeroHeading`/hero files, `src/app/blog/[slug]/page.tsx`, `tests-unit/sanity/*` | iOS Simulator with the reveal slowed: crop the CTA band, Services, Gallery and hero titles mid-animation; pixel diff home 1440/390 + both blog routes = 0; recheck the `layout-fit` and `track-c` specs | BN at rest | NS-08 (lock) | VIS (has the prototype + iOS harness) | todo |
| NS-12 | Contract drift: `.type-title` weight (CSS 400 + `font-bold` at the call site vs CLAUDE.md 700). Bake 700 + tracking into the class, or fix the doc. | C9, T6 | `src/app/globals.css` (HOT), `SectionTitle.tsx`, `CLAUDE.md`, `type-scale-css.test.ts` | sanity + home 1440 pixel diff = 0 | BN | NS-11 (lock) | – | todo |

### Batch 2: motion (remove framer-motion, about −37 KB gz on every route)

| ID | Title | Findings | Files (lock) | Gate | BN / VC | Depends | Owner session | Status |
|---|---|---|---|---|---|---|---|---|
| NS-13 | Server `Reveal` + one `RevealObserver` island + CSS (hidden only under `html[data-reveal-armed]` and `no-preference`, armed after the first IO callback, threshold cap). Keep the 41 call sites; switch `delay` to a `step` enum. Blog above-the-fold elements reveal on arming. Unit test: "SSR HTML has no inline opacity:0". | M1, M2, M12, C5, A1 | `motion/ScrollReveal.tsx` → `Reveal.tsx`, `PageShell.tsx` (HOT), `src/app/globals.css` (HOT), the 16 call-site files, `tests-unit/reduced-motion-hydration.test.tsx` | full-site reduced-motion pixel diff (end frames) = 0; iOS Simulator mid-animation heading check; sanity | BN at rest. **VC**: blog above-the-fold entrance removed; step rounding 0.1→0.12 s | NS-04, NS-11 | ARCH | needs-owner |
| NS-14 | ContactFAB entrance as CSS keyframes (`.hero-enter` pattern) | M5 | `ContactFAB.tsx`, `src/app/globals.css` (HOT) | frame capture of the ease vs today | BN if the ease matches | NS-13 | ARCH | todo |
| NS-15 | Parallax: about 1 KB vanilla island on lg+ (IO + rAF writes `--p`); below lg a static midpoint crop; then remove the `framer-motion` dependency, the vitest alias and the mock | M6, M3, D5 | `ParallaxFrame.tsx`, `Photo.tsx`, `package.json`, `vitest.config.ts`, `tests-unit/__mocks__/framer-motion.tsx` | pixel diff at lg+ = 0 (scroll position fixed); 375 by eye | **VC** below lg (no parallax on phones) | NS-13, NS-14 | ARCH | needs-owner |

### Batch 3: scroll snap and card height

The snap/height audit has landed (ARCH report F). Decisions:
- **Touch snap is retired for good.** Both JS snap and native CSS `proximity`/`mandatory` pull a short drag back to the hero.
- **Desktop snap stays, but needs a redesign.** It isn't slow: it pulls *backward* after 50% of the gestures it triggers on (mean 122 px, up to 229 px in WebKit).
- **Heights:** keep the svh/lvh/dvh units, but define them once.

| ID | Title | Findings | Files (lock) | Gate | BN / VC | Depends | Owner session | Status |
|---|---|---|---|---|---|---|---|---|
| NS-16 | Retire touch snap permanently: gate on `(min-width:1024px) and (pointer:fine)` (fixes iPads at ≥1024 running desktop rules); delete gentle mode, `TOUCH_SETTLE_MS`, the lvh probe and the `largeViewportHeight` input; don't load the SoftSnap chunk on touch; guard against snapping while the menu is open; tests and docs say "no snap on touch" (CLAUDE.md Layout bullet) | F S5, M11, S2 (motion audit), D8 | `SoftSnap.tsx`, `src/lib/soft-snap.ts`, `tests-unit/soft-snap*.ts*`, `tests-unit/sanity/soft-snap.test.tsx`, `CLAUDE.md` | unit + sanity; Playwright touch test: zero site `scrollTo` calls at 390; desktop D1 run unchanged | BN vs production (0e72f9e already has it off below 1024) | – | VIS | todo |
| NS-36 | Desktop snap v2: direction-aware (never backward unless within about 8% vh), armed by a gesture ≥ 0.15 vh (single wheel notches do nothing), threshold 0.2 vh, settle 180–220 ms, glide about 380 ms. Add an A/B toggle (`NEXT_PUBLIC_SNAP_MODE` off/v1/v2 + `?snap=` honoured only when `NEXT_PUBLIC_SNAP_AB=1` in Preview) so the owner can feel off / v1 / v2 on a preview deploy | F S1–S4 | `src/lib/soft-snap.ts`, `SoftSnap.tsx`, tests | F acceptance §6.5 #4: 0 backward glides in D1/D3, no glide from a single notch, snap-phase frame p95 < 20 ms | **VC** (desktop feel); the owner picks off/v1/v2 | NS-16 | ARCH | needs-owner |
| NS-37 | Card-height token (model b): `--card-h` (svh at all widths, lvh below lg, `@supports`) defined once; `fit` cards and the lock/grow heights consume it; replace the 3 spellings (Section, Hero, Footer) with it. The footer keeps its dvh override. | F §6.3b, T5, X7 | `src/app/globals.css` (HOT), `Section.tsx` (HOT), `Footer.tsx`, `tests-unit/sanity/helpers.ts` (`hasMobileFill`, `isOneScreen`) | geometry diff at 11 viewports = identical + pixel diff 1280/1440/1920 = 0 | BN | NS-16 | – | todo |
| NS-38 | WebKit paint experiments in the iOS Simulator, measure first: (1) grain `::before` off; (2) `safari-clip` mask replaced by `clip-path: inset(0 round …)`; (3) Section `overflow:hidden` → `overflow:clip` (check `Bio` `lg:sticky`). Add a `?paint=lite` preview toggle. Keep only what shows a difference. | F S7, S8, M9/M10 | experiment only (preview branch); follow-up tickets for any change that is kept | iOS Simulator scroll smoothness A/B on iPhone SE and 17 Pro; iOS 17/18/26 for safari-clip | measurement; any change kept = BN if pixel-identical, else **VC** | – | VIS (iOS harness) | todo |
| NS-39 | Phones: cards content-height below lg (model c); only the hero, credentials, CTA band and footer stay one screen. On phones most cards are already 1.6–3.4 screens tall; only 5/11 are one screen at 390×844 and 1/12 in landscape. | F S6, §6.3c | `Section.tsx` (HOT), `src/app/globals.css` (HOT), sanity `one-screen` tests, CLAUDE.md Layout | iOS Simulator + VR 375/390 | **contract change** | NS-37 | – | needs-owner |

### Batch 4: components and tests (behaviour-neutral refactor)

| ID | Title | Findings | Files (lock) | Gate | BN / VC | Depends | Owner session | Status |
|---|---|---|---|---|---|---|---|---|
| NS-17 | Mechanical, DOM-identical cleanup: drop single-child fragments, un-export unused symbols, merge the 4 icons into `site/icons.tsx`, `Section anchor=` everywhere, `SiteNav crossRoute`, `PageShell snap` prop, delete `extraStyle`, `RichText` helper | C11, R1, C12, C7, C13, C10, R3, R4 | sections/*, `site/icons/*`, `SiteNav.tsx`, `PageShell.tsx` (HOT), `content/home/contact.ts`, `content/types.ts` | sanity + home 375/1440 pixel diff = 0 | BN | NS-09, NS-13 (PageShell lock) | ARCH | todo |
| NS-18 | API tightening: `BodyText size` required (no className sniff), delete `Grid`, Section blog pad tokens + `labelledBy`, `content/images.ts` + an image-exists test | C1, C6, C3 (minus Hero/seam), R2 | primitives/ui/BodyText, layout/Grid, layout/Section (HOT), blog pages, `content/` | sanity + pixel diff home + blog at 375/1440 = 0 | BN | NS-17 | ARCH | todo |
| NS-19 | Structural: `Container fill` + `FillGrid` (`data-fill`) + sanity helpers read data attributes; Photo sizing union (`frame/cell/cover`); Expertise/Step cards via Photo reveal; blog `PageIntro/PostGrid/PostHero/PostCta` | C2, C4, C8, L5, R5 | primitives, sections Expertise/Gallery/Reignite/Intro/Services, blog/*, `tests-unit/sanity/helpers.ts` | full-site pixel diff (5 viewports home + 3 blog) = 0 | BN | NS-04, NS-18 | ARCH | todo |
| NS-20 | Tests: delete the 14 legacy class-string files (move cancel-on-input into the sanity soft-snap test; add an `on-dark` rule); prune the Playwright specs `fonts`, `text-visibility`, `track-c` and the redundant parts of `responsive` | Q2, Q4 | `tests-unit/*.test.ts*` (legacy), `tests/*.spec.ts` | `npm run test:unit` green; Playwright smoke | n/a | – | – | todo |
| NS-21 | Coverage: render tests for the blog index and post; SEO plumbing (`pageMeta`, noindex host guard, sitemap); MobileMenu behaviour | Q3 | `tests-unit/blog/*`, `tests-unit/lib/*`, `tests-unit/site/*` | test:unit | n/a | – | – | todo |
| NS-22 | Layering: ESLint `no-restricted-imports` mirroring `component-layers`; README wording (it's a chain) | L2, L3 | `eslint.config.mjs`, `src/components/README.md` | lint | n/a | NS-06 (eslint lock) | – | todo |
| NS-23 | Tailwind tokens: opacity modifiers for the 13 `color-mix(…transparent)`; derived hover tokens; `--color-whatsapp`, `--shadow-*`, `--container-prose`; `focus-ring` utility; `bg-linear-to-t` | T3, T7, T12 | `src/app/globals.css` (HOT), `ButtonLink`, `PostCard`, `AuthorCard`, `PostBody`, blog pages, `ContactFAB`, `Bio` | compiled-CSS diff + blog/home 375/1440 pixel diff = 0 | BN | NS-12 (lock) | – | todo |

### Batch 5: owner decisions and visual changes

| ID | Title | Findings | Files (lock) | Gate | BN / VC | Depends | Owner session | Status |
|---|---|---|---|---|---|---|---|---|
| NS-24 | Services title/subtitle misaligned below md (title centred, subtitle right-aligned): verify in the VR set, then fix with a SectionHeader `align` prop | C14 | `Services.tsx`, `SectionHeader.tsx`, `BodyText.tsx` | VR 375 | **VC** (fix) | NS-04 | – | needs-owner |
| NS-25 | Hero on the Section primitive and `--card-h` (lvh below lg, so about 40 px taller on phones; removes the strip of the next card under the hero when the toolbar collapses) | C3e, F §6.2 | `Hero.tsx`, `HeroContent.tsx`, `Section.tsx` (HOT) | iOS Simulator | **VC** | NS-37 | – | needs-owner |
| NS-26 | Hero first paint: text never gated by the entrance; decorative strokes after | VIS §5.4 | hero/* | iOS Simulator + LCP | **VC** | NS-11 | VIS | needs-owner |
| NS-27 | Repo hygiene: archive `reference/` (908 KB) and `design_handoff_hero_05b/` (3.1 MB) | R7 | repo root | none | n/a | – | – | needs-owner |
| NS-28 | Map click-to-load facade (the embed is 616 KB in 25 requests) | D10, P4 | `MapEmbed.tsx`, new image | owner review | **VC** | – | – | needs-owner |

### Batch 6: performance, images, fonts, contrast

The runtime-perf audit has landed (ARCH report E). The contrast audit is still pending.

| ID | Title | Findings | Files (lock) | Gate | BN / VC | Depends | Owner session | Status |
|---|---|---|---|---|---|---|---|---|
| NS-29 | Font preloads: preload only Elamy Bold, Stanga Regular and Stanga Bold, with `preload:false` on Elamy Regular and both Roboto Condensed faces (−69 KB of High-priority bytes); `fetchpriority="high"` on the logo. Keep `adjustFontFallback:false` and `next/font/local`. | A8, P-FONT1, P-IMG3, VIS §5.5 | `src/app/fonts.ts`, `BrandLogo.tsx` | slow-4G font timing + CLS check; sanity font tests | BN | – | VIS | todo |
| NS-30 | Images: AVIF for the mobile path (about −410 KB): `next/image` with correct `sizes` on Vercel, plus pre-generated AVIF with `<picture>` for the static export; a `priority` pass-through on Photo | A7a, P-IMG1, VIS §5.6 | `Photo.tsx`, call sites, `public/images/*` | pixel diff (lossy re-encode) + Safari clip check | **VC** (subtle) | NS-19 (Photo lock) | VIS | needs-owner |
| NS-31 | ~~Grain overlay replaced with a pre-rendered tile~~ | VIS-B #5, E | – | – | – | – | – | dropped: a tile is 62–481 KB, no faster, and not identical; Lighthouse's grain LCP is a metric artefact. An optional iOS A/B of the blend mode is P11. |
| NS-32 | ~~`content-visibility:auto` on sections~~ | VIS §5.7, E | – | – | – | – | – | dropped: under 50 ms saving; breaks SoftSnap measurements and Safari scroll anchoring; clips Elamy ink |
| NS-33 | Contrast fixes: the ExpertiseCard cream-on-mauve pill (2.26:1), mauve text on blog cards and the author card, plus any others the contrast audit finds; sanity contrast-matrix guard | contrast audit | ExpertiseCard, PostCard, AuthorCard, … | VR + ratio table | **VC** | contrast audit | – | blocked (audit pending) |
| NS-34 | `prefetch={false}` on BrandLogo (home prefetches `/?_rsc` ×3) and the mobile-menu links (opening the menu fetches about 58 KB plus 2 long tasks) | P12 | `BrandLogo.tsx`, `MobileMenu.tsx`, `NavLink.tsx` | unit + network check | BN | NS-09 (MobileMenu lock), NS-29 (BrandLogo lock) | – | todo |
| NS-35 | Hero font-swap CLS (0.0275 on slow 4G): a metric-matched Hebrew fallback | P-FONT2 | `src/app/fonts.ts` | CLS on slow 4G | **contract change** (`adjustFontFallback`) | NS-29 | – | needs-owner |

## Mapping of the VIS plan to these tickets (so nothing is done twice)

| VIS §5 item | Ticket |
|---|---|
| 1 CSS/IO reveals instead of framer | NS-13, NS-14 |
| 2 No parallax on mobile | NS-15 |
| 3 Shared Elamy ink box | NS-11 (supersedes b5dfce8's values) |
| 4 Hero first paint | NS-26 |
| 5 Fewer font preloads | NS-29 |
| 6 next/image | NS-30 |
| 7 content-visibility, cheaper grain | NS-32, NS-31 (both dropped on evidence; see the rows) |
| VIS-B "fetchpriority on blog cover" | dropped: the cover bytes arrive by 388 ms, but it sits inside a reveal; fixed by NS-13 |
| 8 Mobile snap stays off | NS-16 (made permanent and cleaned up), NS-36 (desktop v2), NS-37/NS-39 (heights) |

## Done

| ID | Commit | Notes |
|---|---|---|
| – | `0e72f9e` | VIS hotfix: soft snap off below 1024 px (live) |
