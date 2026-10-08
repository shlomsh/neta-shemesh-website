import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { PostBody } from '@/components/blog/PostBody';
import { PostCard } from '@/components/blog/PostCard';
import { AuthorCard } from '@/components/blog/AuthorCard';
import { getAllPosts, getPostBySlug, getOtherPosts } from '@/content/posts';
import { PageShell } from '@/components/site/PageShell';
import { JsonLd } from '@/components/site/JsonLd';
import { SITE } from '@/content/site';
import { ID } from '@/content/ids';
import { stagger } from '@/lib/motion';
import { pageMeta } from '@/lib/seo/metadata';
import { blogPostingJsonLd } from '@/lib/seo/jsonld';

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return pageMeta({
    title: `${post.title} | ${SITE.name}`,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    og: { title: post.title, description: post.excerpt },
    twitter: { title: post.title, description: post.excerpt },
    article: { publishedTime: post.date, imageUrl: `${SITE.url}${post.coverImage}` },
  });
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const others = getOtherPosts(slug);

  return (
    <PageShell overflow="hidden" surface="cream">
      <JsonLd data={blogPostingJsonLd(post)} />

      <BlogHeader />

      {/* Hero band — category, title, meta */}
      <Section id={ID.postHero} bgVariant="dark" className="pt-[clamp(20px,3vw,36px)] pb-[clamp(48px,7vw,96px)]">
        <Container maxWidth="md">
          <Link
            href="/blog"
            className="type-small mb-[clamp(20px,3vw,32px)] inline-flex items-center gap-[8px] font-bold text-[var(--color-blush)] transition-opacity hover:opacity-75"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="12" x2="20" y2="12" />
              <polyline points="14 6 20 12 14 18" />
            </svg>
            חזרה לכל המאמרים
          </Link>

          <div className="flex flex-col items-center gap-[clamp(14px,2vw,22px)] text-center">
            <span className="type-eyebrow text-[var(--color-blush)]">
              {post.category}
            </span>
            <h1 className="type-title font-bold tracking-[-0.01em] text-[color:var(--header-color)]">
              {post.title}
            </h1>
            <p className="type-lead mx-auto max-w-[60ch] text-[color:color-mix(in_srgb,var(--color-cream)_88%,transparent)]">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-[10px] type-small text-[var(--color-blush)]">
              <span>{SITE.name}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.date}>{post.dateDisplay}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readTime}</span>
            </div>
          </div>
        </Container>
      </Section>

      {/* Body — capped at a comfortable reading measure (~800px) */}
      <Section id={ID.postBody} bgVariant="cream" className="py-[clamp(40px,6vw,80px)]">
        <Container maxWidth="lg">
          <div className="mx-auto max-w-[800px]">
            {/* Cover — pulled up to overlap the seam with the dark hero */}
            <ScrollReveal>
              <div className="relative -mt-[clamp(64px,9vw,116px)] mb-[clamp(32px,5vw,56px)] w-full overflow-hidden rounded-card outline outline-[1.5px] outline-[color:color-mix(in_srgb,var(--color-plum)_15%,transparent)] shadow-[0_24px_60px_-30px_rgba(122,89,120,0.6)]">
                <div className="pt-[58%]" />
                <img
                  src={post.coverImage}
                  alt={post.coverAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </ScrollReveal>

            <article>
              <PostBody blocks={post.body} />
            </article>

            <div className="mt-[clamp(48px,7vw,80px)]">
              <AuthorCard />
            </div>
          </div>
        </Container>
      </Section>

      {/* Closing CTA */}
      <Section id={ID.postCta} bgVariant="dark" className="py-[clamp(56px,8vw,110px)]">
        <Container maxWidth="md">
          <div className="flex flex-col items-center gap-[clamp(24px,3.5vw,40px)] text-center">
            <p className="type-quote mx-auto max-w-[55ch] text-[var(--color-cream)]">
              {post.cta.text}
            </p>
            <ButtonLink href={post.cta.href} variant="secondary">{post.cta.buttonLabel}</ButtonLink>
          </div>
        </Container>
      </Section>

      {/* More from the series */}
      {others.length > 0 && (
        <Section id={ID.postMore} bgVariant="cream" className="py-[clamp(48px,7vw,96px)]">
          <Container maxWidth="2xl">
            <h2 className="type-title font-bold tracking-[-0.01em] text-[color:var(--header-color)] mb-[clamp(28px,4vw,48px)] text-center">
              עוד מהבלוג
            </h2>
            <div className="grid grid-cols-1 gap-[clamp(24px,3vw,40px)] md:grid-cols-2">
              {others.map((other, i) => (
                <ScrollReveal key={other.slug} delay={stagger(i % 2)} className="h-full">
                  <PostCard post={other} />
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </PageShell>
  );
}
