# Track C — Template Fidelity QA (punch-list)

**Goal:** close the size/spacing/margin drift between our build and the original Canva template.
**Status:** prep (seeded while Track B card faithful-ports are in flight). Full pass runs AFTER Track B.

## Ground truth & method
- **Template (reference):** `reference/template/.../couples-therapist` → served on **:8899** (`launch.json` config `template`).
- **Our build:** **:3000**.
- Compare each section at **desktop 1280** and **mobile 375**, matched viewports. Capture both screenshots; measure title font-size, title position, body column width/position, image/card sizes, inter-element spacing, section vertical rhythm, and side margins.
- Drift fixes are **intentional, reviewed** changes — re-baseline goldens (`computed-styles`, `dom-fingerprint`, `section-screenshots`) deliberately per fix. (Track B faithful-ports preserve the *current* drifted state; this round closes the gap.)

## Resolved / not QA items
- **Header font face:** NOT a bug. Dganit contains Hebrew glyphs (canvas glyph-width test: dganit width ≠ cursive/serif/sans generics). The cursive look is the intended brand script. Leave as-is.
- **Header size cap (Phase 4 `clamp()` max):** KEPT per user — headers intentionally don't grow on wide screens like the template's unbounded Canva scaling. QA does **not** raise the cap; tune spacing/margins only.

## Per-section drift checklist (fill during the QA round)
Sections (top→bottom): Hero · About-Intro-Dark · About-Light · Reignite · SafeSpace · HowItWorks · SuccessStories · Testimonials · Scheduling · CoupleTherapy · Contact-Follow · Contact-Office · Footer

| Section | Title size/pos | Body width/pos | Image/card size | Vertical rhythm | Side margins | Notes |
|---|---|---|---|---|---|---|
| (to measure) | | | | | | |

> Flagged by user as visibly off (Testimonials): title size + overall spacing/margins read smaller/tighter than the template. Start measurement here.
