import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/content/posts';
import { SITE } from '@/content/site';

// lastmod in date-only (YYYY-MM-DD) W3C format — the conventional, least-fussy
// form for crawlers. Passing a Date would serialize to full ISO with millis.
const ymd = (d: Date) => d.toISOString().slice(0, 10);

// Content-derived, never "now": a build-time clock would change every lastmod on every
// deploy and teach crawlers to ignore the field. The blog index changes when a post is
// published, so it takes the newest post date. The home page has no content date of its
// own, so it follows the same date (a new post links from the home page) and falls back to
// the constant below only when there are no posts.
const HOME_LASTMOD_FALLBACK = '2026-06-01';

export default function sitemap(): MetadataRoute.Sitemap {
  const all = getAllPosts();
  const latestPost = all.map((post) => ymd(new Date(post.date))).sort().at(-1);
  const siteLastMod = latestPost ?? HOME_LASTMOD_FALLBACK;

  const posts = all.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: ymd(new Date(post.date)),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: `${SITE.url}/`,
      lastModified: siteLastMod,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE.url}/blog`,
      lastModified: siteLastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts,
  ];
}
