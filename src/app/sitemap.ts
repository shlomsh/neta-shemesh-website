import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/content/posts';

const SITE = 'https://nettashemesh.vercel.app';

// lastmod in date-only (YYYY-MM-DD) W3C format — the conventional, least-fussy
// form for crawlers. Passing a Date would serialize to full ISO with millis.
const ymd = (d: Date) => d.toISOString().slice(0, 10);

export default function sitemap(): MetadataRoute.Sitemap {
  const today = ymd(new Date());

  const posts = getAllPosts().map((post) => ({
    url: `${SITE}/blog/${post.slug}`,
    lastModified: ymd(new Date(post.date)),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: `${SITE}/`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE}/blog`,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts,
  ];
}
