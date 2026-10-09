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
