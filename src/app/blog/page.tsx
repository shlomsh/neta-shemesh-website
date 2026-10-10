import type { Metadata } from 'next';

import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { SectionTitle } from '@/components/primitives/ui/SectionTitle';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
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
    <PageShell overflow="hidden">
      <BlogHeader />

      {/* Intro band */}
      <Section id={ID.blogIntro} tone="dark" className="pt-region pb-section-mid">
        <Container id={ID.mainContent} maxWidth="lg" className="text-center">
          {/* The title is static (CLAUDE.md typography rule 9); the eyebrow and the lead reveal around it. */}
          <div className="flex flex-col items-center gap-stack">
            <ScrollReveal>
              <span className="type-eyebrow block text-cream">
                הבלוג
              </span>
            </ScrollReveal>
            <SectionTitle as="h1">מחשבות מהקליניקה</SectionTitle>
            <ScrollReveal delay={0.1}>
              <p className="type-lead mx-auto max-w-[60ch] text-cream">
                רעיונות, כלים ותובנות על זוגיות, הורות והקשרים שאנחנו הכי רוצים
                לטפח. סדרת מאמרים שנכתבת מהלב ומהניסיון בחדר הטיפול.
              </p>
            </ScrollReveal>
          </div>
        </Container>
      </Section>

      {/* Posts grid */}
      <Section id={ID.blogPosts} tone="cream" className="py-section-mid">
        <Container maxWidth="2xl">
          <div className="grid grid-cols-1 gap-panel md:grid-cols-2">
            {posts.map((post, i) => (
              <ScrollReveal key={post.slug} delay={stagger(i % 2)} className="h-full">
                <PostCard post={post} eager={i < 2} headingLevel={2} />
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </Section>
    </PageShell>
  );
}
