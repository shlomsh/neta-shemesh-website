# Agent reference (long-form detail moved out of agents.md)

> Read only the section you need; `agents.md` points here as "read docs/agent-reference.md §N". Content below is moved verbatim from the former `agents.md` (section numbers match). Not a startup read.

## 1. Architecture

- **Next.js App Router.** APIs may differ from older versions; check `node_modules/next/dist/docs/` if unsure.
- **Page:** `src/app/page.tsx` is a flat list of sections inside `<PageShell overflow="clip">` (`src/components/site/PageShell.tsx`: the shared `<main>` + `Footer` + `ContactFAB`). The home page must stay `clip` (`overflow-hidden` would break soft snap and sticky); the two blog pages pass `hidden`; the prop is explicit on purpose. `src/app/layout.tsx` holds the root metadata and the site JSON-LD, built by `src/lib/seo/metadata.ts` (`pageMeta`) and `src/lib/seo/jsonld.ts` (`siteJsonLd`, `blogPostingJsonLd`, rendered by `components/site/JsonLd`); fonts are declared in `src/app/fonts.ts`; blog in `src/app/blog/**` with posts in `src/content/posts/`.
- **Content (single source of truth):** `src/content/` is plain typed data, no component imports. `site.ts` = every site fact (name, phone as display + E.164, email, address, hours, URL, WhatsApp message) plus `telHref()/mailHref()/waHref()/mapEmbedSrc()`; `ids.ts` = every DOM id (`ID`) and scroll anchor (`ANCHOR`, `anchorHref()`), consumed by components, nav links, Playwright specs and unit tests; `types.ts`; `home/*.ts` = the copy arrays (expertise, steps, about, gallery, contact, nav, social, parked testimonials). Never type a phone, email, street or id literal in a component: the sanity suite (`single-source.test.tsx`) fails on it. JSON-LD `Service` nodes are derived from `home/expertise.ts`.
- **Sections:** `src/components/sections/<slug>/<Name>.tsx`, one folder per rendered section (`hero`, `intro`, `expertise`, `bio`, `credentials`, `reignite`, `services`, `cta-band`, `gallery`, `contact` = `ContactSocial` + `ContactOffice`, parked `testimonials`), each with its sub-components beside it. Folder rules, the dependency direction (`content -> lib -> primitives, motion -> site -> sections, blog -> app`, enforced by `tests-unit/sanity/component-layers.test.ts`) and when a component earns a file: `src/components/README.md`. `site/` holds the shared chrome: `PageShell`, `footer/Footer`, `ContactFAB`, `BrandLogo`, `SiteNav` + `MobileMenu` (the header nav, also used by the blog), `hooks/`, `icons/`.
- **Primitives:** `src/components/primitives/` (see its `README.md`): `Section`, `Container`, `Grid`, `Card`, `ScrollAnchor`, `BodyText`, `ButtonLink`, `SectionTitle`, `SectionHeader`/`SectionSubtitle`, `Photo`, `MaskIcon`, `IconButton`. Section tone is a `data-bg-tone` attribute; CSS does the colours.
- **Motion** (`src/components/motion/`): `ScrollReveal` (server component; CSS fade/rise-in armed by `RevealObserver`) for reveals, `ParallaxFrame` (server component; CSS scroll-driven `view()` drift, so the frame, `Section` and the Footer clip with `overflow-clip`, never `overflow-hidden`), `SoftSnap` (the slide pager: at `(min-width: 1024px) and (pointer: fine)` one wheel / trackpad gesture or key moves exactly one card, the `main > section` cards and the `main > footer`, with a ~650 ms slide; a card taller than the screen scrolls natively until its edge; **never where the primary pointer is coarse (phones, tablets), at any width**, where the page scrolls natively and no pager code is downloaded; hybrid touch laptops whose primary pointer is fine get the pager; `SoftSnap.tsx` is a tiny gate that dynamic-imports `SlidePager.tsx` (started on page load, only where the query matches); the pager also skips paging while the mobile menu is open (`main[inert]` / body scroll lock); no CSS scroll-snap; off under reduced motion; `?snap=off` is a hidden escape hatch; the decisions are the pure, unit-tested functions in `src/lib/slide-pager.ts`, `SNAP_MEDIA` lives in `src/lib/soft-snap.ts`), plus `site/ContactFAB`. Stagger delays are passed as props (`stagger(index)` from `src/lib/motion.ts`, 0.12s per step; it lives outside the client `ScrollReveal` module so server components can call it), so parent grids stay server components. Do not pass `delay={0}` (the default).
- **Reduced motion is handled in CSS, not in React.** `ScrollReveal`/`ParallaxFrame`/`ContactFAB` render the same tree on server and client and never branch on `useReducedMotion()`; a `[data-reveal]`/`[data-parallax]` rule under `@media (prefers-reduced-motion: reduce)` forces the final frame. Branching in React ships `opacity:0` in the SSR HTML and the content stays invisible after hydration.
- **Fonts:** three `next/font/local` families declared in `src/app/fonts.ts` (Elamy, Stanga, Roboto Condensed as the Latin companion), all self-hosted from `src/app/fonts/` (bundled by next/font, served only as hashed `/_next/static/media/*.woff2`, no public URL). Never `next/font/google` (the Vercel build once failed fetching it). In `layout.tsx` the `./fonts` import stays before `import "./globals.css"` so our rules win. Only three faces are preloaded (Elamy Bold, Stanga Regular + Bold; NS-29): `preload` is per `localFont()` call, so Elamy is two calls (`elamy` = Regular, owns `--font-elamy`; `elamyBold` = Bold) sharing the family name `elamy` via a `font-family` declaration (Turbopack does not hash family names). Elamy Regular and Roboto Condensed swap in on demand.
- **Parked feature:** the "לקוחות ממליצים" testimonials block (`SHOW_TESTIMONIALS = false` in `src/app/page.tsx`, components in `sections/testimonials/`, assets `public/images/testimonial-*`) is kept on purpose until the owner decides; do not delete it as dead code.

## 2. Client persona and voice

Neta Shemesh is a couple and family therapist with **14 years of clinical experience** (M.S.W. clinical social worker). Tone: warm, calm, safe, never clinical. Tagline: "מקום בטוח לצמוח בו ביחד". Primary CTA: "תיאום פגישת ייעוץ" (WhatsApp). The site must make a warm first impression, build trust, explain the four service areas (couple therapy, family therapy, parenting guidance, personal accompaniment) and convert visitors into a low-friction first contact. Voice reference: `netta_voice.md`.

## 3. Tests

- **Unit (`npm run test:unit`, vitest/jsdom):** `tests-unit/sanity/` is the fast structural guard for tone rotation, one-screen heights, the type scale and brand rules (`npm run test:sanity`, see its README). The other files in `tests-unit/` cover narrower component details. Vercel's build gates on vitest.
- **Playwright (`npm run build`, `npm run start`, then `npx playwright test --project=chromium`):** base URL comes from `BASE_URL` (default `http://localhost:3000`); use a fresh port with `PORT=3200 npm run start -- -p 3200` and `BASE_URL=http://localhost:3200`, because Playwright reuses whatever is already listening on the default port and a stale server silently tests old code. The config does not force reduced motion; only `tests/reduced-motion.spec.ts` does, and the other specs scroll the page so reveal animations fire.
- `tests/layout-fit.spec.ts` is the implementation-independent layout invariant (titles on-screen, sane font size at 375/768/1280). `responsive.spec.ts` checks horizontal overflow.
- `toBeVisible()` treats `opacity:0` as visible; for fade-ins assert `toHaveCSS('opacity','1')`.
- Don't re-baseline screenshots or relax an assertion to get green; prove the diff is intended and scoped.
- A refactor that must not change rendering is verified by pixel-diffing two production builds plus a DOM outline diff (method in `docs/archive/tech-debt-plan-2026-10.md` section 6).

## 4. Gotchas that still apply

- **Safari clipping:** absolute children inside `overflow-hidden` + `border-radius` bleed in Safari. Put the `safari-clip` utility on the rounded parent (`Photo` radius `card`/`tile` already does).
- **Organic backgrounds:** decorative SVGs are absolute layers (`z-0 pointer-events-none`) with content on `z-10`.
- **Faded background images:** render the `<img>` at full opacity and put a tinted overlay on top; lowering the image's own opacity over a dark base makes it vanish.
- **Tailwind v4 arbitrary `clamp()` text sizes fail silently** and fall back to browser defaults. Use the `.type-*` classes from `globals.css`.
- **RTL positioning:** `left-*`/`right-*` are physical. Prefer logical utilities (`start-*`, `end-*`, `ms-*`, `ps-*`, `text-start`); `<html dir="rtl">` is the only `dir="rtl"` (the sanity suite fails on another one; `Section` has no `dir` prop); keep `dir="ltr"` on phone numbers, emails and step numerals.
- **Stacked `type-*` classes:** never put two on one element (the later CSS rule wins). `BodyText` already handles this.
- **Next head:** never hand-write `<head>`/`<link>` in `layout.tsx`; use `import` and the Metadata API.
- **LCP:** never lazy-load the LCP image (hero logo, first blog cards); use `priority` / `loading="eager"`.
- **Do not run Playwright in the Vercel build** (no Chromium deps); E2E runs in GitHub Actions.

## 5. Deploy flow and governance

- **Vercel** deploys `main` through its Git integration. `vercel.json` sets `ignoreCommand: bash scripts/vercel-ignore-build.sh`, which runs `vitest run` first. Vercel's exit codes are inverted: exit 1 = build proceeds (tests passed, or the runner could not be installed: fail-open), exit 0 = build skipped (tests failed; production keeps the previous deploy).
- **GitHub Actions:** `playwright.yml` runs lint, `tsc --noEmit`, unit tests, the build and the Playwright e2e suite (Actions only; Vercel never runs Playwright and does not wait for it). `azure-static-web-apps.yml` builds the static export (`BUILD_STATIC_EXPORT`) and deploys it to Azure SWA.
- `main` is the single source of truth; commit a checkpoint after each validated change.
- Engineers edit and test; the orchestrator owns git/branch/worktree operations. No `stash`/`checkout .`/`clean`/`reset`/`rebase`/force-push.
- Don't commit scratch files, screenshots or logs.
- Keep changes scoped: a global/primitive edit ripples through every section, so run the sanity suite and a pixel diff.

## 6. File map

- Page / layout / CSS / fonts: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/fonts.ts`, `src/app/globals.css` · page shell: `src/components/site/PageShell.tsx` · SEO: `src/lib/seo/`
- Sections: `src/components/sections/` · site chrome: `src/components/site/` · primitives: `src/components/primitives/` · motion: `src/components/motion/` · folder rules: `src/components/README.md`
- Content + site facts + ids: `src/content/` (`site.ts`, `ids.ts`, `types.ts`, `home/`) · motion delays: `src/lib/motion.ts` · class-list helper: `src/lib/cx.ts` (`cx()`, used for every conditional/composed class list)
- Tests: `tests-unit/` (vitest), `tests/` (Playwright)
- Docs: `CLAUDE.md` (design rules), `docs/archive/typography-guideline-2026-10.md`, `docs/archive/visual-roadmap-2026-10.md`, `docs/archive/tech-debt-plan-2026-10.md`, `docs/deployment.md`
- Copy tone: `netta_voice.md`
- **Deployment: `docs/deployment.md`.** The site ships to Vercel *and* Azure SWA from the same commits, switched by `BUILD_STATIC_EXPORT` and `NEXT_PUBLIC_SITE_URL`. Read it before touching `next.config.ts`, `public/staticwebapp.config.json`, canonical URLs or anything image-related: the two hosts hold the same header policy in two files that drift silently, and the Azure copy must stay non-indexable. `npm run compare:deploys` checks that they still agree.

## 7. Former Next.js generated block (removed from agents.md)

`next dev` used to write this block into `agents.md`/`AGENTS.md` (same file on case-insensitive APFS). It is disabled by `agentRules: false` in `next.config.ts`; see `agents.md`. Original text, kept for the record:

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
