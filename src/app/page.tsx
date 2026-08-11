import Hero from '@/components/layout/Hero';
import { AboutIntro, AboutBio, AboutCredentials, AboutGallery } from '@/components/layout/About';
import Expertise from '@/components/layout/Expertise';
import Services from '@/components/layout/Services';
import Testimonials from '@/components/layout/Testimonials';
import Contact from '@/components/layout/Contact';
import Footer from '@/components/layout/Footer';
import { WhatsAppFAB } from '@/components/ui/WhatsAppFAB';
import { PhoneFAB } from '@/components/ui/PhoneFAB';

export default function Home() {
  return (
    <main className="relative w-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-light)' }}>
      <Hero />
      <AboutIntro />
      <Expertise />
      <AboutBio />
      <AboutCredentials />
      <AboutGallery />
      <Services />
      <Testimonials />
      <Contact />
      <Footer />
      <WhatsAppFAB />
      <PhoneFAB />
    </main>
  );
}
