# Netta Shemesh — Couple & Family Therapist

> *"מקום בטוח לצמוח בו ביחד" — A safe place to grow together.*

This is the personal website of **Netta Shemesh**, a clinical social worker (M.S.W.) and licensed therapist with over 15 years of experience helping couples, families, and individuals navigate change, crisis, and growth.

---

## What this site is about

Therapy begins long before anyone walks through the clinic door. The first step — reaching out, reading a few words, feeling like *this* might be the right place — matters enormously. This website was built to make that first step feel warm, safe, and unhurried.

Visitors arrive at a quiet moment in their lives: a couple drifting apart in silence, parents who feel stuck, someone searching for a steady hand through a personal storm. The site meets them there. It doesn't lecture. It listens. It gives a sense of who Netta is and what the work feels like before any appointment is ever booked.

### The four areas of practice

| Area | What it addresses |
|---|---|
| **Couple Therapy** | Loneliness inside a relationship, communication walls, growing back toward each other |
| **Family Therapy** | Family dynamics, conflict, transitions, and finding a shared language again |
| **Parenting Guidance** | Practical tools for parents — because one hour a week in a clinic can't do it alone; the real change happens at home, with you |
| **Personal Accompaniment** | Individual support through life's harder seasons |

The primary contact channel is **WhatsApp**, keeping the path to a first conversation as frictionless as possible.

---

## Design philosophy

The site has a visual identity built around four colors — a warm cream, soft blush, mid mauve, and deep plum — and two fonts: a handwritten display face for titles, and a clean, readable sans-serif for everything else. Every color pairing was tested for WCAG accessibility contrast. The layout moves through full-screen sections that progress through the palette like rooms in a home.

The site is fully **Hebrew and RTL** (right-to-left), mobile-first, and designed to feel unhurried on every screen size.

---

## What's under the hood

For the curious: this site is built with some of the most modern web technology available, chosen deliberately to make it fast, accessible, and maintainable for years to come.

### Core framework

- **[Next.js 16](https://nextjs.org/) with the App Router** — the latest generation of Next.js, where pages are server-rendered by default. This means search engines can read every word of the site the moment it loads, and visitors get content immediately rather than waiting for JavaScript to run.
- **[React 19](https://react.dev/)** — the newest version of the UI library that powers most of the modern web.
- **[TypeScript](https://www.typescriptlang.org/)** — the entire codebase is fully type-safe, which means bugs are caught before they ever reach a visitor.

### Styling

- **[Tailwind CSS v4](https://tailwindcss.com/)** — the newest major version, with a redesigned configuration system (`@theme` in CSS rather than a separate config file). All spacing, colors, and typography tokens live in one place and cascade correctly across every component.
- A **custom fluid type scale** built with CSS `clamp()` — text sizes adapt smoothly between mobile and desktop without any abrupt jumps. No text on the site is smaller than 14px on any device.
- **Custom brand fonts** — loaded from `.woff2` files, self-hosted through `next/font/local` (fontkit is a dev-only dependency, used by a sanity test to measure the Elamy glyph ink). No Google Fonts, no third-party CDN dependency.

### Motion & interactions

- **CSS motion** — scroll-triggered reveals (one tiny IntersectionObserver island), a CSS scroll-driven photo parallax and the contact pill's entrance keyframe. No animation library. Respects the operating system's "reduce motion" accessibility preference.

### Hebrew & RTL

- The site is **single-locale Hebrew**. Right-to-left layout comes from `lang="he" dir="rtl"` on the root `<html>` element (`src/app/layout.tsx`) — Tailwind's logical properties handle the rest. No internationalization library is needed, and none is installed.

### SEO & discoverability

- **Open Graph preview card** — when the link is shared on WhatsApp, iMessage, or social media, it shows a branded 1200×630 card. This is a committed image at `src/app/opengraph-image.png`, **not** generated at build time, so it needs updating by hand if the branding or the wording on it changes. (It was previously generated from JSX, but that version hardcoded its Hebrew and faked RTL by reversing characters, which corrupts any mixed Hebrew/Latin text. A static asset is more predictable, and it also serves with the correct `image/png` type on Azure Static Web Apps, which the generated route did not.)
- **Auto-generated sitemap** at `/sitemap.xml` and a `robots.txt`, so search engines always have an up-to-date map of the site.
- Server-side rendering means every page is fully readable by Google without JavaScript.

### Quality & testing

- **[Playwright](https://playwright.dev/)** — an end-to-end browser test suite that takes visual screenshots and compares them against approved baselines. Any unintended visual change fails the build before it can be deployed.
- **[Vitest](https://vitest.dev/)** — unit tests for component logic, run in milliseconds.
- **GitHub Actions CI** — every code change is automatically built and tested before it can go live.

### Deployment

- **[Vercel](https://vercel.com/)** — production. The site deploys automatically on every merge to the main branch, and each pull request gets its own preview URL for review before anything goes public.
- **[Azure Static Web Apps](https://azure.microsoft.com/products/app-service/static)** — a second, parallel deploy running from the same commits while a possible move off Vercel is evaluated. It is **not** indexable by search engines, and it serves images unoptimized, so it is slower than production by design.

> Both hosts build from one codebase, switched by two environment variables. Before changing `next.config.ts`, `public/staticwebapp.config.json`, or anything touching canonical URLs, read **[docs/deployment.md](docs/deployment.md)** — it covers the env guard, the cutover checklist, the known image-optimization gap, and `npm run compare:deploys` for verifying the two hosts still agree.

---

## Getting started (for developers)

```bash
npm install
npm run dev        # start local dev server at http://localhost:3000
npm run build      # production build
npm run test:unit  # run unit tests
npx playwright test  # run visual regression tests
```

---

*Built with care by [Shlomi Shemesh](https://github.com/shlomsh) for Netta Shemesh Therapy.*
