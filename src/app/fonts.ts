import localFont from "next/font/local";

/**
 * The three self-hosted font families (src/app/fonts/). `next/font/local` ONLY: the Vercel build
 * once failed fetching the Google-hosted loader, so never reintroduce it. The CSS variables are
 * attached to <html> in layout.tsx and consumed by `--font-display` / `--font-body` /
 * `--font-latin` in globals.css.
 */

/**
 * Display / handwriting: hero H1 + section H2 (700), step numerals + signature (400).
 *
 * `preload` is per localFont() call, not per `src` entry, so the one Elamy family is declared as two
 * calls that share the family name `elamy` (the `font-family` declaration below; without it the name
 * would be the const name). Only the Bold face (the hero H1, above the fold) is preloaded. The
 * Regular face (step numerals + signature, below the fold) swaps in on demand. This relies on
 * Turbopack's unhashed family names: under webpack each call would get its own hashed family.
 *
 * `elamy` owns the `--font-elamy` variable; `elamyBold` adds only its @font-face. Neither generates a
 * next/font fallback: the metric-matched, Hebrew-only "elamy-fb" / "stanga-fb" faces live in globals.css.
 */
export const elamy = localFont({
  src: [
    {
      path: "./fonts/Elamy-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-elamy",
  display: "swap",
  preload: false,
  // No generated local(Arial) "elamy Fallback": the Hebrew-only "elamy-fb" face in globals.css replaces it.
  adjustFontFallback: false,
  declarations: [{ prop: "font-family", value: "elamy" }],
});

export const elamyBold = localFont({
  src: [
    {
      path: "./fonts/Elamy-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  preload: true,
  adjustFontFallback: false,
  declarations: [{ prop: "font-family", value: "elamy" }],
});

/** Clean sans for everything else (body, names, labels, nav, CTA). */
export const stanga = localFont({
  src: [
    {
      path: "./fonts/stanga-regular-aaa.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/stanga-bold-aaa.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-stanga",
  display: "swap",
  preload: true,
  // Stanga has no Latin glyphs. Without this, next/font appends a generated
  // local(Arial) "stanga Fallback" to the stack, which would capture Latin text
  // BEFORE the Latin companion below gets a chance.
  adjustFontFallback: false,
});

// Latin / digit companion: Stanga has no A-Z / a-z (nor ©), so email addresses,
// "M.S.W." etc. fall through to this face instead of Arial. Self-hosted via
// next/font/local (Latin subset, OFL-1.1) so the build never fetches Google Fonts.
export const latin = localFont({
  src: [
    {
      path: "./fonts/RobotoCondensed-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/RobotoCondensed-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-latin-next",
  display: "swap",
  // Below the fold in practice (phone, email, "M.S.W."): swap in on demand, no preload.
  preload: false,
});
