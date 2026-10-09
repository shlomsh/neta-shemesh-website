import React from 'react';
import { cx } from '@/lib/cx';

/**
 * The element a title renders as. `h2` (default) for section titles, `h1` for a page title
 * (blog), `p` for a title-scale line that is not a heading (the footer tagline).
 */
export type SectionTitleTag = 'h1' | 'h2' | 'p';

type SectionTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  as?: SectionTitleTag;
  /** Cream title for a photo band that carries no `data-bg-tone` (sets `--header-color` via `.on-dark`). */
  onDark?: boolean;
};

/**
 * The one title style: `type-title` (Elamy 700), colour from `--header-color` so it follows the
 * nearest `[data-bg-tone]`. Sizes and weights come from the type class, never from here.
 */
export function SectionTitle({ as: Tag = 'h2', id, className, onDark = false, children, ...props }: SectionTitleProps) {
  return (
    <Tag
      id={id}
      className={cx('type-title font-bold tracking-[-0.01em] text-[color:var(--header-color)]', onDark && 'on-dark', className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
