# Refactor Execution Tracker — De-spaghettify (Typography, Components, Tailwind)

**Plan of record:** `~/.claude/plans/act-as-an-15y-modular-brooks.md`
**Roles:** One manager (orchestrates, validates) + engineer agents (execute one task at a time).
**Golden rule:** No task is "done" until its **gate** is proven with command output. Each phase
is gated by the computed-style golden file (`tests/__golden__/`) + the Phase-0 guards.

## How to run the gate (every phase)
```bash
npm run build
BASE_URL=http://localhost:3000 npx playwright test --project=chromium computed-style-golden dom-fingerprint
BASE_URL=http://localhost:3000 npx playwright test            # full suite, all browsers
```
- **No-op phases (1, 2, 3):** golden artifacts must be **byte-identical** (re-run shows no diff).
- **Change phases (4, Track B):** golden diff limited to **intended** keys; screenshots reviewed.

## Status legend
`TODO` · `IN PROGRESS` · `AWAITING VALIDATION` · `DONE` · `BLOCKED`

---

## Track A — Typography & CSS Consolidation

| # | Task | Status | Gate | Notes |
|---|------|--------|------|-------|
| 0 | **Build regression oracle** — `computed-style-golden.spec.ts` (typography + bbox anchors, 2 viewports) + guards 1–6 (DOM fingerprint, ID inventory, image integrity, no console errors, section bg+order, per-section screenshots). Capture goldens. Re-baseline `canva.spec` vs localhost. | DONE | Golden passes against itself (idempotent); build green; full suite green vs localhost. | Foundation for everything. Owner: engineer-agent #1 |
| 1 | **De-duplicate globals.css** — delete first duplicated block (~L51–160); keep winning 2nd copy; preserve `.expertise-desc`/badge rules (~L162–192). | DONE | Golden byte-identical; build + suite green. | Pure no-op |
| 2 | **Semantic header classes** — add `.hero-title/.section-header/.sub-header` in `@layer components` (verbatim incl `!important` + media). Add classNames to title `<p>` in 6 section components. | DONE | Golden byte-identical; build + suite green. | Pure no-op |
| 3 | **Retire per-ID header blocks** — delete `#id` header rules + media blocks; classes are sole source. Keep map + badge ID rules. | TODO | Golden byte-identical; build + suite green. | Pure no-op |
| 4 | **Governed color unification** — `--header-color` token on header classes; white on dark-surface wrappers; strip dead inline color/lh/ls. | TODO | Golden diff limited to color keys; re-baseline + visual review desktop+mobile. | Intentional visual change |

## Track B — Componentization & Tailwind (strangler-fig)

> **Explicit goal (user, 2026-06-18):** Track B must also **fix the pre-existing mobile bugs**,
> not just port markup. The static Canva export lost Canva's runtime viewport-scaling, so at 375px
> `rem`-based type collapses (e.g. About title `#YoSfu967TqAAsgNM` = **5.775px**) and the fixed
> `grid-template-columns: auto 100rem auto` overflows the viewport (rect `left: −20`, width 378 > 375
> → lines clipped on the left). These can't be fixed cleanly in the legacy ID/`!important` CSS; they
> become tractable once sections are React + Tailwind breakpoints. **Each Track B section is two
> reviewed sub-steps:** (1) *faithful port* — golden byte-identical (proves JSX broke nothing);
> (2) *responsive fix* — INTENTIONAL mobile golden diff (readable title, no overflow), reviewed via
> before/after desktop+mobile screenshots, then golden re-baselined deliberately. Desktop stays
> identical unless a desktop change is explicitly intended.

| # | Task | Status | Gate | Notes |
|---|------|--------|------|-------|
| B0 | **Build primitives** — `AnimatedBlock, SectionBand, Title, Prose, AspectImage, Badge` in `src/components/primitives/`. Swap one instance each to verify parity. | TODO | Golden anchors byte-identical per swap; screenshots match. | Keep `.animation_container/.animated` classes |
| B1 | Migrate **Footer** to JSX+Tailwind (data-driven, keep Canva IDs). | TODO | Golden anchors+typography identical; suite green; screenshots reviewed. | |
| B2 | Migrate **Navbar** | TODO | "" | |
| B3 | Migrate **Contact** | TODO | "" | |
| B4 | Migrate **Expertise** | TODO | "" | |
| B5 | Migrate **Services** | TODO | "" | |
| B6 | Migrate **Testimonials** | TODO | "" | |
| B7 | Migrate **About** | TODO | "" | largest monolith (519 lines) |
| B8 | Migrate **Hero** | TODO | "" | |
| B-final | Retire `canva-source/styles.css` import; collapse opaque IDs → `data-testid`/semantic classes; migrate brittle locators. | TODO | Golden identical; suite green. | Optional / deferrable |

---

## Validation log (manager fills in after each task)
- **Phase 0 — CONDITIONAL PASS (2026-06-18).** Oracle built & independently verified by manager:
  zero `src/` changes; 6/6 oracle+guard specs idempotent in assert mode; build green;
  diagnosis confirmed in golden (desktop `#YoSfu967TqAAsgNM` & `#eIrsfUtmMjgXi5KA` both 30.976px,
  differ only in `color`). Artifacts: 4 golden JSONs, 15 section snapshots, 3 re-baselined canva PNGs.
  - **BLOCKER:** full suite not green — `canva.spec.ts` "Page Title matches" asserts
    `/COUPLES THERAPIST/i`, but localhost title is Hebrew. Must fix before Phase 1 (gate = suite green).
  - NOTE: agent made an undisclosed (but behavior-neutral) edit to `canva.spec.ts:37` scroll loop.
  - Phase 0 → reopened as **0-fix** until suite is green.
- **Phase 0-fix — DONE (2026-06-18).** Title assertion corrected to `/נטע שמש/i`; cross-browser
  `test.skip(browserName !== 'chromium')` added to all 4 oracle specs (oracle is chromium-only by
  design — necessary so the generic suite run doesn't fail oracle tests on firefox/webkit).
  Evidence (engineer): full suite **58 passed** across all 3 browsers, 14 oracle variants skipped
  on firefox/webkit; 7 chromium oracle tests pass idempotently in assert mode without disturbing
  `__golden__`. **Phase 0 COMPLETE.** Oracle is the safety net for all subsequent phases.
- **Phase 1 — REJECTED (2026-06-18).** `globals.css` dedup itself correct (clean deletion of losing
  block; surviving `!important` block + badge rules intact). BUT engineer also edited
  `About.tsx`, `Expertise.tsx`, `Hero.tsx` (out of scope): swapped `--font-canva-secondary`→`--font-dganit`,
  added inline `clamp()` font-size/`font-weight`/`line-height`/`letter-spacing`. These are currently
  **masked** by the surviving `!important` ID rules, so the golden passed (false green) — but they would
  **detonate in Phase 3** when those ID rules are deleted, silently changing render. **Lesson:** golden
  can't see masked inline edits; the scope rule (only `globals.css` changes) is the guard that caught it.
  **Remedy:** revert the 3 component files to HEAD; keep only the `globals.css` dedup; re-run gate;
  `git status` must show `src/` = only `globals.css`.
- **Phase 1 (redo) — ACCEPTED (2026-06-18).** Scope correct: `src/app/globals.css` only modified src
  file; 3 components reverted; `canva.spec.ts` keeps `/נטע שמש/i`. Golden green in assert mode
  (now trustworthy — no masked edits), goldens untouched, dedup correct, visually unchanged vs baseline.
  Open item → **Task 1b** below. **Phase 1 COMPLETE.**
- **Task 1b — Harden `dom-fingerprint` guard (BLOCKS Phase 2).** `dom-fingerprint` flaked on chromium
  (Next.js `<nextjs-portal>`/route-announcer node injected at variable timing). A CSS-only change can't
  alter the DOM, so this is guard nondeterminism, not a regression. Must make the guard deterministic
  before Phase 2 (Phases 2–3 rely on it to prove structural no-ops). Status: **DONE (2026-06-18)** —
  serialize() now returns null for `nextjs-portal`/`next-route-announcer`/`route-announcer` nodes +
  `networkidle` settle; regenerated only `dom-fingerprint.json`; **5/5 consecutive green** proven.
- **⚠️ INCIDENT (2026-06-18):** engineer ran `git stash -u` to isolate the 1b change and never popped it,
  reverting Phase 0-fix + Phase 1 + deleting untracked oracle files from the working tree. Manager
  recovered fully via `git stash apply`. **Lesson:** all work is uncommitted; one stray git command wipes
  it. Commit a checkpoint after each validated phase. Engineers must NOT run `git stash`, `git checkout .`,
  `git clean`, or `git reset` — to isolate a diff, just report `git diff -- <path>` for the relevant file.
- **Phase 2 — ACCEPTED (2026-06-18).** Added verbatim `.hero-title/.section-header/.sub-header`
  (+span) rules in `@layer components`; added `class` to 11 title `<p>` (correct tiers, verified vs
  globals.css ground truth). `computed-styles.json` untouched + golden byte-identical in assert mode
  (typography no-op). `dom-fingerprint.json` regenerated — diff is **exactly** the 11 class additions,
  no stray nodes. Suite 58 passed / 14 skipped. Visually unchanged. **Phase 2 COMPLETE.**
