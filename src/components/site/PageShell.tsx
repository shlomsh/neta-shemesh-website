import type { ReactNode } from 'react';
import { ID } from '@/content/ids';
import { cx } from '@/lib/cx';
import { RevealObserver } from '@/components/motion/RevealObserver';
import { ContactFAB } from './ContactFAB';
import { Footer } from './footer/Footer';

/**
 * The `<main>` shell shared by every page: relative full-width column, the page surface colour,
 * then the page content, the photo footer and the contact pill.
 *
 * `overflow` is explicit (no default) because the two values are NOT interchangeable:
 *   - 'clip'   the home page. `overflow-clip` does not create a scroll container, which JS soft
 *              snap (SoftSnap) and sticky positioning need. Never `hidden` there.
 *   - 'hidden' the blog pages, which mount no SoftSnap and rely on `overflow-hidden` to contain
 *              the cover-image overlap.
 *
 * The page surface is always cream (`bg-cream`, #FFF5F0). The home page and the blog pages used to spell
 * it through two different tokens; both resolved to the same value.
 */
const OVERFLOW = {
  clip: 'overflow-clip',
  hidden: 'overflow-hidden',
} as const;

interface PageShellProps {
  overflow: keyof typeof OVERFLOW;
  children: ReactNode;
  /** Rendered after the FAB (e.g. the behaviour-only `<SoftSnap />`, which renders nothing). */
  behaviors?: ReactNode;
}

export function PageShell({ overflow, children, behaviors }: PageShellProps) {
  return (
    <>
      {/* Skip link: the first focusable element on every page. Visually hidden (sr-only, out of flow)
          until keyboard focus, then a fixed cream pill with a plum ring (5.55:1). A sibling of <main>,
          not a child, so the `main > section` selectors (SoftSnap, tests) never see it. It targets the first
          content AFTER the nav (ID.mainContent, set by each page): the nav lives inside <main>, so
          targeting <main> would land before it. */}
      <a
        href={`#${ID.mainContent}`}
        className="sr-only type-lead font-bold focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:start-3 focus-visible:z-[200] focus-visible:inline-flex focus-visible:min-h-11 focus-visible:items-center focus-visible:rounded-full focus-visible:bg-cream focus-visible:px-6 focus-visible:py-2 focus-visible:text-plum focus-ring focus-visible:ring-plum focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        דלגו לתוכן
      </a>
      <main id={ID.main} tabIndex={-1} className={cx('relative w-full bg-cream focus:outline-none', OVERFLOW[overflow])}>
        {children}
        <Footer />
        <ContactFAB />
        <RevealObserver />
        {behaviors}
      </main>
    </>
  );
}
