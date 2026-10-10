import type { Metadata, ResolvingMetadata } from 'next';
import { SoftSnap } from '@/components/motion/SoftSnap';
import { PageShell } from '@/components/site/PageShell';
import { Hero } from '@/components/sections/hero/Hero';
import { Intro } from '@/components/sections/intro/Intro';
import { Expertise } from '@/components/sections/expertise/Expertise';
import { Bio } from '@/components/sections/bio/Bio';
import { Credentials } from '@/components/sections/credentials/Credentials';
import { Reignite } from '@/components/sections/reignite/Reignite';
import { Services } from '@/components/sections/services/Services';
import { Testimonials } from '@/components/sections/testimonials/Testimonials';
import { CtaBand } from '@/components/sections/cta-band/CtaBand';
import { Gallery } from '@/components/sections/gallery/Gallery';
import { ContactSocial } from '@/components/sections/contact/ContactSocial';
import { ContactOffice } from '@/components/sections/contact/ContactOffice';
import { SITE } from '@/content/site';
import { pageMeta } from '@/lib/seo/metadata';

/**
 * The home page's own metadata: canonical, hreflang, title, description and Open Graph. No `twitter`
 * block on purpose: the page inherits the site-wide card from the root layout (same as the blog index).
 *
 * A page-level `openGraph` replaces the root layout's file-convention image (`app/opengraph-image.png`),
 * and `pageMeta` falls back to the plain, un-versioned `DEFAULT_OG_IMAGE`. The home page keeps the file
 * convention's own tags (cache-busted URL, type, alt) by taking the already-resolved images from `parent`.
 */
export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const meta = pageMeta({
    title: `${SITE.tagline} ב${SITE.city} | ${SITE.name}`,
    description: 'מטפלת זוגית ומשפחתית מוסמכת בנתניה (פולג). ליווי אישי לזוגות ומשפחות בתהליכי שינוי, משבר וצמיחה. קבעו פגישת ייעוץ ראשונה עוד היום.',
    hreflang: true,
    og: {
      title: `${SITE.name} | ${SITE.tagline} ב${SITE.city}`,
      description: 'מטפלת זוגית ומשפחתית מוסמכת בנתניה. ליווי לזוגות ומשפחות בתהליכי שינוי וצמיחה.',
    },
  });
  const { openGraph } = await parent;
  return openGraph?.images ? { ...meta, openGraph: { ...meta.openGraph, images: openGraph.images } } : meta;
}

// Toggle to re-enable the "לקוחות ממליצים" recommendations section.
// Kept in code but hidden until we have real client testimonials.
const SHOW_TESTIMONIALS = false;

export default function Home() {
  return (
    // overflow 'clip', never 'hidden': SoftSnap and sticky need <main> not to be a scroll container.
    <PageShell overflow="clip" behaviors={<SoftSnap />}>
      <Hero />
      <Intro />
      <Expertise />
      <Bio />
      <Credentials />
      <Reignite />
      <Services />
      {SHOW_TESTIMONIALS && <Testimonials />}
      <CtaBand />
      <Gallery />
      <ContactSocial />
      <ContactOffice />
    </PageShell>
  );
}
