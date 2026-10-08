import localFont from "next/font/local";

/**
 * The three self-hosted font families (public/fonts/). `next/font/local` ONLY: the Vercel build
 * once failed fetching the Google-hosted loader, so never reintroduce it. The CSS variables are
 * attached to <html> in layout.tsx and consumed by `--font-display` / `--font-body` /
 * `--font-latin` in globals.css.
 */

/** Display / handwriting: hero H1 + section H2 (700), step numerals + signature (400). */
export const elamy = localFont({
  src: [
    {
      path: "../../public/fonts/Elamy-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Elamy-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-elamy",
  display: "swap",
});

/** Clean sans for everything else (body, names, labels, nav, CTA). */
export const stanga = localFont({
  src: [
    {
      path: "../../public/fonts/stanga-regular-aaa.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/stanga-bold-aaa.woff2",
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
      path: "../../public/fonts/RobotoCondensed-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/RobotoCondensed-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-latin-next",
  display: "swap",
});
