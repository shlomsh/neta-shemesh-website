import React from 'react';
import { cx } from '@/lib/cx';
import { BodyText } from './BodyText';
import { SectionTitle } from './SectionTitle';

/**
 * How the subtitle (and the title above it) is aligned.
 *   'center' title and subtitle centred; the subtitle is capped at 65ch and sits `mt-3 md:mt-4` under the title
 *   'column' title and subtitle right-aligned in a narrow side column (Services, 320-400px). The documented
 *            exception: no 65ch cap (the column never reaches it) and `mt-5 md:mt-9`, because the Elamy
 *            "?" in the title has a long descender.
 */
export type SubtitleAlign = 'center' | 'column';

const SUBTITLE_CLASS: Record<SubtitleAlign, string> = {
  center: 'type-quote max-w-[65ch] mx-auto mt-3 md:mt-4',
  column: 'type-quote mt-5 md:mt-9',
};

type SectionSubtitleProps = {
  align: SubtitleAlign;
  /** White text with a soft shadow, for a photo band (no `data-bg-tone`, so no inherited text colour). */
  onPhoto?: boolean;
  /** Layout extras only (the margin to the next block). */
  className?: string;
  children: React.ReactNode;
};

/**
 * The line under a section title: `type-quote` (24-32px), the size that stays AA on blush and
 * is the approved subtitle on mauve (CLAUDE.md typography rule 8). Colour is inherited from the tone.
 */
export function SectionSubtitle({ align, onPhoto = false, className, children }: SectionSubtitleProps) {
  return (
    <BodyText centered={align === 'center'} className={cx(SUBTITLE_CLASS[align], onPhoto && 'text-white drop-shadow-md', className)}>
      {children}
    </BodyText>
  );
}

type SectionHeaderProps = {
  /** The title's DOM id (from `ID` in content/ids.ts). */
  id: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  align: SubtitleAlign;
  /** Photo band: cream title and white subtitle, both with a soft shadow (the CTA band). */
  onPhoto?: boolean;
  /** Layout extras only (the margin from the subtitle to the next block). */
  subtitleClassName?: string;
};

/**
 * The title + subtitle lockup as two sibling elements (a fragment, no wrapper): the caller owns the
 * wrapper and any ScrollReveal around it. A lockup whose two lines reveal separately (About gallery)
 * uses `SectionTitle` and `SectionSubtitle` directly.
 */
export function SectionHeader({ id, title, subtitle, align, onPhoto = false, subtitleClassName }: SectionHeaderProps) {
  return (
    <>
      <SectionTitle id={id} onDark={onPhoto} className={cx(align === 'center' && 'text-center', onPhoto && 'drop-shadow-md')}>
        {title}
      </SectionTitle>
      <SectionSubtitle align={align} onPhoto={onPhoto} className={subtitleClassName}>
        {subtitle}
      </SectionSubtitle>
    </>
  );
}
