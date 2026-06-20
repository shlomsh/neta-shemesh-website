# QA Brief — Visual Gap Mapping: Our Build vs. Canva Template

**You are a QA engineer.** Your job: visually compare our rebuilt site against the original Canva
template, section by section, at multiple widths, and **log every visual gap** as a bug in
`docs/QA_BUGS.md`. You do NOT fix code — you find, measure, screenshot, and record. The dev team uses
your list to drive the pixel-perfect (Phase 2) pass.

## The two servers (both already running)
| What | URL |
|------|-----|
| **Our build** (Next/React/Tailwind rebuild) | http://localhost:3000 |
| **Template** (original Canva export — ground truth) | http://localhost:8899 |

If a server is down: template → `python3 -m http.server 8899 --directory reference/template/kromaticdesignstudio.my.canva.site/couples-therapist`; our build → `npm run build && PORT=3000 npm run start` (use a fresh port if 3000 is busy, and note it).

## Use VISUAL tools (this is a visual audit, not a code read)
- **Browser DevTools device toolbar** (Cmd+Shift+M in Chrome) — set exact widths.
- **Screenshots** at each width for both servers; place them **side by side** to spot gaps. Save shots
  under `/tmp/qa/<section>-<width>-{ours,template}.png` (keep them OUT of the git tree).
- **DevTools element inspector / computed styles** — measure real numbers when something looks off:
  box width/height, padding, gap, font-size, line-height, color, border-radius, opacity.
- **Ruler/overlay** (DevTools "Show rulers", or an overlay/diff extension) to compare proportions.
- Toggle reduced-motion off so you can also judge animations/stagger.

## Widths to check (every section, both servers)
- **1280** — the reference desktop width. This is where look & feel must MATCH.
- **768** — tablet / mid reflow.
- **375** — mobile. Here we judge *clean reflow* (no clipping, readable type ≥12px, sane stacking),
  NOT pixel-match to the template.

## Important context (so you log the RIGHT gaps)
- The template is **LTR + English lorem**; our site is **RTL + real Hebrew copy**. So **text content,
  language, and reading direction differences are EXPECTED — do NOT log those.** Log *layout, spacing,
  proportion, type scale, color, gradient/opacity, card shape/aspect, background treatment, alignment
  (mirrored for RTL), stagger/animation* gaps.
- Two sections are being **actively rebuilt right now** (Footer, Services). Still audit them, but tag
  those bugs `[rebuild-in-flight]` so we don't double-handle.
- Judge fidelity at **1280**. Below that, only flag genuine breakage (clipping, overlap, unreadable).

### RECENT FINDINGS (Pay specific attention to these!):
- **Cross-Section Typography Hierarchy:** We discovered that different sections (e.g., "How It Works?" vs "What We Can Work On") might use the exact same base font sizes in the original Canva template. When measuring font sizes, verify if Canva treats these titles identically. If so, flag any deviations in our app where one title has been artificially made larger than another.
- **Element Misplacement (e.g., Header vs Hero):** Pay close attention to the structural location of UI elements. For example, the phone number CTA button (`+01 234 5678 90`) might belong in the sticky Header navigation, but was erroneously placed inside the Hero body in our app. 
- **Mobile Vertical Spacing (Empty Space):** Scrutinize the vertical padding and flexbox alignment, especially in the Hero section on mobile (375px). Look for instances where our app pushes content too far down the screen compared to the centered, tighter layout of the Canva template.

## Sections to walk (top → bottom)
Hero · About · Expertise · Services ("איך זה עובד?" + "סיפורי הצלחה" video band) · Testimonials ·
Contact · Footer. For each: scroll both servers to the section, screenshot at 1280/768/375, compare,
and log gaps.

## Per-bug record (append to docs/QA_BUGS.md)
Use the table format already seeded there. For each gap capture: section, width(s), what's wrong
(ours vs template), measured numbers if available, screenshot paths, and a severity
(P1 blocking-look / P2 noticeable / P3 polish). Keep one row per distinct gap.

## What "done" looks like for you
A complete, deduplicated `docs/QA_BUGS.md` covering all 7 sections at 1280 (plus any 768/375 breakage),
each row actionable enough that an engineer can fix without re-measuring from scratch.
