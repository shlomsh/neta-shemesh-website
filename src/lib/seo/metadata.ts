import type { Metadata } from 'next';
import { SITE } from '@/content/site';

/**
 * The site-wide share image (src/app/opengraph-image.png, 1200x630). A page-level `openGraph`
 * object replaces the file-convention image, so non-article pages must name it explicitly or
 * they ship without og:image. Alt matches src/app/opengraph-image.alt.txt.
 */
export const DEFAULT_OG_IMAGE = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: `${SITE.name} — ${SITE.tagline}`,
};

interface PageMetaInput {
  title: string;
  description: string;
  /** Path under the site root with a leading slash; '' for the home page. */
  path?: string;
  /** Also declare the page as its own `he-IL` alternate (every indexable page: home, blog index, articles). */
  hreflang?: boolean;
  /** Open Graph copy (usually a shorter title/description than the <title>/<meta>). */
  og: { title: string; description: string };
  /** Twitter card copy; omit to inherit the parent layout's card. */
  twitter?: { title: string; description: string };
  /** Turns the page into an `article` with its share image (1200x630 JPG/PNG with declared size, type and alt). */
  article?: { publishedTime: string; image: { url: string; width: number; height: number; type: string; alt: string } };
}

/**
 * Page metadata with the canonical URL, Open Graph and Twitter blocks in one place, so the
 * home page, the blog index and each article cannot drift apart.
 */
export function pageMeta({ title, description, path = '', hreflang = false, og, twitter, article }: PageMetaInput): Metadata {
  const url = `${SITE.url}${path}`;
  const common = {
    url,
    title: og.title,
    description: og.description,
    locale: 'he_IL',
    siteName: SITE.name,
  };
  return {
    title,
    description,
    alternates: {
      canonical: url,
      ...(hreflang ? { languages: { 'he-IL': url } } : {}),
    },
    openGraph: article
      ? {
          type: 'article',
          ...common,
          publishedTime: article.publishedTime,
          images: [article.image],
        }
      : { type: 'website', ...common, images: [DEFAULT_OG_IMAGE] },
    ...(twitter
      ? {
          twitter: {
            card: 'summary_large_image',
            title: twitter.title,
            description: twitter.description,
            // The articles' own share image; other pages inherit nothing here, so they fall back to og:image.
            ...(article ? { images: [{ url: article.image.url, alt: article.image.alt }] } : {}),
          },
        }
      : {}),
  };
}
