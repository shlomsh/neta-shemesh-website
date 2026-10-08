# Handoff: Hero Section — 05B "Dark Ground"

> **2026-10-08:** hexes below were remapped from the original handoff palette (#574964 / #9F8383 / #C8AAAA / #fff0e4) to the shipped, canonical palette in `src/app/globals.css`. `hero-05b-reference.html` in this folder still carries the old hexes (static reference only).

## Overview
This is the hero section for **נטע שמש** — a couples therapy website (Hebrew, RTL).
The design is "05B Dark Ground": the darkest palette color (#7A5978, deep plum) is used as
the hero background, with all text and illustration in lighter palette tones (cream, mauve).
The hero features an abstract line-art illustration of a couple (wire-art style) floating
over a soft asymmetric blob, with a large Elamy-font headline on the left and a minimal
pill-style nav at the top.

## About the Design Files
The files in this bundle are **HTML design references** — pixel-accurate prototypes
showing the intended look, spacing, and animation. They are **not production code to
copy directly**. The task is to **recreate these designs in your existing codebase** (React,
Next.js, etc.) using your established patterns, routing, and component library. The HTML is
a spec, not a deliverable.

Open `hero-05b-reference.html` in any browser for a live preview of the design.

## Fidelity
**High-fidelity** — final colors, typography, spacing, copy, and animation are all defined.
Recreate the UI pixel-accurately using the project's existing component patterns.

---

## Screen: Hero Section

### Layout
- Direction: `rtl` (right-to-left, Hebrew)
- Full-viewport hero, designed at **1280 × 820 px** reference size
- Background: `#7A5978`
- Two zones (flex row, `gap: 40px`, `align-items: center`):
  - **Text block** — `flex: 0 0 520px` — absolute positioned inset `150px 60px 64px`
  - **Art block** — `flex: 1`, `height: 480px`, centered illustration

---

### Component: Navigation Bar
- Position: `absolute`, `top: 0 / right: 0 / left: 0`
- Padding: `36px 60px`
- Layout: `flex`, `space-between`, `align-items: center`

| Sub-component | Details |
|---|---|
| **Brand mark** | 44×44 px rounded rect (`border-radius: 14px`), `background: #FFF5F0`, initial "נ" in `#7A5978`, Elamy 21px |
| **Wordmark** | "נטע שמש" — Elamy Bold, 22px, `#FFF5F0` |
| **Nav links** | "קצת עליי · התמחות · יצירת קשר" — Stanga 16px, `#ECC8CE`, `gap: 34px` |
| **Phone pill** | `border: 1px solid #C49AB8`, `color: #FFF5F0`, `border-radius: 999px`, padding `11px 22px`, Stanga 15px. Phone number wrapped in `dir="ltr"` span |

---

### Component: Headline
- Font: **Elamy Bold**, 64px, `line-height: 1.16`, `color: #FFF5F0`
- Copy (Hebrew, RTL):
  ```
  מקום בטוח לצמוח בו, ביחד.
  ```
- The word **"לצמוח"** has a highlight underline accent:
  - `position: absolute`, `left/right: 0`, `bottom: 4px`
  - `height: 10px`, `background: #ECC8CE`, `border-radius: 6px`
  - `opacity: 0.55`, `transform: rotate(-1.2deg)`, `z-index: -1`
  - (wrap the word in `position: relative; white-space: nowrap`)

---

### Component: Body Text
- Font: **Stanga Bold**, 19px, `line-height: 1.75`, `color: #ECC8CE`
- `max-width: 430px`, `margin-top: 24px`
- Copy:
  ```
  ליווי מקצועי בתהליכי שינוי, משבר וצמיחה — זוגית ומשפחתית.
  בואו נמצא יחד את הדרך חזרה אחד לשנייה.
  ```

---

### Component: CTA Buttons
- Layout: `flex`, `gap: 18px`, `align-items: center`, `margin-top: 36px`

| Button | Style |
|---|---|
| **Primary** — "לקביעת שיחת היכרות" | `background: #FFF5F0`, `color: #7A5978`, `padding: 16px 34px`, `border-radius: 999px`, Stanga 17px, no border |
| **Secondary** — "איך זה עובד ↗" | Plain text, `color: #ECC8CE`, Stanga 17px, no border/bg |

---

### Component: Illustration Area
- Container: `flex: 1`, `height: 480px`, `position: relative`, centered

**Asymmetric blob (background shape):**
- `position: absolute`, `width: 520px`, `height: 420px`
- `background: #C49AB8`, `opacity: 0.32`
- `border-radius: 42% 58% 55% 45% / 55% 48% 52% 45%` (organic ellipse shape)

**Line-art image (`couple3-cream.png`):**
- `width: 480px`, `position: relative`
- Gentle floating animation (CSS keyframes):
  ```css
  @keyframes floaty {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-14px); }
  }
  animation: floaty 7s ease-in-out infinite;
  ```

---

## Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| Dark / Primary | `#7A5978` | Hero background, brand mark bg text, primary button text |
| Mid | `#C49AB8` | Blob fill, phone pill border |
| Light | `#ECC8CE` | Nav text, body text, highlight accent, secondary CTA |
| Cream / Background | `#FFF5F0` | All text on dark, primary button background, brand mark bg |

### Typography
| Font | File | Usage |
|---|---|---|
| **Elamy Bold** | `Elamy-Bold.woff2` | Headlines, brand wordmark, logo initial |
| **Stanga Bold** | `stanga-bold-aaa.woff2` | Nav links, body copy, buttons, labels, all UI text |

### Spacing
- Hero inset from top: `150px` (below nav)
- Side padding: `60px`
- Bottom padding: `64px`
- Nav vertical padding: `36px`
- Nav horizontal padding: `60px`

### Animation
- Name: `floaty`
- Duration: `7s`
- Easing: `ease-in-out`
- Loop: `infinite`
- Motion: vertical float `0 → -14px → 0`

---

## Interactions & Behavior
| Element | Behavior |
|---|---|
| Primary CTA button | Navigates to contact/booking form. Add hover: slightly darken bg (`#f0e0d2`), transition 200ms |
| Secondary CTA link | Navigates to "how it works" section (anchor or separate page) |
| Nav links | Standard page navigation. On hover: `color: #FFF5F0`, transition 150ms |
| Phone pill | Opens phone dialer on mobile (`href="tel:+972501234567"`), hover: border `#ECC8CE` |
| Floating illustration | CSS animation only — pause on `prefers-reduced-motion` media query |

### Accessibility
- Set `lang="he"` and `dir="rtl"` on the `<html>` element
- Phone number span must use `dir="ltr"` so numerals render LTR inside an RTL context
- Illustration `<img>` alt text: `"זוג — ציור קו"` (couple — line drawing)
- Hero heading should be `<h1>`

### Responsive notes (to be designed)
- The reference is desktop-first at 1280px
- Below 768px: stack text block and art vertically; reduce headline to ~40px
- Art illustration can scale to 100% width on mobile

---

## Assets

| File | Description |
|---|---|
| `assets/Elamy-Bold.woff2` | Hebrew display font — headlines & wordmark |
| `assets/stanga-bold-aaa.woff2` | Hebrew body font — all other text |
| `assets/couple3-cream.png` | Line-art couple illustration, cream color, transparent background. Use on dark bg. |
| `assets/couple3-plum.png` | Same illustration, plum color, transparent background. Use on light bg (e.g. if adding a light-mode variant). |

---

## Files in This Package
| File | Purpose |
|---|---|
| `README.md` | This document — full design spec |
| `hero-05b-reference.html` | Live browser preview of the complete hero |
| `assets/` | Fonts and illustration assets |
