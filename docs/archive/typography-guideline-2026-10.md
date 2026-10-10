# Typography Guideline — October 2026

> **History:** the audit sections below describe the pre-migration state (legacy `.section-header` / `.hero-title` / `.sub-header`, ad-hoc sizes); they are kept as the record of why and no longer match the code.

**Status: IMPLEMENTED 2026-10-09 — decisions: 1B Roboto Condensed, 2A Elamy 700 headings, 3B Elamy numerals, 4A hero 72, 5 approved.**

The sections below are the original 2026-10-08 audit and proposal, kept as the record of why. Where they disagree with `CLAUDE.md`, `CLAUDE.md` wins.

Decisions (all resolved, see status):

1. **Companion font** for Latin text and digits (proposed: Roboto Condensed; alternate: IBM Plex Sans Condensed).
2. **Elamy heading weight:** 400 (A, matches documented direction) or 700 (B, amend CLAUDE.md).
3. **Step numeral face:** `.type-display` Elamy 400, or `.type-title` Stanga 700.
4. **Hero H1 maximum:** 72px (current) or 88px (`.type-display` as defined).
5. **Approve the element mapping** in section 4.

Source: read-only audit of the running site, 2026-10-08.

---

## 1. What renders today

### Faces

`src/app/fonts.ts` declares, via `next/font/local`:

- `--font-stanga` = `"stanga", "stanga Fallback"`
- `--font-elamy` = `"elamy", "elamy Fallback"`
- `--font-display` = Elamy stack + `cursive`
- `--font-body` = Stanga stack + `sans-serif`

Both `* Fallback` faces are next/font-generated `local("Arial")` with metric overrides, so any Latin text renders in Arial.

Loaded weights: Elamy 400 + 700; Stanga 300 (never used), 400, 700.
Glyph coverage: Stanga has Hebrew, digits, `@`, `₪` and punctuation, but **no Latin A–Z/a–z and no ©**. Elamy has Latin, digits and punctuation.

Four faces actually render on the home page:

| Face | Where |
|---|---|
| Stanga | All Hebrew text and digits |
| Elamy | Titles, quotes, footer |
| Arial (the "stanga Fallback") | Email local part and domain, "M.S.W.", © |
| system-ui (.SF NS / Segoe / Roboto) | The "01."–"04." step numerals (`font-sans`), and the "@" in the email |

### Sizes, weights, spacing

- **21 distinct font sizes** (14 on desktop, 12 on mobile) against a 9-step scale.
- Weights in use: 400 / 700 / **900** (plus 600 in the blog eyebrow, which resolves to the Stanga 700 face anyway).
- About 16 distinct letter-spacings and 12 line-height ratios.
- 20 distinct (family, size, weight) combos on desktop, 18 on mobile.
- Mobile: 12 step-bullet instances at **13px**, below the 14px floor in CLAUDE.md (`StepBullets.tsx:11`).
- The blog adds `type-read` (20–23), `type-read-lead` (22–28), and Arial in "עו״ס" and "→".

Stray sizes and where they come from:

| Size(s) | Source |
|---|---|
| 13 | `StepBullets.tsx:11` |
| 14 | `type-small` min; `HeroNav.tsx:108`; `CardLabel.tsx:25`; `FooterCopyright.tsx:7`; `ButtonLink.tsx:45` (sm) |
| 14.5 / 16.5 | `.contact-email-link`, `globals.css:278` |
| 17.92 | `Testimonials.tsx:135` |
| 18.67 / 20.48 | `[data-body-large]`, `globals.css:119`; used by `ContactDetails.tsx:37,65` |
| 20 | `HeroNav.tsx:109` and `ButtonLink.tsx:45` (`md:text-[20px]`) |
| 28 | `.section-header` min, `globals.css:143` |
| 32 | `text-[clamp(24px,3vw,32px)]` at `About.tsx:127,132,292`; `Services.tsx:71`; `Expertise.tsx:30` |
| 34 / 37.12 | `FooterBrand.tsx:8` |
| 48 / 72 | `HeroHeading.tsx:27` (min / max) |
| 56 | `.section-header` max; `Footer.tsx:32`; numeral min |
| 84 | `StepNumber.tsx:9`, `clamp(56px,9vw,84px)` |

### Desktop render groups

| Count | Face | Size / weight | Source |
|---|---|---|---|
| 16 | Stanga | 16 / 400 | Step bullets `clamp(13px,1.4vw,16px)`, copyright |
| 10 | Elamy | 56 / 700 | `.section-header` H2s |
| 7 | Stanga | 20 / 700 | Nav links, hero CTA, header pill |
| 5 | Stanga | 32 / 400 | `type-quote` plus `clamp(24px,3vw,32px)` override (About, Services, Expertise) |
| 5 | Stanga | 22 / 400 | `type-lead` |
| 5 | Stanga | 30 / 700 | `type-card-title` (credentials) |
| 4 | Stanga | 18 / 700 | Expertise card labels |
| 4 | system sans | 84 / 900 | Step numerals |
| 4 | Stanga | 24 / 700 | Step titles `clamp(18px,2.4vw,24px)` |
| 3 | Elamy | 24 / 400 | `type-quote` (About QuoteBlock: Elamy at running-text size) |
| 3 | Stanga | 16 / 700 | Buttons |
| 2 | Elamy | 72 / 700 | Hero H1 |
| 2 | Stanga | 22 / 700 | `strong` inside lead |
| 2 | Stanga | 20.48 / 700 | Address and phone (`data-body-large`) |
| 1 | Stanga | 24 / 400 | Hero subtext |
| 1 | Arial + Stanga | 30 / 700 | Credential "M.S.W." |
| 1 | Stanga | 17.92 / 400 | CTA-band paragraph `clamp(16px,1.4vw,22px)` |
| 1 | Stanga + Arial + system | 16.5 / 700 | Email |
| 1 | Elamy | 56 / 400 | Footer tagline |
| 1 | Elamy | 37.12 / 400 | Footer brand |
| 1 | Stanga + Arial | 16 / 400 | Copyright |

Mobile highlights: Elamy 28/700 headers; Stanga 14/700 nav pill, buttons and labels; system sans 56/900 numerals; Elamy 18/400 `type-quote`; Stanga 18.67/700 address and phone; email 14.5/700.

### The `.type-*` classes (`globals.css:190–276`) versus the docs

| Class | CSS today |
|---|---|
| `type-display` | Elamy 400, clamp(40, 9vw, 88), lh 1.05 |
| `type-title` | Elamy 400, clamp(30, 5vw, 52), lh 1.15 |
| `type-card-title` | Stanga 700, clamp(22, 3vw, 30), lh 1.25 |
| `type-quote` | **Elamy** 400, clamp(18, 2vw, 24), lh 1.5 |
| `type-lead` | Stanga 400, clamp(18, 2vw, 22), lh 1.6 |
| `type-body` | Stanga 400, clamp(16, 1.6vw, 18), lh 1.65 |
| `type-small` | Stanga 400, clamp(14, 1.3vw, 16), lh 1.5 |
| `type-read` (blog) | Stanga, clamp(20, 5vw, 23), lh 1.8 |
| `type-read-lead` (blog) | clamp(22, 5.6vw, 28), lh 1.65 |
| `type-eyebrow` | Stanga 600, clamp(13, 1.2vw, 14), uppercase, tracking .08em |
| `type-signature` | Elamy 400, clamp(32, 5vw, 56) |

Problems:

- **`.type-quote` contradicts CLAUDE.md** (documented as Stanga 24–32px; CSS is Elamy 18–24px). It lands on Stanga in About/Services/Expertise only because `BodyText` or explicit `font-[family-name:var(--font-stanga)]` utilities beat it. The real Elamy `type-quote` shows in QuoteBlock, blog pull-quotes and the hidden QuoteText.
- `type-display`, `type-title`, `type-signature` are **never used**. Headings use legacy `.hero-title` / `.section-header` / `.sub-header` (`globals.css:123–144`, `!important`, Elamy 700, lh 1.2em, clamps 34/63, 28/56, 22/31).
- `[data-body-large]` (`globals.css:118–121`) forces `clamp(18.67px,1.6vw,22px) !important` and 700 `!important`. It is deprecated in CLAUDE.md but still used.
- `type-eyebrow` is blog-only and its 600 weight resolves to the 700 face. `type-lead` is used about 12 times, `type-quote` about 9.
- `Testimonials.tsx:135` uses `font-[var(--font-stanga)]` without `family-name:`; it works only by inheritance.
- Stanga 300 is declared and unused.

### Cause of each owner observation

| Observation | Cause (file:line) |
|---|---|
| Step numeral "01." looks wrong | `StepNumber.tsx:9`: `font-sans font-black` at 56–84px resolves to the system UI sans at weight 900. Both brand fonts have digits. |
| Nav / CTA look condensed and stencil-like | Stanga Bold itself at 20px with tracking 0.047em (`HeroNav.tsx:104–111`). Buttons add `uppercase` and `tracking-[0.138em]` (`ButtonLink.tsx:41,45`); uppercase does nothing for Hebrew and wide tracking breaks word shapes. The nav clamp is dead above `md`. |
| Phone looks monospace | Stanga's narrow tabular digits with slashed zero, bold, tracked .138em in pills; 20.48px bold in Contact via `data-body-large` (`ContactDetails.tsx:65–66`). |
| Email renders in Arial | Stanga lacks Latin; `stanga Fallback` is local Arial. The "@" is forced to `font-sans` (`ContactDetails.tsx:93,98`; `globals.css:278`). Size 16.5px vs 20.48px siblings. |
| Address looks heavy | `data-body-large` on `ContactDetails.tsx:37,65` (deprecated per CLAUDE.md; stale doc comment at `BodyText.tsx:19–26`). |
| Paragraph sizes are inconsistent | 13, 14, 16, 16.5, 17.92, 18, 20.48, 22, 24, 32 across `StepBullets`, copyright, `Testimonials.tsx:135`, `HeroSubtext`, `ContactDetails`, `About.tsx:167–179` (5 bio paragraphs all `type-lead`), and blush-card overrides. |

---

## 2. Proposed rules

1. **Two families plus one Latin/digit companion.** Elamy (`--font-display`): titles, signature and footer lines only. Stanga: everything else. Companion: **Roboto Condensed** (Google Fonts, OFL), 400 + 700, Latin subset, loaded with `next/font/google` (self-hosted, no CSP change). Alternate: IBM Plex Sans Condensed. Rejected: Heebo, Assistant, Rubik, Alef (too wide/round), Barlow Semi Condensed (too light).
   - Wiring gotcha: the stack must be `stanga, <companion>` **before** the auto-generated `stanga Fallback` (local Arial). Set `adjustFontFallback: false` on Stanga or inject the companion into the fallback list, and verify empirically.
   - Phone and email use the companion explicitly. Digits inside Hebrew running text stay Stanga.
2. **Max two weights per family.** Stanga 400/700 (drop the 300 face); companion 400/700. Remove 900 and 600.
3. **Elamy weight, decide once.** (A) Headings become `.type-title` Elamy 400 and Elamy-Bold (~29KB) is dropped: this is the documented direction but a visible change. Or (B) amend CLAUDE.md to allow Elamy 700 for H1/H2.
4. **Sizes only from the 9 `.type-*` steps.** No `text-[...]` or `clamp()` in components. Single documented exception: blog `type-read` / `type-read-lead`. No `data-body-large`, no `.contact-email-link`, no legacy heading classes once migrated.
5. **Bold only on names, card titles and CTAs.** Contact details are regular weight.
6. **Letter-spacing and line-height come from the class.** Remove `tracking-[0.012em]` on body, `tracking-[0.138em]` and `uppercase` on buttons, and `leading-*` overrides. Allowed: -0.01em on Elamy display, optional <=0.02em on eyebrow.
7. **Contrast tone rule unchanged.** Text under 24px only on dark or cream surfaces.

---

## 3. Element -> current -> proposed

| Element | Current | Proposed |
|---|---|---|
| Hero H1 | Elamy 700, 48–72 | `.type-display` (Elamy 400, 40–88; or cap at 72) |
| Section H2s | `.section-header` Elamy 700, 28–56 | `.type-title` 30–52 (weight per rule 3) |
| Hero subtext | 18–24 / 400 | `.type-quote` (24–32 / 400; owner feedback 2026-10-09: one step up) |
| Nav links | 20 / 700, tracking .047em | `.type-lead` bold (18–22), tracking 0 |
| Header pill, hero CTA, all buttons | 16–20 / 700, tracking .138em | One style: `.type-lead` bold (18–22), tracking 0 |
| Mobile menu links | 26–36 / 700 | `.type-card-title` |
| Mobile menu phone | 20 | Button style |
| About blush card (2 paras), Services intro, Expertise subtitle, gallery subtitle | `type-quote` + 24–32 override | `.type-quote` (after fix); delete overrides |
| About bio (5 paras) | `type-lead` x5 | All five `.type-lead` (owner request 2026-10-09); section still fits one screen at lg+ |
| About quote block | Elamy 18–24 | `.type-quote` (Stanga) |
| Credentials | `type-card-title` | Unchanged |
| Step numerals | System sans 900, 56–84 | `.type-display` Elamy 400 **or** `.type-title` Stanga 700 (owner choice) |
| Step titles | 18–24 / 700 | `.type-card-title` (fallback: `.type-lead` bold if too long for ~300px card) |
| Step bullets | 13–16 | `.type-small` |
| Expertise card labels | 14–18 / 700 | `.type-small` bold |
| Contact intro | `type-lead` | Unchanged |
| Address, phone | 18.67–20.48 / 700 | `.type-body` 400 |
| Email | 14.5–16.5 / 700 Arial | `.type-body` 400 in companion, including "@" |
| CTA band paragraph | 16–22 | `.type-lead` |
| Footer tagline | Elamy 24–56 | `.type-title` |
| Footer brand | Elamy 34–38 | `.type-signature` |
| Copyright | 14–16 | `.type-small` |
| Blog eyebrow | 13–14 / 600 | `.type-eyebrow` at 700 |
| Hidden testimonials | text-sm / base / `md:text-[20px]` italic | `.type-body` bold name + `.type-small` role |

Result: 21 sizes become 8–9 steps; 4 faces become 3; 3 weights become 2 per family.

---

## 4. Scale fixes

- **`.type-quote`** -> Stanga 400, `clamp(24px, 3vw, 32px)`. Fix the CSS, not the docs. Only QuoteBlock and blog pull-quotes visibly change.
- **`.type-eyebrow`** -> fixed 14px, weight 700.
- **`.type-display` max (88) vs hero (72):** decide (open decision 4).
- **Docs:** list `type-read` / `type-read-lead` as the one documented exception; state explicitly that Stanga has no Latin glyphs and that the companion covers them.
- **Cleanup list:**
  - `BodyText.tsx:19–26` stale comment.
  - `data-body-large` in `ContactDetails`.
  - `.contact-email-link` (`globals.css:278`).
  - Legacy heading classes `globals.css:123–144`.
  - `Title.tsx` (check imports first).
  - Stanga 300 face.
  - Elamy-Bold, if option (A) is chosen.

---

## 5. Suggested implementation order

1. **Foundation (`globals.css`, `layout.tsx`):** add the companion font and its fallback wiring; fix `.type-quote` and `.type-eyebrow`.
2. **Remove hacks:** `data-body-large`, `.contact-email-link`, tracking and `uppercase` on buttons.
3. **Migrate headings:** hero H1 and section H2s to `.type-display` / `.type-title`.
4. **Migrate components to scale classes:** nav, buttons, About, Services, Expertise, Steps, Contact, Testimonials, Footer, per the mapping table.
5. **Delete legacy:** legacy heading classes, `Title.tsx`, Stanga 300, and (if option A) Elamy-Bold.
6. **Update docs:** CLAUDE.md and `agents.md` (Latin note, blog exception, quote spec, Elamy weight decision).

Verify empirically after step 1 (companion actually wins over Arial) and after step 4 (no horizontal overflow at 375px, no text below 14px).
