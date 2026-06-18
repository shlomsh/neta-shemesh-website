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

## MEASURED: header font-size drift (ours vs template, same Canva IDs)
Template shares our exact Canva IDs → measured the same elements on both servers.

**Desktop @1280 (px):**
| Card | id | OURS | TEMPLATE | Δ |
|---|---|---|---|---|
| Hero | yWav… | 63.4 | 56.2 | +7 (ours bigger) |
| About-Intro | GDq… | 49.3 | 56.2 | **−7 (ours smaller)** |
| About-Light | YoSfu… | 31.0 | 22.5 | +8 |
| Reignite | JkkbI… | **68.0** | 56.2 | +12 — UNGOVERNED (Elamy), oversized |
| SafeSpace | vyK… | 49.3 | 56.2 | −7 |
| HowItWorks | pEc… | 49.3 | 56.2 | −7 |
| SuccessStories | eIrs… | **31.0** | 56.2 | **−25 (half size!)** |
| Testimonials | Dct… | 49.3 | 56.2 | −7 |
| Scheduling | iVt… | **31.0** | 56.2 | **−25** |
| CoupleTherapy | T749… | **31.0** | 56.2 | **−25** |
| Contact-Follow | ZgJ… | 49.3 | 56.2 | −7 |
| Contact-Office | zNS… | 49.3 | 56.2 | −7 |

**Mobile @375 (px):** ours hero 34 / section 28 / sub 22; template varies (GDq 54, pEc 54, others ~30, YoSfu 18, hero 31).

### Key findings
1. **Template renders almost all headers at ~56px (near-uniform) on desktop**; our Track-A tiers split them into 63/49/31. Our **sub-headers (31px) are ~half the template size** — this is the "too small" the user saw (esp. SuccessStories / Scheduling / CoupleTherapy, all 31 vs 56).
2. This confirms the user's earlier instinct that the "section titles should look the same" — **the template makes them the same (~56px)**; our tiering diverged them.
3. **`#JkkbI` (Reignite) is 68px + wrong font (Elamy)** — ungoverned outlier; bring into the header system.
4. `left` positions differ mostly due to **RTL mirroring** (template is the English LTR original) — NOT real drift. Compare widths/sizes, not left.

### ⚠️ Decision to surface for the QA round
Our Phase-4 `clamp()` maxes (49/31) are **smaller than the template's ~56**, so matching the template means **raising the section/sub-header sizes toward ~56 and reducing the tier spread** (closer to the template's near-uniform headers). This *revisits* the header sizes — distinct from the earlier "keep the cap" decision (which was about not *growing* on wide screens). Needs user sign-off before changing. The template's per-element Canva scaling is idiosyncratic; aim for a clean consistent scale ≈ template, not a literal match.
