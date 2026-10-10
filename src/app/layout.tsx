import type { Metadata } from "next";
// Font declarations live in ./fonts (next/font/local only). globals.css is imported AFTER them
// so our rules win over anything the font loaders inject.
import { elamy, stanga, latin } from "./fonts";
import "./globals.css";
import { SITE, IS_PRODUCTION_HOST } from '@/content/site';
import { siteJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/site/JsonLd';
import { cx } from '@/lib/cx';

// Any build not pointed at the production domain is a staging copy (a preview deploy or a
// tunnel with NEXT_PUBLIC_SITE_URL set to its own host). Those self-canonicalise
// to their own host, which makes them a crawlable duplicate of the real site, so
// they must not be indexed.
//
// Deriving this from SITE.url rather than a per-host config means the robots
// directive and the canonical can never disagree, and indexing switches back on
// by itself the moment a build points at production — no manual step.
//
// Note: do NOT also add `Disallow: /` to robots.txt on those hosts. Disallow
// blocks crawling, not indexing — Google can still index an uncrawlable URL it
// finds linked, and if it cannot fetch the page it never sees this noindex.
// Crawlable + noindex is the combination that actually de-indexes.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  ...(IS_PRODUCTION_HOST ? {} : { robots: { index: false, follow: false } }),
  // Site-wide fallback share card, inherited by every page that declares no `twitter` of its own (the
  // home page, the blog index, the 404). Page-specific metadata (canonical, hreflang, title, description,
  // Open Graph) lives with each page, never here: layout metadata is inherited by every page that
  // declares none, so a layout-level canonical would ship the home URL on the 404.
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} | ${SITE.tagline} ב${SITE.city}`,
    description: 'מטפלת זוגית ומשפחתית מוסמכת בנתניה.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={cx(elamy.variable, stanga.variable, latin.variable)}>
      <body>
        <JsonLd data={siteJsonLd()} />
        {children}
      </body>
    </html>
  );
}
