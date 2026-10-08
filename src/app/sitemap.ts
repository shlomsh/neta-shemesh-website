import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/content/posts';
import { SITE } from '@/content/site';

// Required for `output: export` (Azure Static Web Apps) — prerender at build time.
export const dynamic = 'force-static';

// lastmod in date-only (YYYY-MM-DD) W3C format — the conventional, least-fussy
// form for crawlers. Passing a Date would serialize to full ISO with millis.
const ymd = (d: Date) => d.toISOString().slice(0, 10);

export default function sitemap(): MetadataRoute.Sitemap {
  const today = ymd(new Date());

  const posts = getAllPosts().map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: ymd(new Date(post.date)),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: `${SITE.url}/`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE.url}/blog`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts,
  ];
}
