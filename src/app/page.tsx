import Hero from '@/components/layout/Hero';
import { AboutIntro, AboutBio, AboutCredentials, AboutGallery } from '@/components/layout/About';
import Expertise from '@/components/layout/Expertise';
import Services from '@/components/layout/Services';
import Testimonials from '@/components/layout/Testimonials';
import Contact from '@/components/layout/Contact';
import { PageShell } from '@/components/site/PageShell';
import SoftSnap from '@/components/ui/SoftSnap';

export default function Home() {
  return (
    // overflow 'clip', never 'hidden': SoftSnap and sticky need <main> not to be a scroll container.
    <PageShell overflow="clip" behaviors={<SoftSnap />}>
      <Hero />
      <AboutIntro />
      <Expertise />
      <AboutBio />
      <AboutCredentials />
      <AboutGallery />
      <Services />
      <Testimonials />
      <Contact />
    </PageShell>
  );
}
