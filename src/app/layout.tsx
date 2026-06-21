import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL('https://nettashemesh.vercel.app'),
  title: 'נטע שמש | טיפול זוגי ומשפחתי — כפר יעבץ',
  description: 'מטפלת זוגית ומשפחתית מוסמכת בכפר יעבץ. ליווי אישי לזוגות ומשפחות בתהליכי שינוי, משבר וצמיחה. קבעו פגישת ייעוץ ראשונה עוד היום.',
  alternates: {
    canonical: 'https://nettashemesh.vercel.app',
    languages: {
      'he-IL': 'https://nettashemesh.vercel.app',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://nettashemesh.vercel.app',
    title: 'נטע שמש | טיפול זוגי ומשפחתי',
    description: 'מטפלת זוגית ומשפחתית מוסמכת בכפר יעבץ. ליווי לזוגות ומשפחות בתהליכי שינוי וצמיחה.',
    locale: 'he_IL',
    siteName: 'נטע שמש',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'נטע שמש | טיפול זוגי ומשפחתי',
    description: 'מטפלת זוגית ומשפחתית מוסמכת בכפר יעבץ.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'HealthAndBeautyBusiness'],
      '@id': 'https://nettashemesh.vercel.app/#business',
      name: 'נטע שמש — טיפול זוגי ומשפחתי',
      description: 'מטפלת זוגית ומשפחתית מוסמכת בכפר יעבץ',
      url: 'https://nettashemesh.vercel.app',
      telephone: '+972545711060',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'שביל המוביל',
        addressLocality: 'כפר יעבץ',
        addressCountry: 'IL',
      },
      // sameAs: ['[REAL_FB_URL]', '[REAL_IG_URL]'],  — fill in when social URLs are confirmed
    },
    {
      '@type': 'Person',
      '@id': 'https://nettashemesh.vercel.app/#netta',
      name: 'נטע שמש',
      jobTitle: 'מטפלת זוגית ומשפחתית',
      worksFor: { '@id': 'https://nettashemesh.vercel.app/#business' },
      url: 'https://nettashemesh.vercel.app',
    },
    {
      '@type': 'Service',
      '@id': 'https://nettashemesh.vercel.app/#service-couples',
      name: 'טיפול זוגי',
      description: 'עבודה משותפת על הדינאמיקה הזוגית, דפוסי תקשורת, קרבה רגשית ובניית אמון מחדש. שיטות מבוססות מחקר ליצירת שינוי אמיתי.',
      provider: { '@id': 'https://nettashemesh.vercel.app/#business' },
      areaServed: { '@type': 'Place', name: 'כפר יעבץ, ישראל' },
      url: 'https://nettashemesh.vercel.app/#expertise',
    },
    {
      '@type': 'Service',
      '@id': 'https://nettashemesh.vercel.app/#service-family',
      name: 'טיפול משפחתי',
      description: 'חיזוק הקשרים בתוך המשפחה, הבנת הדינמיקה המשפחתית ומציאת דרכים חדשות להתמודד עם אתגרים יחד.',
      provider: { '@id': 'https://nettashemesh.vercel.app/#business' },
      areaServed: { '@type': 'Place', name: 'כפר יעבץ, ישראל' },
      url: 'https://nettashemesh.vercel.app/#expertise',
    },
    {
      '@type': 'Service',
      '@id': 'https://nettashemesh.vercel.app/#service-parenting',
      name: 'הדרכת הורים',
      description: 'כלים מעשיים להורות מיטבית, התמודדות עם אתגרי הגיל, תקשורת עם ילדים ובני נוער וחיזוק הביטחון ההורי.',
      provider: { '@id': 'https://nettashemesh.vercel.app/#business' },
      areaServed: { '@type': 'Place', name: 'כפר יעבץ, ישראל' },
      url: 'https://nettashemesh.vercel.app/#expertise',
    },
    {
      '@type': 'Service',
      '@id': 'https://nettashemesh.vercel.app/#service-personal',
      name: 'ליווי אישי',
      description: 'מרחב אישי לעיבוד רגשי, לצמיחה ולבחינה של צמתים משמעותיים בחיים — קריירה, זוגיות, הורות.',
      provider: { '@id': 'https://nettashemesh.vercel.app/#business' },
      areaServed: { '@type': 'Place', name: 'כפר יעבץ, ישראל' },
      url: 'https://nettashemesh.vercel.app/#expertise',
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
