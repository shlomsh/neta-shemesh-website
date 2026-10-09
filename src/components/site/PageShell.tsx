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
 * The page surface is always cream (`bg-cream`, #FFF5F0). The home page used to spell it through the
 * `--color-bg-light` alias and the blog pages through `--color-cream`; both resolved to the same value.
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
    <main className={`relative w-full bg-cream ${OVERFLOW[overflow]}`}>
      {children}
      <Footer />
      <ContactFAB />
      {behaviors}
    </main>
  );
}
