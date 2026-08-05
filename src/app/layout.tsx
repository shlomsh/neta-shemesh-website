import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AUTHOR_NAME, AUTHOR_TITLE, SITE_URL } from '@/config/constants';

const elamy = localFont({
  src: [
    {
      path: "../../public/fonts/Elamy-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Elamy-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-elamy",
  display: "swap",
});

const stanga = localFont({
  src: [
    {
      path: "../../public/fonts/stanga-light-aaa.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/stanga-regular-aaa.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/stanga-bold-aaa.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-stanga",
  display: "swap",
  preload: true,
});

// Any build not pointed at the production domain is a staging copy (Azure SWA
// via NEXT_PUBLIC_SITE_URL, a preview deploy, a tunnel). Those self-canonicalise
// to their own host, which makes them a crawlable duplicate of the real site, so
// they must not be indexed.
//
// Deriving this from SITE_URL rather than a per-host config means the robots
// directive and the canonical can never disagree, and indexing switches back on
// by itself the moment a build points at production — no cutover checklist.
//
// Note: do NOT also add `Disallow: /` to robots.txt on those hosts. Disallow
// blocks crawling, not indexing — Google can still index an uncrawlable URL it
// finds linked, and if it cannot fetch the page it never sees this noindex.
// Crawlable + noindex is the combination that actually de-indexes.
const IS_PRODUCTION_HOST = SITE_URL === 'https://www.netashemesh.co.il';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...(IS_PRODUCTION_HOST ? {} : { robots: { index: false, follow: false } }),
  title: 'נטע שמש | טיפול זוגי ומשפחתי - נתניה',
  description: 'מטפלת זוגית ומשפחתית מוסמכת בנתניה. ליווי אישי לזוגות ומשפחות בתהליכי שינוי, משבר וצמיחה. קבעו פגישת ייעוץ ראשונה עוד היום.',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'he-IL': SITE_URL,
    },
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'נטע שמש | טיפול זוגי ומשפחתי',
    description: 'מטפלת זוגית ומשפחתית מוסמכת בנתניה. ליווי לזוגות ומשפחות בתהליכי שינוי וצמיחה.',
    locale: 'he_IL',
    siteName: 'נטע שמש',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'נטע שמש | טיפול זוגי ומשפחתי',
    description: 'מטפלת זוגית ומשפחתית מוסמכת בנתניה.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'HealthAndBeautyBusiness'],
      '@id': `${SITE_URL}/#business`,
      name: 'נטע שמש - טיפול זוגי ומשפחתי',
      description: 'מטפלת זוגית ומשפחתית מוסמכת בנתניה',
      url: SITE_URL,
      telephone: '+972545711060',
      email: 'nettabe@gmail.com',
      // Must carry the .png extension: the OG card is a committed static asset
      // (src/app/opengraph-image.png), not the generated route it used to be.
      // The extensionless path 404s.
      image: `${SITE_URL}/opengraph-image.png`,
      priceRange: '₪₪₪',
      openingHours: ['Su-Th 09:00-19:00'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'רחוב אמנון ותמר 6',
        addressLocality: 'נתניה',
        addressRegion: 'השרון',
        postalCode: '4220209',
        addressCountry: 'IL',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 32.2568,
        longitude: 34.8585,
      },
      sameAs: [],
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#netta`,
      name: AUTHOR_NAME,
      jobTitle: AUTHOR_TITLE,
      email: 'nettabe@gmail.com',
      worksFor: { '@id': `${SITE_URL}/#business` },
      url: SITE_URL,
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#service-couples`,
      name: 'טיפול זוגי',
      description: 'עבודה משותפת על הדינאמיקה הזוגית, דפוסי תקשורת, קרבה רגשית ובניית אמון מחדש. שיטות מבוססות מחקר ליצירת שינוי אמיתי.',
      provider: { '@id': `${SITE_URL}/#business` },
      areaServed: { '@type': 'Place', name: 'נתניה, ישראל' },
      url: `${SITE_URL}/#expertise`,
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#service-family`,
      name: 'טיפול משפחתי',
      description: 'חיזוק הקשרים בתוך המשפחה, הבנת הדינמיקה המשפחתית ומציאת דרכים חדשות להתמודד עם אתגרים יחד.',
      provider: { '@id': `${SITE_URL}/#business` },
      areaServed: { '@type': 'Place', name: 'נתניה, ישראל' },
      url: `${SITE_URL}/#expertise`,
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#service-parenting`,
      name: 'הדרכת הורים',
      description: 'כלים מעשיים להורות מיטבית, התמודדות עם אתגרי הגיל, תקשורת עם ילדים ובני נוער וחיזוק הביטחון ההורי.',
      provider: { '@id': `${SITE_URL}/#business` },
      areaServed: { '@type': 'Place', name: 'נתניה, ישראל' },
      url: `${SITE_URL}/#expertise`,
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#service-personal`,
      name: 'ליווי אישי',
      description: 'מרחב אישי לעיבוד רגשי, לצמיחה ולבחינה של צמתים משמעותיים בחיים - קריירה, זוגיות, הורות.',
      provider: { '@id': `${SITE_URL}/#business` },
      areaServed: { '@type': 'Place', name: 'נתניה, ישראל' },
      url: `${SITE_URL}/#expertise`,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${elamy.variable} ${stanga.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
