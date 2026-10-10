import type React from 'react';
import { cx } from '@/lib/cx';

/**
 * The element a title renders as. `h2` (default) for section titles, `h1` for a page title
 * (blog), `p` for a title-scale line that is not a heading (the footer tagline).
 */
type SectionTitleTag = 'h1' | 'h2' | 'p';

type SectionTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  as?: SectionTitleTag;
  /** Cream title for a photo band that carries no `data-bg-tone` (sets `--header-color` via `.on-dark`). */
  onDark?: boolean;
  /**
   * A decorative drawing set BESIDE the title, in the same row (so the section gets no taller). It is a sibling of
   * the heading, never inside it (the h2-decoration guard forbids svg/path in a title). In RTL it sits on the
   * heading's right (first in DOM order = first in reading order). Size it yourself (about the title's cap height); it is `shrink-0` and centred on the line.
   */
  marker?: React.ReactNode;
  /** Row alignment when a `marker` is set (default `justify-start`; centred titles pass `justify-center`). */
  rowClassName?: string;
};

/**
 * The one title style: `type-title` (Elamy 700), colour from `--header-color` so it follows the
 * nearest `[data-bg-tone]`. Size, weight (700) and tracking (-0.01em) come from the type class, never from here.
 * Static by rule (CLAUDE.md typography rule 9): never inside a ScrollReveal, never given an opacity, transform or
 * colour transition (iPhone Safari repaints Elamy only inside its declared height and cuts the swash tops).
 * Guarded by tests/elamy-static.spec.ts.
 */
export function SectionTitle({ as: Tag = 'h2', id, className, onDark = false, marker, rowClassName, children, ...props }: SectionTitleProps) {
  const title = (
    <Tag
      id={id}
      className={cx('type-title text-[color:var(--header-color)]', onDark && 'on-dark', className)}
      {...props}
    >
      {children}
    </Tag>
  );
  if (!marker) return title;
  return (
    <div className={cx('flex flex-nowrap items-center gap-stack', rowClassName ?? 'justify-start')}>
      <span className="shrink-0">{marker}</span>
      {title}
    </div>
  );
}
