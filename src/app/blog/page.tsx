import type { Metadata } from 'next';

import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { PostCard } from '@/components/blog/PostCard';
import { getAllPosts } from '@/content/posts';
import Footer from '@/components/layout/Footer';
import { WhatsAppFAB } from '@/components/ui/WhatsAppFAB';
import { PhoneFAB } from '@/components/ui/PhoneFAB';
import { SITE_URL } from '@/config/constants';

export const metadata: Metadata = {
  title: 'מאמרים | נטע שמש — טיפול זוגי ומשפחתי',
  description:
    'מחשבות, כלים ותובנות מהקליניקה על זוגיות, הורות ומשפחה — סדרת מאמרים מאת נטע שמש, מטפלת זוגית ומשפחתית בנתניה.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/blog`,
    title: 'מאמרים | נטע שמש',
    description: 'מחשבות, כלים ותובנות מהקליניקה על זוגיות, הורות ומשפחה.',
    locale: 'he_IL',
    siteName: 'נטע שמש',
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="relative w-full overflow-hidden" style={{ backgroundColor: 'var(--color-cream)' }}>
      <BlogHeader />

      {/* Intro band */}
      <Section id="blog-intro" bgVariant="dark" className="pt-[clamp(28px,4vw,52px)] pb-[clamp(48px,7vw,96px)]">
        <Container maxWidth="lg" className="text-center">
          <ScrollReveal delay={0} className="flex flex-col items-center gap-[clamp(14px,2vw,22px)]">
            <span className="type-eyebrow uppercase tracking-[0.08em] text-[var(--color-blush)]">
              הבלוג
            </span>
            <h1 className="section-header font-[family-name:var(--font-display)]">
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
      <Section id="blog-posts" bgVariant="cream" className="py-[clamp(48px,7vw,96px)]">
        <Container maxWidth="2xl">
          <div className="grid grid-cols-1 gap-[clamp(24px,3vw,40px)] md:grid-cols-2">
            {posts.map((post, i) => (
              <ScrollReveal key={post.slug} delay={(i % 2) * 0.12} className="h-full">
                <PostCard post={post} priority={i < 2} />
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </Section>

      <Footer />
      <WhatsAppFAB />
      <PhoneFAB />
    </main>
  );
}
