# Project Context for AI Agents

Welcome, fellow AI Agent! This file contains critical context, guidelines, and learnings specific to this project to help you avoid past mistakes and understand the architecture.

## Architecture & Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS + raw CSS (from Canva)
- **Testing**: Playwright (Visual Regression & DOM testing)
- **Core Concept**: This project is a pixel-perfect migration of a static HTML/CSS website exported from Canva into a Next.js application.

## The Canva Migration Pipeline
The original Canva export was massive (15,000+ lines of inline styles). To make it maintainable in Next.js:
1. We run `tailwind-generator.js` (a custom Node script) to parse the original `canva-source/index.html`.
2. It extracts structural styles, converts inline colors to Tailwind classes (e.g., `#F7E2D6` -> `bg-[#F7E2D6]`), and generates the final React component code in `src/app/page.tsx`.
3. The original Canva HTML string is heavily utilized via `dangerouslySetInnerHTML`.

### ⚠️ CRITICAL RULE: `dangerouslySetInnerHTML`
**NEVER** use regex to replace `class=` with `className=` inside raw HTML strings that are passed to `dangerouslySetInnerHTML`! React expects standard HTML syntax (`class="foo"`) for raw HTML injection. Converting it to `className=` will create invalid custom DOM attributes (`classname="foo"`) and destroy all CSS styling and JS selectors.

## Scroll Animations & IntersectionObserver
Canva uses `.animation_container` and `.animated` classes with inline CSS animations (e.g., `animation: rise-LEFT ... both paused`).

We implemented `ScrollAnimator.tsx` to unpause these animations as they scroll into view:
1. **Layout Settle Delay**: We explicitly wait `500ms` before attaching the `IntersectionObserver`. **Do not remove this!** During the first render frame, absolutely positioned elements often stack at `top: 0` before CSS kicks in. Without the delay, the observer will fire for every element on the page instantly.
2. **Artificial Batch Staggering**: Canva places every single element in its own `.animation_container`. To recreate their staggered waterfall cascade, `ScrollAnimator.tsx` intercepts the batch of elements entering the viewport simultaneously, sorts them by `boundingClientRect.top`, and dynamically assigns an increasing `animationDelay` (+150ms per element).

## Testing Guidelines (Playwright)
- Playwright's `toBeVisible()` assertion considers elements with `opacity: 0` as visible because they still occupy space in the DOM.
- When testing the visibility of elements that fade in via CSS animations, you **must** explicitly assert the computed CSS: `await expect(locator).toHaveCSS('opacity', '1')`.
- All tests are located in `/tests/`. Before pushing changes, rebuild the project (`npm run build`) and run all Playwright tests (`npx playwright test`).

## File Locations
- **Generator**: `tailwind-generator.js`
- **Main Page**: `src/app/page.tsx`
- **Animations**: `src/components/ScrollAnimator.tsx`
- **Tests**: `tests/` (Includes visual regression and staggered animation DOM checks)
- **Original Source**: `canva-source/index.html` and `canva-source/styles.css`
- **Netta's Voice**: `netta_voice.md` (Reference for Netta's writing style and tone)

## ⚠️ Critical Next.js & Vercel Gotchas
1. **Never override `<head>` in `layout.tsx`**: In the Next.js App Router, manually defining a `<head>` wrapper around `<link>` tags will completely override Next.js's internal head injection. This instantly destroys `globals.css` loading, Tailwind, and React hydration scripts. Always rely on Next.js `import` statements or Metadata APIs.
2. **CSS Import Order Specificity**: Canva's `styles.css` contains extreme specificity that can hide elements (e.g. `opacity: 0`). When importing stylesheets in `layout.tsx`, `import "./globals.css"` **MUST** come absolutely last so that our clean override animations (`cleanFadeUp`) win the specificity war.
3. **Missing Fonts break Vercel Builds**: Canva's exported CSS contains hundreds of `url(fonts/...)` references. Because `public/fonts` is `.gitignore`d (to save space), Next.js's Webpack parser will crash with `Module not found` during the Vercel production build. Always use `sed` to strip broken font URLs from Canva CSS files before importing them.
4. **Never run Playwright in Vercel Builds**: Vercel build containers lack the OS-level graphics dependencies (X11, etc.) required to launch Chromium. If you add `playwright test` to the `"build"` script in `package.json`, Vercel will crash. E2E tests must be run in GitHub Actions instead.
5. **Canva Font Obfuscation**: Canva exports fonts using randomized IDs (e.g., `font-family: YAErUQDw3VY-0`) instead of semantic names. Do not try to visually guess the correct Google Font replacement! Instead, download the original Canva `.woff2` files and parse them using `fontkit` or `fonttools` to extract the true internal `font-family` name (e.g., finding out that `YAErUQDw3VY-0` is actually "Della Respira", not "Playfair Display"). Furthermore, because the raw IDs are hardcoded in the `dangerouslySetInnerHTML` strings, CSS variables (like `var(--font-canva-secondary)`) will be ignored unless you run a script to manually search-and-replace the Canva IDs inside the React components.
