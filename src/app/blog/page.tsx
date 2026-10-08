import type { Metadata } from 'next';

import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { PostCard } from '@/components/blog/PostCard';
import { getAllPosts } from '@/content/posts';
import { PageShell } from '@/components/site/PageShell';
import { SITE } from '@/content/site';
import { ID } from '@/content/ids';
import { stagger } from '@/lib/motion';
import { pageMeta } from '@/lib/seo/metadata';

// No `twitter` block on purpose: the index inherits the site-wide card from the root layout.
export const metadata: Metadata = pageMeta({
  title: `מאמרים | ${SITE.name} — ${SITE.tagline}`,
  description: `מחשבות, כלים ותובנות מהקליניקה על זוגיות, הורות ומשפחה — סדרת מאמרים מאת ${SITE.name}, מטפלת זוגית ומשפחתית ב${SITE.city}.`,
  path: '/blog',
  og: {
    title: `מאמרים | ${SITE.name}`,
    description: 'מחשבות, כלים ותובנות מהקליניקה על זוגיות, הורות ומשפחה.',
  },
});

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <PageShell overflow="hidden" surface="cream">
      <BlogHeader />

      {/* Intro band */}
      <Section id={ID.blogIntro} tone="dark" className="pt-[clamp(28px,4vw,52px)] pb-[clamp(48px,7vw,96px)]">
        <Container maxWidth="lg" className="text-center">
          <ScrollReveal className="flex flex-col items-center gap-[clamp(14px,2vw,22px)]">
            <span className="type-eyebrow text-[var(--color-blush)]">
              הבלוג
            </span>
            <h1 className="type-title font-bold tracking-[-0.01em] text-[color:var(--header-color)]">
              מחשבות מהקליניקה
            </h1>
            <p className="type-lead mx-auto max-w-[60ch] text-[var(--color-cream)]">
              רעיונות, כלים ותובנות על זוגיות, הורות והקשרים שאנחנו הכי רוצים
              לטפח. סדרת מאמרים שנכתבת מהלב ומהניסיון בחדר הטיפול.
            </p>
          </ScrollReveal>
        </Container>
      </Section>

      {/* Posts grid */}
      <Section id={ID.blogPosts} tone="cream" className="py-[clamp(48px,7vw,96px)]">
        <Container maxWidth="2xl">
          <div className="grid grid-cols-1 gap-[clamp(24px,3vw,40px)] md:grid-cols-2">
            {posts.map((post, i) => (
              <ScrollReveal key={post.slug} delay={stagger(i % 2)} className="h-full">
                <PostCard post={post} priority={i < 2} />
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
