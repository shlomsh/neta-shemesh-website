# Project Context for AI Agents

**Stack:** Next.js (App Router) · Tailwind v4 (`@theme` in `globals.css`, no `tailwind.config`) · Playwright (visual + DOM regression). Site is **Hebrew / RTL**.

---

## 1. Architecture & Guidelines

- **Next.js App Router:** This is NOT the old Next.js Pages router — APIs may differ. Read `node_modules/next/dist/docs/` before writing any code if unsure.
- **Component Structure:** Pure React functional components. All styling is done via Tailwind v4 utility classes.
- **RTL Support:** The site is Hebrew `dir="rtl"`. When positioning elements, use logical properties (`start-*`, `end-*`) where applicable, and test layouts to ensure they don't break in RTL context.
- **Animations:** Use `ScrollReveal` (framer-motion). Pass stagger delay as a prop computed on the server (`index * 0.12`). Keep parent grids/sections as server components (SEO-safe).
- **Typography:** 
  - `var(--font-canva-accent)` (Elamy): a **decorative handwriting/display** font. Use ONLY for hero/section display titles, short quotes-as-display, the logo, and signatures. **Never for body paragraphs** (it is unreadable as running text, especially RTL Hebrew — this was a real bug).
  - `var(--font-stanga)`: the clean body font — all paragraphs, body, captions, names, labels, nav, CTA.

### Responsive Type Scale (canonical — added 2026-06-20)

Sizing is centralized as fluid `clamp()` utility classes in `globals.css`. **Use these classes; do not hardcode ad-hoc `text-[..px]` / weights per section** (the original Canva-imported sizes were random — 13/15/16/18.67/28/31px with inconsistent weights). Mobile-first; body never below 16px.

| Class | Size (mobile → desktop) | Font / Weight | LH | Use for |
|---|---|---|---|---|
| `.type-display` | `clamp(40px,9vw,88px)` | accent / 400 | 1.05 | Hero title |
| `.type-title` | `clamp(30px,5vw,52px)` | accent / 400 | 1.15 | Section H2 |
| `.type-card-title` | `clamp(22px,3vw,30px)` | body / 700 | 1.25 | Card/sub headings |
| `.type-quote` | `clamp(24px,3vw,32px)` | body / 400 | 1.5 | Pull-quotes, personal statement |
| `.type-lead` | `clamp(18px,2vw,22px)` | body / 400 | 1.6 | Intro/lead paragraph |
| `.type-body` | `clamp(16px,1.6vw,18px)` | body / 400 | 1.65 | Default paragraph |
| `.type-small` | `clamp(14px,1.3vw,16px)` | body / 400 | 1.5 | Captions, attribution title |
| `.type-eyebrow` | `clamp(13px,1.2vw,14px)` | body / 600, +0.08em, upper | 1.4 | Labels/eyebrows (Latin only) |
| `.type-signature` | `clamp(32px,5vw,56px)` | accent / 400 | 1.1 | Handwritten signature |

Best-practice rules: max two weights per font family; line length ~65ch max; comfortable line-height (1.6–1.7 body, 1.1–1.2 display); build hierarchy with **size + the body/accent font split**, not by bolding everything.

### Color System & Card Rotation (locked decision — 2026-06-20)

> **2026-10-08:** palette re-tuned; the hexes and ratios below match `@theme` in `globals.css` and are canonical. The earlier #574964 / #9F8383 / #C8AAAA / #fff0e4 set is retired.

**The 4-color palette** (defined as `@theme` tokens in `globals.css`; these are the ONLY brand colors — do not introduce new hexes):

| Token | Hex | Role |
|---|---|---|
| `--color-plum` | `#7A5978` | Dark plum — dark surfaces / primary text |
| `--color-mauve` | `#C49AB8` | Mid mauve — accent / brand (`--color-brand-primary`) |
| `--color-blush` | `#ECC8CE` | Light blush — soft accent |
| `--color-cream` | `#FFF5F0` | Warm cream — light surfaces (note: `--color-white` is aliased to this cream, NOT `#ffffff`) |

**Approved background → text contrast pairs** (never deviate; WCAG 2.x, AA normal ≥ 4.5, AA large ≥ 3):

| Background | Text color | WCAG | Notes |
|---|---|---|---|
| Dark `#7A5978` | Cream `#FFF5F0` | 5.55:1 ✅ AA | strong pair (not AAA) |
| Cream `#FFF5F0` | Dark `#7A5978` | 5.55:1 ✅ AA | strong pair (not AAA) |
| Light `#ECC8CE` | Dark `#7A5978` | 3.89:1 ⚠️ | **large text only** |
| Mid `#C49AB8` | Cream `#FFF5F0` | 2.26:1 ❌ | **fails even for large text** |
| Mid `#C49AB8` | Dark `#7A5978` | 2.46:1 ❌ | fails even for large text |

Hero nav/CTA pill (`bg-brand-primary/75` mauve over plum ≈ `#B28AA8`, cream text): 2.77:1, below 3:1.

**Rule of thumb:** Dark backgrounds → cream text; Light & Cream backgrounds → dark text. **Mid has no compliant text pair** — use it for text-free surfaces/shapes only.

**Accessibility — content-aware color assignment (SUPERSEDES the earlier "bump to bold 700" rule, 2026-06-20):** We keep the exact palette hexes. Because Light only clears WCAG AA for *large* text and Mid fails it entirely, **do not force body copy bold to compensate** — that flattens typography (it ruined the About/Quote card). Instead, **assign tone by content**:
- **Paragraph- or detail-heavy cards** (running body text, small captions, contact details, forms) → **Dark or Cream** (5.55:1 AA, full type freedom at any size/weight).
- **Light** → reserved for cards whose on-surface text is **display/quote-scale only** (`.type-title` / `.type-quote`, i.e. ≥24px regular or genuinely large), or image-dominant cards with minimal text.
- **Mid** → no essential text at all (2.26:1 with cream fails even large-text AA); decorative/image-dominant surfaces only.
- Text on a nested photo/card surface (StepCard, ExpertiseCard, TestimonialCard) is judged by its *own visible* background, not the parent tone.

The legacy `[data-body-large]` bold-bump still exists in `globals.css` for cards not yet migrated, but it is **deprecated** — prefer moving the card's tone over bolding its text.

**Card background sequence:** Cards are screen-height sections. Backgrounds still progress through the palette for rhythm, but tone is chosen **content-first** (per the rule above), not by a rigid darkest→lightest cycle. The 3 **photo** cards (Hero, CTA band, Footer) keep their photographic treatment + dark overlay and sit outside the sequence. *(Worked example: the About/Quote personal-statement card moved Mid→Cream so its quote + italic attribution caption render cleanly at high contrast.)*

**Implementation mechanism (do not reinvent):**
- Background + text color are driven by a `data-bg-tone="dark|mid|light|cream"` attribute (CSS rules live in `globals.css`). The `Section` primitive (`bgVariant` prop) applies this; bespoke `<section>`s set `data-bg-tone` directly.
- When changing a card's tone, **sync its descendants' text color**: remove hardcoded `text-white`/`onDark` where the new tone needs dark text, and vice versa, so color inherits from the tone.
- `[data-body-large]` is **deprecated** — do not add it to new elements. Solve contrast via content-aware tone assignment instead.
- See `CLAUDE.md` for the full typography + color guidelines.

## 2. Client Persona & Voice

Neta Shemesh is a couple and family therapist with **14 years of clinical experience**. She is an M.S.W. clinical social worker. Her work centers on guiding people through change, crisis, and growth.

- **Tone:** Warm, calm, safe. Not clinical or cold.
- **Tagline:** "מקום בטוח לצמוח בו ביחד" (A safe place to grow together).
- **Primary CTA:** "תיאום פגישת ייעוץ" (Schedule a consultation). Channel is WhatsApp.
- **Voice Reference:** See `netta_voice.md` for extended articles written by Neta to capture her exact style.
- **Website Goal:** A marketing site that makes a warm first impression, establishes trust, explains the four service areas (Couple therapy, Family therapy, Parenting guidance, Personal accompaniment), and converts visitors into a low-friction first contact.

## 3. Test Integrity

- **Visual Regressions:** Tests catch visual regressions. Do not update goldens blindly (`UPDATE_GOLDEN=1`); if structure legitimately changed, re-baseline deliberately and prove the diff is scoped.
- **Environment Determinism:** Tests run with `reducedMotion: 'reduce'` forcing `0s` so screenshots snap to the final frame.
- **Layout Fit:** The `layout-fit` invariant (`tests/layout-fit.spec.ts`) ensures titles remain on-screen and text sizing is legible across viewports.

## 4. Known Gotchas

- **Safari WebKit Clipping:** Absolute children inside `overflow-hidden` + `border-radius` containers bleed in Safari. Use the `@utility safari-clip` class (which applies a CSS mask) on the parent container.
- **CSS Import Order:** `import "./globals.css"` must remain last in `layout.tsx` so overrides apply correctly.
- **Organic Backgrounds:** Render decorative SVGs as absolute layers (`z-0 pointer-events-none`) with content stacked `z-10`.
- **Faded Background Patterns:** To fade a background image correctly behind text, render the `<img>` at full opacity (`opacity-100`) and place an absolute background color overlay with opacity *on top* of it.

## 5. Governance & File Map

- `main` is the single source of truth. Do not commit scratch files or logs.
- Page: `src/app/page.tsx`
- Layout/CSS: `src/app/layout.tsx`, `src/app/globals.css`
- Tests: `tests/`
- Copy tone: `netta_voice.md`

---

## 0. Operating decision: Full Rebuild first, Pixel-Perfect second

We are **rebuilding** each section into clean React + Tailwind (retiring `canva-source/styles.css` and
its `rem`-poster engine), **then** doing a pixel-perfect pass against the Canva desktop template.
These are two **separate, sequential** passes. Never mix them — mixing is what caused the spiral
(§2). Do not start Phase 2 on a section until Phase 1 is committed and green.

### Phase 1 — Structural rebuild
- Delete the section's `dangerouslySetInnerHTML` blob entirely; build semantic JSX with Tailwind
  flex/grid that **reflows** (1-up mobile → multi-up desktop).
- Use the mapped CSS variables (`var(--font-canva-primary)`, `var(--color-bg-light)`, etc.).
- Animations via the **Client Leaf Pattern**: wrap small blocks in `ScrollReveal` (framer-motion),
  pass stagger delay as a prop computed on the server (`index * 0.12`). Keep parent grids/sections as
  server components (SEO-safe).
- Goal = DOM cleanliness + correct responsive structure. **Do not chase pixels.** Do **not** run
  `UPDATE_GOLDEN=1` to force green — see §3.
- A section is only "done" with Phase 1 when it **no longer depends on `canva-source/styles.css`**.
  A half-migrated section sits in two coordinate systems at once (§2) and will keep re-breaking.

### Phase 2 — Pixel-perfect match
- Compare the rebuilt section to the template (serve it on `:8899`, `launch.json` `template`) at the
  **reference desktop width (1280)** and at **375**. Measure, don't guess.
- **Pixel-match at the reference width; stay fluid below it.** Express the target as
  `clamp()`/ratios/`%`, anchored so the 1280 render equals the template. Do **NOT** hard-code raw
  Canva px (`w-[260.58px]`, `h-[341.31px]`, `mt-[170px]`) as the *layout mechanism* — fixed px
  satisfies exactly one width and re-introduces the short-blanket bug (§2). Fixed px is fine only for
  things that are genuinely constant (a border radius, a max-width cap).

---

## 1. The two AI-migration failure modes (and their fixes)

### 1a. Spatial hallucination → Deterministic pre-processing (Math pass / Syntax pass)
LLMs have no 2D rendering context. Given absolute `top/left`, they hallucinate groupings. **Never ask
the AI to do spatial math.** Split it:
1. **Math pass (deterministic Node script, e.g. `tailwind-generator.js`):** parse the HTML, read
   bounding boxes, run clustering heuristics → emit a verified hierarchical JSON
   (`section → row → card → {text,image}` nodes). Heuristics: new **section** at vertical gap >100px;
   same **row** at <20px vertical proximity; **card** = enclosing bounding box; horizontal order by
   left-coordinate (remember RTL flips reading order).
2. **Syntax pass (AI):** feed the AI the *JSON tree*, not the raw HTML. Prompt becomes "convert this
   verified layout tree into React + Tailwind," never "analyze this HTML and build a grid."

### 1b. Blind baseline overwrite → Immutable baselines + structural guards
The easy path during a DOM refactor is `npx playwright test --update-snapshots` to go green — which
silently blesses regressions as the new truth. Prevent it:
1. **Immutable Canva baselines:** keep original desktop exports in a read-only
   `tests/baselines/canva-desktop/`; configure Playwright so `--update-snapshots` can never overwrite
   that dir.
2. **DOM invariants before screenshots** — structural asserts are solid where pixel snapshots are
   fragile. Fail fast *before* the camera fires:
   ```ts
   await expect(page.locator('[id="cQd2ufFBWvr5c6ki"] .step-card')).toHaveCount(4);
   await expect(page.getByRole('heading', { name: 'איך זה עובד?' })).toBeVisible();
   ```
3. **Two-step CI approval:** a PR that modifies any `.png` under the snapshot dirs auto-gets a
   `Requires Design Review` label and is merge-blocked until a human verifies the diff.
4. **Environment determinism** (kills false-positive diffs): `reducedMotion: 'reduce'` + wrap the app
   in framer `MotionConfig`/`useReducedMotion()` forcing `0s` so screenshots snap to the final frame;
   freeze scrollbars; settle to `networkidle`; mock lazy/network so the DOM is 100% stable.

---

## 2. Why we kept spiraling (read this before "fixing layout harder")

Two **independent** axes of "wrong"; fixing one regresses the other unless you separate the passes:
- **Mechanical** — does it reflow across widths? (hard-coded Canva px fails this — the *short
  blanket*: fix mobile → desktop stagger breaks; fix desktop → mobile order/clip breaks.)
- **Fidelity** — does it match the reference? (a free-hand "fluid" rebuild fails this — you draw your
  own card, not the template's.)

Compounding causes:
- **Undecided target.** Template is dark / LTR / lorem; ours is cream / RTL / real copy. "Match the
  template" is undefinable until someone decides, per token, what transfers vs what stays ours.
- **Golden re-baseline destroys the net.** Re-snapshotting mid-rebuild makes the oracle record
  whatever rendered → it can no longer tell intended redesign from regression → no convergence signal.
- **Two coordinate systems.** While `canva-source/styles.css` is still imported, the global
  `html { font-size: vw-scaled }` `rem` engine scales everything; new Tailwind px do not. A "fixed"
  card inside a still-`rem`-scaled parent can't be reasoned about locally.
- **Shared mutable foundation.** Editing globals/a primitive ripples through every half-migrated
  section. Many consumers + mutable base = whack-a-mole.

**The unlock:** before coding a section, write a **token sheet** (measured from the template: card
aspect, gradient opacity, content alignment, number/type scale, spacing, background) and get the
human to ratify the ambiguous calls (esp. **dark-vs-cream background**, **compact-vs-tall cards**).
Then "done" is checkable. One section at a time, committed, fully off `canva-source`.

---

## 3. Test integrity rules
- Tests exist to catch **Phase 2** visual regressions. Do **not** `UPDATE_GOLDEN=1` in Phase 1 to
  force green; if structure legitimately changed, re-baseline **deliberately** and prove the diff is
  scoped (e.g. desktop golden byte-identical when only mobile changed).
- Build against a **production** server (`next start`), not dev. Beware a stale server on `:3000`
  (Playwright reuses it) — run a fresh port and point `BASE_URL` at it.
- The **layout-fit invariant** (`tests/layout-fit.spec.ts`) is implementation-independent (titles
  on-screen + `fontSize ≥ 12px` at 375/768/1280) — it must stay green through any rebuild. The old
  `responsive.spec.ts` only checks document `scrollWidth`, which `main{overflow:hidden}` **masks** —
  it does not catch left-edge clipping. Trust `layout-fit`, not just `responsive`.
- `toBeVisible()` treats `opacity:0` as visible. For fade-ins assert `toHaveCSS('opacity','1')`.

---

## 4. Hard-won technical gotchas (do not relearn these)

**Layout / CSS**
- **`rem` viewport-scaling invariant.** Canva builds on `1rem = min(1vw,13.66px)`, so the
  `auto 100rem auto` grid is meant to equal the viewport. Two breaks caused the mobile clipping:
  (a) `globals.css` had `--rfso: 1.1` — `--rfso` multiplies the *html* font-size, inflating every rem
  10% → `100rem ≈ 110vw` → overflow. Keep only `--bfso: 1.1` (scales *body text* only, safe).
  (b) the lost runtime that sets `--sbw`/`--minfs`/`--rzf` — restored in
  `src/components/ViewportScale.tsx`. Relevant only while `canva-source/styles.css` is still imported;
  once a section is fully rebuilt it no longer depends on this.
- **`rem` utilities are silently coupled to the vw-engine — rebuilt sections must use px/clamp, not
  Tailwind `rem` spacing.** `styles.css` sets `html { font-size: max(min(1vw,13.66px)·rfso, minfs) }`
  and `globals.css` never resets it, so *every* Tailwind `rem` utility (`py-32`, `gap-6`, `max-w-6xl`,
  `text-*`) is scaled by the Canva engine — at 1280, `1rem ≈ 12.8px`, not 16px. A section can be fully
  structurally rebuilt (no SectionBand, no inline `gridArea`, no `rise-*`) and *still* be rem-coupled
  this way — being off the grid is **not** the same as being off `styles.css`. So a "clean" rebuild
  built with `rem` classes will jump **~+25%** the moment `styles.css` is removed. Build rebuilt
  sections in `px`/`clamp()`/`%` so they're immune to the final `html` font-size flip. (The Services
  rebuild violates this — it uses `py-32`/`max-w-6xl` and will need re-tuning at cutover.)
- **Removing `styles.css` is a single atomic *final* step, not a per-section action — and it has a
  hard ordering constraint.** The `SectionBand` sections (the `auto 100rem auto` grid) *require* the
  vw-rem engine so that `100rem == 100vw` instead of `1600px`; you cannot reset `html` to 16px while
  any of them still exist or they overflow massively. Therefore: migrate **every** SectionBand section
  off the grid first, *then* in one commit — remove the `import "../../canva-source/styles.css"` line,
  add `html { font-size: 16px }` to `globals.css`, delete `ViewportScale.tsx`, and re-tune/convert any
  surviving `rem` dimensions. A section being "off `styles.css`" individually is necessary but the
  import itself only drops at the very end. (State as of this writing: Services is structure-clean but
  rem-coupled; Testimonials is least-migrated (4 raw blobs); Footer/Hero/Contact/About/Expertise are
  JSX-ported but still SectionBand + inline `gridArea` + `rise-*` — transcribed, not migrated.)
- **`font-synthesis: none`** is set globally → `font-black`/bold does **nothing** on fonts without a
  real heavy weight (Stanga). Card numbers rendered as thin outlines until forced to a real sans
  (`font-family: ui-sans-serif…`). Pick a font that actually ships the weight.
- **CSS import order:** `import "./globals.css"` **last** in `layout.tsx` so our overrides win against
  Canva's high-specificity `styles.css`.
- **Organic backgrounds:** render decorative SVGs as absolute layers (`z-0 pointer-events-none`) with
  content stacked `z-10`. Watch `overflow-hidden` cropping circular avatars.
- **Tailwind v4 clamp() limits:** `text-[clamp(...)]` fails silently in v4 if it doesn't map directly to a recognized length/size token, causing it to fall back to browser default sizes (e.g., `24px` for an `h2`). When needing fluid text, rely on defined CSS classes (like `.section-header` in `globals.css`) rather than inline arbitrary clamp utilities.
- **Playwright BASE_URL Gotcha:** If Github Actions runs `BASE_URL=http://localhost:3000 npx playwright test` but the next server isn't already running in the background, Playwright's `webServer` block will automatically spin it up. However, if tests fall back to `https://kromaticdesignstudio.my.canva.site` when `process.env.BASE_URL` is empty locally, you will get confusing title mismatches. Always run `npm run start` explicitly or ensure `BASE_URL` is passed correctly in local environments.
- **RTL Positioning:** This site runs with `dir="rtl"`. When positioning absolute elements (like Quote Icons), always verify logical placement. A `left-[32px]` utility places an element on the opposite side of the text in RTL. Use logical properties (`start-*`, `end-*`) or explicitly map `right-[32px]` for top-right anchors.
- **Canva Faded Background Pattern:** To fade a background image correctly behind text, render the `<img>` at full opacity (`opacity-100`) and place an absolute `bg-[var(--color-canva-dark)] opacity-30` overlay **on top** of it. Lowering the image opacity against a solid dark background layer *behind* it will cause the image to disappear.
- **LCP & Lazy Loading:** Never use `loading="lazy"` on the Hero background image. The Hero image is typically the Largest Contentful Paint (LCP) element; lazy loading it severely degrades performance metrics. Use `loading="eager"`.

**React / Next**
- If you still use `dangerouslySetInnerHTML` (legacy/transition only): **never** regex `class=`→
  `className=` inside the raw string — React wants literal `class=`; converting it yields
  `classname="…"` and strips all styling + breaks `querySelectorAll`.
- **Strangler-fig bug:** never close a `dangerouslySetInnerHTML` tag *inside* a parent grid container —
  the browser auto-closes the parent div and destroys the grid context. Extract the parent grid to
  pure JSX first, then place cleanly-closed `dangerouslySetInnerHTML` siblings inside it.
- **Never** wrap `<link>`/`<head>` manually in `layout.tsx` — it overrides Next's head injection and
  kills `globals.css`/Tailwind/hydration. Use `import` / Metadata API.
- **Pulse bug:** Canva injects `"animation":"pulse …"` inside JSON style objects; when stripping, match
  the quoted JSON key/value, not raw CSS.

**Animations**
- Two systems exist: legacy CSS (`.animation_container`/`.animated` + `ScrollAnimator.tsx`) and the new
  framer-motion `ScrollReveal`. Phase-1 rebuilds use `ScrollReveal`. If touching `ScrollAnimator`: it
  waits **500ms** before attaching the IntersectionObserver (absolute elements stack at `top:0` on the
  first frame → without the delay every animation fires at once); and it batches intersecting elements,
  sorts by `boundingClientRect.top`, and assigns increasing `animationDelay` (+150ms) to recreate
  Canva's waterfall.

**Fonts / Build**
- **Canva font obfuscation:** font-families are random IDs (`YAErUQDw3VY-0`). Don't guess a Google
  font — parse the original `.woff2` with `fontkit`/`fonttools` for the real name, and rely on the
  mapped CSS variables (`--font-canva-primary` etc.), not new web fonts.
- **Vercel:** Canva CSS has hundreds of `url(fonts/…)`; `public/fonts` is gitignored → Webpack crashes
  with `Module not found`. Strip broken font URLs (`sed`) before importing. **Never** run Playwright in
  the Vercel build (no Chromium deps) — E2E runs in GitHub Actions only.

---

## 5. Governance (process learnings — these prevented lost work)
- **Manager owns all git/branch/worktree ops.** Engineers edit + test only. `main` is the single
  source of truth; commit a **checkpoint after each validated section**.
- **No destructive git** by engineers: never `stash` / `checkout .` / `clean` / `reset` / switch or
  create branches. To isolate a diff, report `git diff -- <path>`. (Prior incidents wiped all
  uncommitted work via a stray `stash -u` / branch op.)
- **No scratch files in commits.** Keep `qa_*.png`, `*.log`, one-off codemods (`replace.js`) out of
  the tree (gitignore or delete) — they leaked into `ac53cd7`.
- Goldens can't see **masked inline edits** (an out-of-scope inline style hidden behind an
  `!important` rule passes the golden, then detonates later when that rule is removed). The scope rule
  ("only the intended files changed") is the guard that catches this — keep changes scoped.

## File map
- Generator (math pass): `tailwind-generator.js` · Page: `src/app/page.tsx` · Layout/CSS:
  `src/app/layout.tsx`, `src/app/globals.css` · Viewport scaling: `src/components/ViewportScale.tsx`
- Animations: `src/components/ScrollAnimator.tsx` (legacy), `src/components/ui/ScrollReveal.tsx` (new)
- Primitives: `src/components/primitives/` · Sections: `src/components/layout/`
- Tests: `tests/` · Goldens: `tests/__golden__/` · Template ground truth: `reference/template/…`
- Copy tone: `netta_voice.md`
- **Deployment: `docs/deployment.md`** — the site ships to Vercel *and* Azure SWA
  from the same commits, switched by `BUILD_STATIC_EXPORT` and
  `NEXT_PUBLIC_SITE_URL`. Read it before touching `next.config.ts`,
  `public/staticwebapp.config.json`, canonical URLs, or anything image-related:
  the two hosts hold the same header policy in two files that drift silently,
  and the Azure copy must stay non-indexable. `npm run compare:deploys` checks
  that they still agree.
