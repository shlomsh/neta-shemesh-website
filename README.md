# Netta Shemesh — website

Marketing site for **Netta Shemesh** (נטע שמש), a couples and family therapist in Netanya. Hebrew only, right-to-left, mobile-first. Its job is a warm first impression and a low-friction first contact (WhatsApp, phone, email). Who she is and what the site is for: [docs/neta.md](docs/neta.md). Audience and design principles: [PRODUCT.md](PRODUCT.md). Design rules (type, colour, contrast, layout) and code rules: [CLAUDE.md](CLAUDE.md).

## Stack

Next.js 16 (App Router, server components by default), React 19, TypeScript, Tailwind CSS v4 (theme tokens in `@theme` in `src/app/globals.css`, no `tailwind.config`). Motion is plain CSS plus a tiny IntersectionObserver island and, on desktop with a mouse, a small JS slide pager; no animation library. Fonts are self-hosted through `next/font/local`. Three runtime dependencies (`next`, `react`, `react-dom`). Tests: Vitest + jsdom, Playwright. Node 24 (`.nvmrc`).

## Commands

```bash
npm ci                      # exact lockfile install (what Vercel and CI run); `npm install` only when changing dependencies
npm run dev                 # http://localhost:3000
npm run build && npm run start
npm run lint                # eslint --max-warnings 0 (also enforces the component layer direction)
npm run typecheck           # tsc --noEmit
npm run test:unit           # all of tests-unit/ (Vitest)
npm run test:sanity         # tests-unit/sanity only: the fast design/structure guard
```

Playwright (`tests/*.spec.ts`, runs the built site):

```bash
npm run build
BASE_URL=http://localhost:3200 npx playwright test                      # every project
BASE_URL=http://localhost:3200 npx playwright test --project=iphone     # one project
npx playwright install chromium webkit                                  # browsers, once (add firefox for the local-only project)
```

Projects (`playwright.config.ts`): `chromium` (Desktop Chrome), `webkit` (Desktop Safari), `iphone` (iPhone 17), `ipad` (iPad Pro 11 landscape, 1194px wide but touch); `firefox` runs locally only. `tests/slide-pager.spec.ts` checks that the pager moves exactly one card on desktop and is never downloaded on `iphone` and `ipad`. CI installs `chromium webkit` and runs the four projects.

Use a fresh port: when nothing listens there the config starts `npm run start -p 3200` itself, but it reuses whatever already listens, so a stale server silently tests old code.

Pixel diff of the working tree against any git ref (0 px tolerance, no committed baselines): `npm run vr -- <ref>`, see [tests/visual/README.md](tests/visual/README.md).

## Repo map

- `src/app` routes (`page.tsx`, `blog/`, `layout.tsx`), `fonts.ts`, `globals.css`, `sitemap.ts`, Open Graph images (committed PNGs, not generated).
- `src/content` plain typed data: `site.ts` (name, phone, email, address, URLs), `ids.ts` (DOM ids, anchors), `home/*.ts` (copy), `posts/*.ts` (blog).
- `src/components/{sections,site,primitives,motion,blog}` one folder per home section, shared chrome, content-agnostic building blocks, scroll behaviour, blog parts. Layer direction `content → lib → motion → primitives → site → sections | blog → app` is enforced by ESLint (`eslint.config.mjs`); folder rules and primitive contracts: [src/components/README.md](src/components/README.md).
- `src/lib` SEO (`seo/`), motion helpers, the slide pager's pure logic, `cx()`.
- `tests-unit` Vitest; `tests-unit/sanity` is the structural guard ([README](tests-unit/sanity/README.md)). `tests` Playwright e2e; `tests/visual` the pixel-diff harness.
- `scripts` font fallback metrics generator, Vercel ignored-build gate. `public` images, `robots.txt`, `llms.txt`.

## Deploy

Vercel deploys `main` through its Git integration. Before each build `vercel.json` runs `scripts/vercel-ignore-build.sh`, which runs `eslint`, `tsc --noEmit` and `vitest run` and skips the build when any of them fails (inverted exit codes, fail-open on infrastructure errors). GitHub Actions (`.github/workflows/playwright.yml`, workflow name `CI`) runs lint, typecheck, unit tests, build and the Playwright suite on every push and PR to `main`; Vercel does not wait for it, so it cannot block a deploy. Why the repo is public, DNS and rollback: [docs/deployment.md](docs/deployment.md).

## Docs

- [CLAUDE.md](CLAUDE.md) design rules and code rules (loaded automatically by Claude Code)
- [PRODUCT.md](PRODUCT.md) audience, brand personality, design principles
- [docs/neta.md](docs/neta.md) who Netta is, site goals, her voice
- [docs/deployment.md](docs/deployment.md) Vercel, domain and DNS, test gate, rollback
- [src/components/README.md](src/components/README.md) layers, folder rules, primitive contracts
- [tests-unit/sanity/README.md](tests-unit/sanity/README.md) what each sanity guard protects
- [tests/visual/README.md](tests/visual/README.md) the `npm run vr` harness

*Built with care by [Shlomi Shemesh](https://github.com/shlomsh) for Netta Shemesh Therapy.*
