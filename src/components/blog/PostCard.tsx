import Link from 'next/link';
import { Photo } from '@/components/primitives/ui/Photo';
import type { BlogPost } from '@/content/posts';

interface PostCardProps {
  post: BlogPost;
  /** Eager-load the cover for above-the-fold cards (first row on the listing). */
  priority?: boolean;
  /** Heading level of the title: 3 under an h2 ("more posts"), 2 on the blog index under the h1. */
  headingLevel?: 2 | 3;
}

/**
 * PostCard — a single post preview for the listing grid and the "more posts"
 * row. Cover photo on top, then category eyebrow, title, excerpt and meta.
 *
 * Lives on cream surfaces → dark plum text (AAA). The whole card is a link.
 */
export function PostCard({ post, priority = false, headingLevel = 3 }: PostCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card bg-cream outline outline-[1.5px] outline-[color:color-mix(in_srgb,var(--color-plum)_18%,transparent)] transition-all duration-300 motion-safe:hover:-translate-y-1 hover:outline-mauve hover:shadow-[0_18px_40px_-20px_rgba(122,89,120,0.45)]"
    >
      {/* Cover */}
      <Photo
        src={post.coverImage}
        alt={post.coverAlt}
        radius="none"
        ratio="100/62"
        zoom="group"
        loading={priority ? 'eager' : 'lazy'}
        className="w-full"
      />

      {/* Body */}
      <div className="flex flex-1 flex-col gap-[12px] p-[clamp(20px,2.5vw,28px)]">
        <span className="type-eyebrow text-mauve">
          {post.category}
        </span>

        <Heading className="type-card-title text-plum">
          {post.title}
        </Heading>

        <p className="type-body text-[color:color-mix(in_srgb,var(--color-plum)_82%,transparent)]">
          {post.excerpt}
        </p>

        <div className="mt-auto flex items-center gap-[10px] pt-[8px] type-small text-[color:color-mix(in_srgb,var(--color-plum)_70%,transparent)]">
          <time dateTime={post.date}>{post.dateDisplay}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readTime}</span>
        </div>
      </div>
    </Link>
  );
}
