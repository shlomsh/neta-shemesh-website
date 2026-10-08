import { SITE } from '@/content/site';
import { ANCHOR } from '@/content/ids';
import { EXPERTISE_CARDS } from '@/content/home/expertise';
import type { BlogPost } from '@/content/posts';

/**
 * Structured data (schema.org JSON-LD), built from the same content the page renders:
 * contact facts from content/site.ts, the four `Service` nodes from the Expertise cards.
 * Render with `<JsonLd data={...} />` (components/site/JsonLd.tsx).
 */

/** The site-wide graph (LocalBusiness + Person + one Service per expertise card), emitted by the root layout. */
export function siteJsonLd() {
  const { url } = SITE;
  const a = SITE.address;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'HealthAndBeautyBusiness'],
        '@id': `${url}/#business`,
        name: `${SITE.name} - ${SITE.tagline}`,
        description: `מטפלת זוגית ומשפחתית מוסמכת ב${SITE.city}`,
        url,
        telephone: SITE.phone.e164,
        email: SITE.email,
        // Must carry the .png extension: the OG card is a committed static asset
        // (src/app/opengraph-image.png), not the generated route it used to be.
        // The extensionless path 404s.
        image: `${url}/opengraph-image.png`,
        priceRange: SITE.priceRange,
        openingHours: SITE.openingHours,
        address: {
          '@type': 'PostalAddress',
          streetAddress: a.street,
          addressLocality: a.city,
          addressRegion: a.region,
          postalCode: a.postalCode,
          addressCountry: a.country,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: a.geo.latitude,
          longitude: a.geo.longitude,
        },
        sameAs: SITE.sameAs,
      },
      {
        '@type': 'Person',
        '@id': `${url}/#netta`,
        name: SITE.name,
        jobTitle: SITE.jobTitle,
        email: SITE.email,
        worksFor: { '@id': `${url}/#business` },
        url,
      },
      ...EXPERTISE_CARDS.map((card) => ({
        '@type': 'Service',
        '@id': `${url}/#service-${card.slug}`,
        name: card.title,
        description: card.description,
        provider: { '@id': `${url}/#business` },
        areaServed: { '@type': 'Place', name: `${SITE.city}, ישראל` },
        url: `${url}/#${ANCHOR.expertise}`,
      })),
    ],
  };
}

/** Per-article BlogPosting node. */
export function blogPostingJsonLd(post: BlogPost) {
  const { url } = SITE;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: `${url}${post.coverImage}`,
    datePublished: post.date,
    dateModified: post.date,
    articleSection: post.category,
    inLanguage: 'he-IL',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${url}/blog/${post.slug}` },
    author: { '@type': 'Person', name: SITE.name, url },
    publisher: { '@type': 'Person', name: SITE.name, url },
  };
}
