/**
 * HeroArt — the line-art couple illustration floating over a soft,
 * asymmetric organic blob. Part of the "05B Dark Ground" hero.
 *
 * The blob is a low-opacity mid-tone ellipse with an organic
 * border-radius; the cream illustration sits on top with a gentle
 * vertical floating animation (see `floaty` in globals.css, which is
 * disabled under prefers-reduced-motion).
 *
 * Server component; animation is pure CSS.
 */
export function HeroArt() {
  return (
    <div
      aria-hidden="false"
      className="
        relative
        flex items-center justify-center
        w-full
        h-[clamp(280px,42vw,480px)]
      "
    >
      {/* Asymmetric organic blob */}
      <div
        aria-hidden="true"
        className="
          absolute
          w-[clamp(280px,46vw,520px)]
          h-[clamp(220px,38vw,420px)]
          bg-[var(--color-canva-mid)]
          opacity-[0.32]
          [border-radius:42%_58%_55%_45%/55%_48%_52%_45%]
        "
      />

      {/* Line-art couple illustration */}
      <img
        src="/images/couple3-cream.png"
        alt="זוג — ציור קו"
        className="
          relative
          w-[clamp(240px,42vw,480px)]
          h-auto
          hero-floaty
        "
        loading="eager"
      />
    </div>
  );
}
