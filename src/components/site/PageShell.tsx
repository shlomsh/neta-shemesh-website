import type { ReactNode } from 'react';
import Footer from '@/components/layout/Footer';
import { ContactFAB } from '@/components/ui/ContactFAB';

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
 * `surface` keeps each page's exact inline background: 'bg-light' is the alias the home page used,
 * 'cream' the token the blog pages used. Both resolve to the same cream (#FFF5F0); they are kept
 * as two values only so this extraction changes no markup.
 */
const OVERFLOW = {
  clip: 'overflow-clip',
  hidden: 'overflow-hidden',
} as const;

const SURFACE = {
  'bg-light': 'var(--color-bg-light)',
  cream: 'var(--color-cream)',
} as const;

interface PageShellProps {
  overflow: keyof typeof OVERFLOW;
  surface: keyof typeof SURFACE;
  children: ReactNode;
  /** Rendered after the FAB (e.g. the behaviour-only `<SoftSnap />`, which renders nothing). */
  behaviors?: ReactNode;
}

export function PageShell({ overflow, surface, children, behaviors }: PageShellProps) {
  return (
    <main
      className={`relative w-full ${OVERFLOW[overflow]}`}
      style={{ backgroundColor: SURFACE[surface] }}
    >
      {children}
      <Footer />
      <ContactFAB />
      {behaviors}
    </main>
  );
}
