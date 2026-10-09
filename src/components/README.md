# Components

```
src/components/
  primitives/   content-agnostic styled blocks        layout/ Section Container Grid Card ScrollAnchor
                (see primitives/README.md)             ui/     BodyText ButtonLink SectionTitle SectionHeader Photo MaskIcon IconButton
  motion/       behaviour, no content                  ScrollReveal RevealObserver ParallaxFrame SoftSnap SoftSnapEngine
  site/         chrome shared by more than one page    PageShell JsonLd ContactFAB BrandLogo SiteNav MobileMenu NavLink
                                                       footer/ (Footer FooterBackground) hooks/ icons/
  sections/     one folder per home-page section       hero intro expertise bio credentials reignite services
                                                       cta-band gallery contact testimonials (parked)
  blog/         blog-only components                   BlogHeader PostBody PostCard AuthorCard
```

## Dependency direction

```
content  ->  lib  ->  motion  ->  primitives  ->  site  ->  (sections | blog)  ->  app
```

It is a chain: each layer imports only from the layers before it (to its left), never after. `motion` sits before `primitives` because `primitives` use `motion` (`Photo` uses `ScrollReveal`) and `motion` never uses a primitive. `sections` and `blog` are the one fork: siblings that never import each other. Concretely:

- `content/` is plain typed data: no component, no `lib` import.
- `lib/` imports `content` only.
- `primitives/` is content-agnostic: it imports `lib` and `motion`, never `content`. (`Photo` uses `ScrollReveal` and `ParallaxFrame`; that is why motion is its own folder and not a part of `primitives/`.)
- `motion/` imports `lib` only. It never imports a primitive.
- `site/` may use `content`, `lib`, `primitives` and `motion`. It must not import `sections/`: the footer lives in `site/footer/` (not in `sections/`) because the shell, `PageShell`, renders it on every page.
- `sections/` and `blog/` may use everything to the left, including `site/`. They never import each other, and one section never imports another section (a section folder is a self-contained unit that `app/page.tsx` composes).
- `app/` (pages, layouts) composes all of the above.

Two guards enforce it: ESLint `no-restricted-imports` blocks in `eslint.config.mjs` (`npm run lint`, so CI) fail on any import that goes against this, and `tests-unit/sanity/component-layers.test.ts` does the same plus fails on a new top-level folder that has no row in its table. A new layer or section folder needs its row in both (the section list in the ESLint config is read from the folder, so a new section is covered automatically).

## Folder rules

- **`primitives/`** earns a place only if it knows nothing about this site's copy, ids or facts. A one-off layout belongs in the section that uses it. Rules per primitive: `primitives/README.md`.
- **`motion/`**: scroll reveal, parallax, soft snap (`SoftSnap` is a client gate; `SoftSnapEngine` is loaded by dynamic `import()` only on `(min-width: 1024px) and (pointer: fine)`, never on touch). Reduced motion is handled in CSS (`[data-reveal]`, `[data-parallax]` in `globals.css`), not by branching in React.
  - **Scroll reveal** = server `ScrollReveal` (`<div data-reveal="io">`, delay as `--reveal-delay`, no hidden state in the HTML) + the one client island `RevealObserver` (mounted in `PageShell`, renders `null`) + CSS. The observer sets `html[data-reveal-armed]` only after its first IntersectionObserver callback, and only for a top-level page with IntersectionObserver and no reduced motion; the hidden state (`opacity:0; translate:0 24px`) exists only under that attribute and `prefers-reduced-motion: no-preference`, so JS off, an iframe or a failed observer all leave the page visible. Elements already on screen at arming are revealed without a fade. A `ScrollReveal` must be in the server HTML or mounted before `RevealObserver`'s effect (one mounted later is never observed and would stay hidden); there are none today. ContactFAB's bare `data-reveal` is not part of this mechanism (its entrance is the `.fab-enter` CSS keyframe, NS-14).
- **`site/`**: header pieces (`BrandLogo`, `SiteNav`, `MobileMenu`, `NavLink`), the `PageShell` `<main>` shell, the `Footer`, the contact pill, `JsonLd`. `hooks/` holds `useFocusTrap` and `useBodyScrollLock`; `icons/` holds the reusable inline SVGs (menu, close, WhatsApp, phone). Decorative one-off SVG scaffolding (`CoupleLineArt`, `OrganicBg`, the hero underline) stays next to the section that owns it.
- **`sections/<name>/`**: the section component has the PascalCase name of the folder (`intro/Intro.tsx`, `cta-band/CtaBand.tsx`) and renders exactly one `<section>` (plus its scroll anchor). Its sub-components live in the same folder. Folder = section slug, not file topic: `reignite/` is the "להצית מחדש" photo band, `gallery/` the "טיפול זוגי…" photo grid, `intro/` the "ליווי מקצועי לזוגות" collage, `bio/` the "קצת עלי" bio. `contact/` holds two sections (`ContactSocial`, `ContactOffice`) because they share their leaves.
- **A component earns its own file** only if it is reused, has state or logic, or is a real visual unit (art, a background composition, a card with several slots). A logic-free single-use leaf (a paragraph, a number, a pill) is written inline in its parent. So `Step*`, `CardLabel`, `Footer{Brand,Copyright,CTA}`, `Hero{Background,Subtext,CTA}` are not files.
- **The parked testimonials** block (`sections/testimonials/`) stays on purpose until the owner decides; `app/page.tsx` gates it with `SHOW_TESTIMONIALS = false`. Do not delete it as dead code.
- **Exports:** named exports everywhere. Only Next route files (`page`, `layout`, `route`, `sitemap`, ...) use `export default`.
- **Tests find sources by path suffix** (`sourceNamed('SoftSnap.tsx')` in `tests-unit/sanity/helpers.ts`), and render sections by their ids from `content/ids.ts`; a move needs the suffix updated, not an assertion loosened.

## Adding a section

1. `sections/<slug>/<Name>.tsx` with one `Section` (tone, fit, pad; see the primitives README), ids from `content/ids.ts`, copy from `content/`.
2. Mount it in `app/page.tsx` in page order; add its expected tone/fit row to the sanity tables (`EXPECTED_SECTIONS`, `DESKTOP` in `one-screen.test.tsx`).
3. Run the sanity suite and a pixel diff (`docs/archive/tech-debt-plan-2026-10.md` section 6).
