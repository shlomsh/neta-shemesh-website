import type { BlogPost } from './types';
import { oneHourAWeekIsNotEnough } from './one-hour-a-week-is-not-enough';
import { lonelinessInARelationship } from './loneliness-in-a-relationship';

export type { BlogPost, ContentBlock, ListItem } from './types';

/**
 * Post registry. Newest first — add new posts to the top of this array and the
 * listing, routes, sitemap and metadata pick them up automatically.
 */
export const posts: BlogPost[] = [
  lonelinessInARelationship,
  oneHourAWeekIsNotEnough,
];

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

/** Other posts in the series, for the "more posts" section. */
export function getOtherPosts(slug: string): BlogPost[] {
  return posts.filter((post) => post.slug !== slug);
}
