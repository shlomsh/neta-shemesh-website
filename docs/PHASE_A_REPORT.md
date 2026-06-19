# Phase A: Playwright Test Triage Report

| Spec | Category | Section(s) Covered | Current Pass/Fail | Recommended Action |
| --- | --- | --- | --- | --- |
| `animations.spec.ts` | b) Asserts old Canva structure or cryptic IDs that no longer exist (needs rewrite or deletion) | Global / Scroll Animations | Fail | Rewrite to test new Framer Motion / `ScrollReveal` implementation or delete. |
| `canva.spec.ts` | c) Pixel/DOM-fingerprint snapshot goldens (needs deliberate re-baseline) | Full Page Layout | Fail | Deliberate re-baseline once responsive layout matches Canva reference. |
| `computed-style-golden.spec.ts` | b) Asserts old Canva structure or cryptic IDs that no longer exist (needs rewrite or deletion) | Global / Computed Styles / Fonts | Fail | Rewrite to use semantic selectors instead of Canva IDs, or delete. |
| `dom-fingerprint.spec.ts` | b) Asserts old Canva structure or cryptic IDs that no longer exist (needs rewrite or deletion) | Global / DOM Structure / Section Surfaces | Fail | Rewrite structural guards based on new DOM invariants, or delete. |
| `example.spec.ts` | b) Asserts old Canva structure or cryptic IDs that no longer exist (needs rewrite or deletion) | None (Playwright boilerplate) | Pass | Delete (boilerplate code). |
| `fonts.spec.ts` | a) Implementation-independent (should still pass, e.g., layout-fit.spec.ts) | Global / Fonts | Pass | Keep. |
| `layout-fit.spec.ts` | a) Implementation-independent (should still pass, e.g., layout-fit.spec.ts) | Global / Layout Fit | Pass | Keep (invariant net). |
| `responsive.spec.ts` | b) Asserts old Canva structure or cryptic IDs that no longer exist (needs rewrite or deletion) | Global / Mobile Layout / Hero | Fail | Rewrite to use semantic locators instead of `.animated` class. |
| `runtime-health.spec.ts` | a) Implementation-independent (should still pass, e.g., layout-fit.spec.ts) | Global / Console / Images | Pass | Keep. |
| `section-screenshots.spec.ts` | c) Pixel/DOM-fingerprint snapshot goldens (needs deliberate re-baseline) | All Sections (Visual) | Fail | Deliberate re-baseline after sections are fully rebuilt. |
| `text-visibility.spec.ts` | b) Asserts old Canva structure or cryptic IDs that no longer exist (needs rewrite or deletion) | Hero, Expertise, Testimonials | Fail | Rewrite without Canva IDs/classes or delete. |
| `track-c-header-fidelity.spec.ts` | b) Asserts old Canva structure or cryptic IDs that no longer exist (needs rewrite or deletion) | All Section Headers | Fail | Rewrite to use semantic headers instead of Canva IDs. |
