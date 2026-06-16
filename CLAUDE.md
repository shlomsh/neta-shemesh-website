# CLAUDE.md — Neta Shemesh website

Guidance for working in this repo. Read [docs/neta.md](docs/neta.md) for who the
client is, the brand voice, and the website abstract.

## What we're building

A modern marketing website for **Neta Shemesh**, a couple & family therapist.
Hebrew-first, RTL, warm and calm. Deployed on **Vercel**. The whole color scheme
must be **swappable from a single place** — see "Theming" below.

This is a small, high-craft site: a few sections, excellent typography, gentle
motion, fast and accessible. Not a CMS-heavy app.

## Status

**Planning.** No app scaffolded yet. Current files:
- `pallets.html` — static A/B/C/D palette chooser (the colorhunt-derived options).
- `docs/neta.md` — client + content abstract.

The build will be based on a **template the user will provide** — do not scaffold
from scratch until that template is in hand.

## Stack (target)

Cutting-edge, Vercel-native:
- **Next.js (App Router)** + **React** + **TypeScript** (strict).
- **Tailwind CSS** with design tokens (theming via CSS variables — see below).
- **shadcn/ui** for primitives where useful; keep custom components light.
- **Framer Motion** (or CSS) for subtle, tasteful motion only.
- Hosting + analytics + image optimization on **Vercel**.
- RTL-first: `dir="rtl"`, `lang="he"`, a Hebrew web font (e.g. Heebo / Assistant /
  Rubik) with a Latin fallback.

> When the template arrives, reconcile its stack with the above. Prefer the
> template's conventions unless they conflict with RTL, theming, or Vercel.

## Theming — the palette must be swappable

This is a hard requirement. **One source of truth** defines the palette; switching
themes is a one-line/one-file change. Approach:

- Define semantic CSS variables (e.g. `--color-ink`, `--color-primary`,
  `--color-muted`, `--color-surface`) in a single tokens file, mapped to the
  active palette.
- Components reference **semantic tokens only** — never raw hex values.
- A palette = the four colorhunt swatches mapped to those semantic roles, so we
  can drop in a new palette object and the whole site re-skins.

### Chosen palette: **C — "Dusty mauve"**
Neta chose C. (Maintainer note: I lean A — Plum rose — keep it as the documented
fallback.)

| Role (semantic)        | Hex       | Notes                          |
|------------------------|-----------|--------------------------------|
| `ink` (deep/text)      | `#4A3D4A` | deep purple-grey, headings/text |
| `primary` (mid)        | `#8C7A8C` | muted mauve, accents/links      |
| `muted` (light accent) | `#C2ADBB` | soft mauve, borders/secondary   |
| `surface` (cream bg)   | `#F7E2D6` | warm cream, backgrounds         |

Fallback palette **A — "Plum rose"**: `#5C4A52 / #9F8383 / #C8AAAA / #F7E2D6`.

All palettes share the cream `#F7E2D6` surface (the user's swap of the original
`#FFDAB3`). Source palette: colorhunt `5749649f8383c8aaaa` with the warmer cream.

## Conventions

- **Content is Hebrew/RTL.** Test every layout in RTL. Don't hardcode `left`/
  `right` — use logical properties (`start`/`end`).
- **Accessibility**: semantic HTML, focus states, sufficient contrast against the
  cream surface, `prefers-reduced-motion` respected.
- **Performance**: ship a fast static site; optimize fonts and images.
- Keep copy consistent with `docs/neta.md`. Primary CTA is WhatsApp / consultation.

## Next steps

1. User provides the base template → reconcile stack, scaffold the app.
2. Wire the theming tokens with palette C as default, A as fallback.
3. Build sections per the page outline in `docs/neta.md`.
