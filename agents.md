# Project Context for AI Agents

**Stack:** Next.js (App Router) · React · Tailwind v4 (`@theme` in `src/app/globals.css`, no `tailwind.config`) · CSS motion (no animation library) · Vitest + jsdom (`tests-unit/`) · Playwright (`tests/`). **Hebrew / RTL** site (`<html dir="rtl">`). Neta Shemesh, couple and family therapist: warm, calm, never clinical; the site builds trust and converts visitors to a WhatsApp first contact (copy tone: `netta_voice.md`).

`CLAUDE.md` = **design rules** (typography, colour/contrast, layout, one-screen cards). Read it before any visual code. This file = everything else. Long detail lives in `docs/agent-reference.md` (grep its `## N.` headings, read only the section you need).

## Next.js

Next's generated "read the docs" block is disabled (`agentRules: false` in `next.config.ts`). APIs may differ from your training data: read only the one guide in `node_modules/next/dist/docs/` for the API you are touching (grep it by filename/keyword); never read that folder wholesale.

## Repo map

- Page/app: `src/app/page.tsx` (flat section list in `<PageShell overflow="clip">`, keep `clip`), `layout.tsx`, `fonts.ts`, `globals.css`, blog in `src/app/blog/**`, posts in `src/content/posts/`. SEO: `src/lib/seo/`.
- Content (single source of truth, plain typed data): `src/content/` (`site.ts` facts, `ids.ts` DOM ids/anchors, `home/*.ts` copy). Never type a phone, email, street or id literal in a component (sanity fails).
- Components: `src/components/sections/<slug>/` (one folder per section), `site/` (chrome: PageShell, Footer, ContactFAB, SiteNav, MobileMenu), `primitives/` (Section, Container, Card, Photo, BodyText, ButtonLink, ...), `motion/` (ScrollReveal, ParallaxFrame, SoftSnap). Layer direction `content -> lib -> primitives, motion -> site -> sections, blog -> app`; folder rules in `src/components/README.md`.
- Helpers: `src/lib/motion.ts` (`stagger()`), `src/lib/cx.ts` (`cx()` for class lists), `src/lib/slide-pager.ts`.
- Tests: `tests-unit/` (vitest), `tests/` (Playwright). Deployment: `docs/deployment.md` (read before touching `next.config.ts`, `public/staticwebapp.config.json`, canonical URLs, images).
- Parked on purpose (do not delete as dead code): testimonials (`SHOW_TESTIMONIALS = false` in `page.tsx`, `sections/testimonials/`).

## Verify

- `npm run test:sanity` fast structural guard (tone, one-screen, type scale, brand rules); `npm run test:unit` all vitest (Vercel gates on it); `npx tsc --noEmit`; `npm run lint`.
- Playwright: `npm run build`, then `PORT=3200 npm run start -- -p 3200` and `BASE_URL=http://localhost:3200 npx playwright test --project=chromium` (a stale server on the default port silently tests old code).
- Never re-baseline screenshots or relax an assertion to get green. Fade-ins: assert `toHaveCSS('opacity','1')`, not `toBeVisible()`.

## Gotchas

- Safari: `safari-clip` on rounded `overflow-hidden` parents (`Photo` does it). Parallax/Section/Footer clip with `overflow-clip`.
- Decorative SVGs: absolute `z-0 pointer-events-none`, content `z-10`. Faded bg images: full-opacity `<img>` plus tinted overlay.
- Tailwind v4 arbitrary `clamp()` text sizes fail silently: use `.type-*`; never stack two `type-*` classes.
- RTL: logical utilities (`start-*`, `end-*`, `ms-*`, `ps-*`); only `<html>` has `dir="rtl"`; `dir="ltr"` on phones, emails, numerals.
- Reduced motion is CSS-only; never branch on `useReducedMotion()` (SSR ships `opacity:0`). No `delay={0}`.
- Fonts: `next/font/local` only, never `next/font/google`; `./fonts` import stays before `globals.css`.
- Never hand-write `<head>`/`<link>`; use the Metadata API. Never lazy-load the LCP image.
- No Playwright in the Vercel build (E2E runs in GitHub Actions).
- Git: `main` is the single source of truth; the orchestrator owns git (no stash/checkout ./clean/reset/rebase/force-push). Don't commit scratch files, screenshots, logs.

## Where to read more (docs/agent-reference.md)

- Touching architecture, sections, motion, soft snap, fonts, JSON-LD? read §1. Persona/voice? §2. Playwright/pixel-diff detail? §3. Full gotchas? §4. Deploy, Vercel/Azure, governance? §5. File map? §6. The old Next.js block? §7.
- `docs/archive/*` is history; do not read unless the task names it.

## Agent context hygiene

- Pipe output: `npm run build 2>&1 | tail -40`, `npx vitest run 2>&1 | tail -60`; grep for FAIL/error; never dump full logs.
- Briefs must list exact files; grep before reading.
- Do NOT open `tests-unit/sanity/helpers.ts` (84 KB) or `src/app/globals.css` (32 KB) whole: grep the symbol/class and read a line range.
- Do not read `docs/archive/*`, `node_modules/next/dist/docs/` wholesale, or the big READMEs (`tests-unit/sanity/README.md` 18 KB, `src/components/primitives/README.md` 14 KB) unless the task touches them.
