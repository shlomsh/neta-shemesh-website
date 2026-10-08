import Link from 'next/link';
import type { BlogPost } from '@/content/posts';

interface PostCardProps {
  post: BlogPost;
  /** Eager-load the cover for above-the-fold cards (first row on the listing). */
  priority?: boolean;
}

/**
 * PostCard — a single post preview for the listing grid and the "more posts"
 * row. Cover photo on top, then category eyebrow, title, excerpt and meta.
 *
 * Lives on cream surfaces → dark plum text (AAA). The whole card is a link.
 */
export function PostCard({ post, priority = false }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      dir="rtl"
      className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-[var(--color-cream)] outline outline-[1.5px] outline-[color:color-mix(in_srgb,var(--color-plum)_18%,transparent)] transition-all duration-300 hover:-translate-y-1 hover:outline-[color:var(--color-mauve)] hover:shadow-[0_18px_40px_-20px_rgba(122,89,120,0.45)]"
    >
      {/* Cover */}
      <div className="relative w-full overflow-hidden">
        <div className="pt-[62%]" />
        <img
          src={post.coverImage}
          alt={post.coverAlt}
          loading={priority ? 'eager' : 'lazy'}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-[12px] p-[clamp(20px,2.5vw,28px)]">
        <span className="type-eyebrow uppercase tracking-[0.08em] text-[var(--color-mauve)]">
          {post.category}
        </span>

        <h3 className="type-card-title text-[var(--color-plum)]">
          {post.title}
        </h3>

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
