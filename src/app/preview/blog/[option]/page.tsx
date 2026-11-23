import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/site/PageShell';
import { Hero } from '@/components/sections/hero/Hero';
import { Bio } from '@/components/sections/bio/Bio';
import { Expertise } from '@/components/sections/expertise/Expertise';
import { Faq } from '@/components/sections/faq/Faq';
import { Credentials } from '@/components/sections/credentials/Credentials';
import { Services } from '@/components/sections/services/Services';
import { ContactOffice } from '@/components/sections/contact/ContactOffice';
import { BlogSpotlight, HeroArticlePreview } from '@/components/blog/BlogSpotlight';
import { BLOG_PREVIEW_OPTIONS } from '@/content/home/blog-preview';
import { ANCHOR } from '@/content/ids';

export const metadata: Metadata = {
  title: 'חלופות להבלטת הבלוג',
  robots: { index: false, follow: false },
};

export default async function BlogPreviewPage({ params }: { params: Promise<{ option: string }> }) {
  const { option: slug } = await params;
  const environment = process.env.VERCEL_ENV;
  const enabled = environment === 'preview'
    ? slug === 'hero'
    : environment !== 'production' && process.env.NODE_ENV === 'development';
  if (!enabled) notFound();
  const option = BLOG_PREVIEW_OPTIONS.find((item) => item.slug === slug)?.slug;
  if (!option) notFound();

  return (
    <PageShell overflow="clip" snapCards>
      <Hero articlePreview={option === 'hero' ? <HeroArticlePreview /> : undefined} />
      {option !== 'hero' && option !== 'quote' && <BlogSpotlight option={option} />}
      <Bio />
      <Expertise />
      {option === 'quote' && <BlogSpotlight option="quote" />}
      <Faq />
      <Credentials />
      <div id={ANCHOR.reignite} className="invisible h-0" aria-hidden="true" />
      <Services />
      <div id={ANCHOR.gallery} className="invisible h-0" aria-hidden="true" />
      <ContactOffice />
    </PageShell>
  );
}
