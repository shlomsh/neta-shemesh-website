import type { CSSProperties } from 'react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { cx } from '@/lib/cx';

/**
 * LineArt (NS-54): a small family of monoline illustrations in the style of the hero couple
 * (single stroke width, round caps and joins, `currentColor`), hand-authored on a 200x200 grid.
 *
 *   family        two adults and a child, hands joined
 *   parent-child  a parent and a child
 *   individual    a seated figure in thought
 *   chair         the clinic armchair
 *
 * Decorative: `aria-hidden`, no title. Colour is `currentColor`, so the tone of the nearest
 * `[data-bg-tone]` (or a text utility on `className`) decides it.
 *
 * Draw-in: the SVG sits inside a `ScrollReveal`, and when that reveals the strokes draw with the same
 * pen technique as the hero couple (`pathLength={1}`, dash offset 1 to 0), one stroke after another.
 * Strokes are listed right to left so the pen travels with the RTL reading direction. The hidden state
 * exists only under `html[data-reveal-armed]` with `prefers-reduced-motion: no-preference` (globals.css),
 * so JS off, an iframe and reduced motion all show the finished drawing.
 */
type LineArtName = 'family' | 'parent-child' | 'individual' | 'chair';

export const LINE_ART_NAMES: readonly LineArtName[] = ['family', 'parent-child', 'individual', 'chair'];

const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`;

/** Strokes in pen order (right to left). */
const PATHS: Record<LineArtName, readonly string[]> = {
  family: [
    circle(150, 52, 14),
    'M175 162c0-50-9-76-25-76s-25 26-25 76',
    'M132 112c-8 5-16 11-22 19',
    circle(100, 106, 10),
    'M116 162c0-26-6-44-16-44s-16 18-16 44',
    'M68 106c9 7 18 14 24 24',
    circle(50, 50, 14),
    'M75 160c0-52-9-80-25-80s-25 28-25 80',
    'M22 166c50-4 106-4 156-1',
  ],
  'parent-child': [
    circle(142, 106, 12),
    'M160 164c0-26-7-44-18-44s-18 18-18 44',
    'M104 110c9 6 16 14 22 22',
    circle(72, 50, 16),
    'M106 162c0-56-12-84-34-84S38 106 38 162',
    'M26 167c40-4 80-2 148-1',
  ],
  individual: [
    circle(166, 24, 6),
    circle(150, 42, 4),
    circle(104, 54, 15),
    'M126 134c-16-4-24-26-18-64',
    'M130 150c2-44-6-72-30-72S68 106 70 150',
    'M138 156c-24 4-52 4-76 0',
    'M132 158l5 20',
    'M68 158l-5 20',
  ],
  chair: [
    'M144 100c18-6 28 6 28 28v26c0 8-6 12-14 12h-14',
    'M56 134c30 8 58 8 88 0',
    'M56 134c-4-30-4-56 6-72c10-16 26-22 38-22s28 6 38 22c10 16 10 42 6 72',
    'M44 166c36 7 76 7 112 0',
    'M148 170l4 12',
    'M52 170l-4 12',
    'M56 100c-18-6-28 6-28 28v26c0 8 6 12 14 12h14',
  ],
};

/** Seconds a single stroke takes to draw, and the offset between the starts of consecutive strokes. */
const PEN_SECONDS = 0.8;
const PEN_STAGGER_SECONDS = 0.28;

export function LineArt({ name, className, delay = 0, marker = false }: { name: LineArtName; className?: string; delay?: number; /** Title-marker size (about the title's cap height); use beside a SectionTitle `marker`. */ marker?: boolean }) {
  return (
    <ScrollReveal delay={delay} className={cx('line-art-reveal', marker && 'w-[clamp(2.75rem,5vw,4rem)] aspect-square', className)}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        data-line-art={name}
        className="block w-full h-full overflow-visible"
      >
        {PATHS[name].map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            className="line-art-pen"
            style={
              {
                '--pen-d': `${PEN_SECONDS}s`,
                '--pen-delay': `${(i * PEN_STAGGER_SECONDS).toFixed(2)}s`,
              } as CSSProperties
            }
          />
        ))}
      </svg>
    </ScrollReveal>
  );
}
