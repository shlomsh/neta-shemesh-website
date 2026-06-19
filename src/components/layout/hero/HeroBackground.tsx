/**
 * HeroBackground — full-bleed background image, mirrored horizontally
 * to match the original Canva design (scale(-1,1) transform).
 *
 * Server component; no interactivity needed.
 */
export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Mirror horizontally to match original Canva design (scale(-1,1)) */}
      <div className="w-full h-full [-webkit-transform:scaleX(-1)] [transform:scaleX(-1)] bg-[var(--color-canva-dark)]">
        <img
          id="lMpsFVcZNd208Jch"
          src="/images/4211b13c2664ad402dce9a3e5740987d.jpg"
          srcSet="/images/04d6ac1bed10e8d5307f9d0b9972e487.jpg 1248w, /images/4211b13c2664ad402dce9a3e5740987d.jpg 2496w"
          sizes="(max-width: 375px) 100vw, (max-width: 768px) 100vw, 100vw"
          loading="lazy"
          alt=""
          className="w-full h-full object-cover [object-position:58.48%_46.89%] opacity-[0.18]"
        />
      </div>
    </div>
  );
}
