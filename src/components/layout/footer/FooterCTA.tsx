import { Badge } from '@/components/primitives/Badge';

/**
 * CTA link with 3 hand-drawn brand-primary highlight shapes stacked behind it.
 * Highlights are hidden on mobile (≤768px) per token sheet spec.
 */
export function FooterCTA() {
  return (
    <div className="relative flex items-center justify-center">
      {/* 3 overlapping badge highlight shapes — desktop only */}
      <div className="hidden md:block absolute inset-0 pointer-events-none">
        <Badge
          svgId="Q8pZ6GsYbthSW5Bz"
          viewBox="0 0 427.9183 53.3292"
          opacity={0.75}
          gId="VE6EXKLGABIYl44E"
          pathId="UOlKvnkYOUCW6aLP"
          d="M427.91828482,0 L427.91828482,1 L427.91828482,52.32920203 L427.91828482,53.32920203 L426.91828482,53.32920203 L1,53.32920203 L0,53.32920203 L0,52.32920203 L0,1 L0,0 L1,0 L426.91828482,0 L427.91828482,0 Z"
          fillColor="var(--color-brand-primary)"
        />
        <Badge
          svgId="i9QF0jordDPdnM4h"
          viewBox="0 0 419.0019 75.7757"
          opacity={0.75}
          gId="FLCZndJVbQJ7hBJe"
          pathId="v1kwUaJC5ZaEruV7"
          d="M419.00187108,0 L419.00187108,1 L419.00187108,74.77573083 L419.00187108,75.77573083 L418.00187108,75.77573083 L1,75.77573083 L0,75.77573083 L0,74.77573083 L0,1 L0,0 L1,0 L418.00187108,0 L419.00187108,0 Z"
          fillColor="var(--color-brand-primary)"
        />
        <Badge
          svgId="ErRGi2JkdUoGTEsR"
          viewBox="0 0 320.7983 70.8405"
          opacity={0.75}
          gId="cjexrpkKxf6VNHUk"
          pathId="BPT1G3lVNMZEOPA3"
          d="M320.79830754,0 L320.79830754,1 L320.79830754,69.84048428 L320.79830754,70.84048428 L319.79830754,70.84048428 L1,70.84048428 L0,70.84048428 L0,69.84048428 L0,1 L0,0 L1,0 L319.79830754,0 L320.79830754,0 Z"
          fillColor="var(--color-brand-primary)"
        />
      </div>

      {/* CTA link */}
      <a
        href="#contact"
        className="relative z-10 text-[color:var(--color-white)] font-[family-name:var(--font-stanga)] font-bold uppercase tracking-[0.138em] text-[clamp(15px,1.4vw,18px)] leading-[1.35] text-center py-[14px] px-[24px] min-h-[48px] inline-flex items-center justify-center"
      >
        מוזמנים ליצור איתי קשר
      </a>
    </div>
  );
}
