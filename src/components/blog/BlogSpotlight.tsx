import Link from 'next/link';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { Card } from '@/components/primitives/layout/Card';
import { SectionHeader } from '@/components/primitives/ui/SectionHeader';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { Photo } from '@/components/primitives/ui/Photo';
import { BLOG_PREVIEW, type BlogPreviewOption } from '@/content/home/blog-preview';
import { PREVIEW_ID } from '@/content/ids';
import { PostCard } from './PostCard';
import { ArticleChooser } from './ArticleChooser';
import { HeroArticleCarousel } from './HeroArticleCarousel';

export function HeroArticlePreview() {
  const { slides, ...labels } = BLOG_PREVIEW.hero;
  return <HeroArticleCarousel {...labels} eyebrow={BLOG_PREVIEW.eyebrow} slides={slides.map(({ post, hook, text }) => ({
    href: `/blog/${post.slug}`, cover: post.coverImage, alt: post.coverAlt, readTime: post.readTime, hook, text,
  }))} />;
}

export function BlogSpotlight({ option }: { option: Exclude<BlogPreviewOption, 'hero'> }) {
  const copy = BLOG_PREVIEW[option];
  return (
    <Section id={PREVIEW_ID.blogSpotlight} aria-labelledby={PREVIEW_ID.blogSpotlightTitle} tone={option === 'quote' ? 'light' : 'cream'} fit="free" pad="section">
      <Container maxWidth="2xl">
        <p className="type-eyebrow mb-stack text-center">{BLOG_PREVIEW.eyebrow}</p>
        <SectionHeader id={PREVIEW_ID.blogSpotlightTitle} title={copy.title} subtitle={copy.subtitle} align="center" />

        {option === 'editorial' && (
          <div className="mt-region grid gap-region lg:grid-cols-2">
            <Photo src={BLOG_PREVIEW.editorial.post.coverImage} alt={BLOG_PREVIEW.editorial.post.coverAlt} radius="card" ratio="100/62" sizes="(min-width: 1024px) 45vw, 90vw" />
            <div className="flex flex-col items-start justify-center gap-stack">
              <span className="type-small">{BLOG_PREVIEW.editorial.post.readTime}</span>
              <h3 className="type-card-title font-bold">{BLOG_PREVIEW.editorial.hook}</h3>
              <p className="type-lead max-w-prose">{BLOG_PREVIEW.editorial.post.excerpt}</p>
              <ButtonLink href={`/blog/${BLOG_PREVIEW.editorial.post.slug}`}>{BLOG_PREVIEW.read}</ButtonLink>
            </div>
          </div>
        )}

        {option === 'chooser' && <ArticleChooser />}

        {option === 'quote' && (
          <Card surface="cream" pad="lg" className="mx-auto mt-region flex max-w-3xl flex-col items-center gap-panel border border-plum/20 text-center">
            <blockquote className="type-quote max-w-prose">
              <p>״{BLOG_PREVIEW.quote.text}״</p>
            </blockquote>
            <p className="type-small">{BLOG_PREVIEW.quote.attribution}</p>
            <p className="type-lead max-w-prose">{BLOG_PREVIEW.quote.invitation}</p>
            <ButtonLink href={`/blog/${BLOG_PREVIEW.quote.post.slug}`}>{BLOG_PREVIEW.read}</ButtonLink>
            <span className="type-small">{BLOG_PREVIEW.quote.post.readTime}</span>
          </Card>
        )}

        {option === 'magazine' && (
          <div className="mt-region grid gap-panel lg:grid-cols-3">
            {BLOG_PREVIEW.magazine.posts.map((post) => <PostCard key={post.slug} post={post} />)}
          </div>
        )}

        <div className="mt-region text-center">
          <Link href="/blog" className="type-lead inline-flex min-h-11 items-center font-bold text-plum underline decoration-plum/40 underline-offset-4 focus-ring focus-visible:ring-plum">
            {BLOG_PREVIEW.all}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
