import Hero from '@/components/layout/Hero';
import { AboutIntro, AboutBio, AboutCredentials, AboutGallery } from '@/components/layout/About';
import Expertise from '@/components/layout/Expertise';
import Services from '@/components/layout/Services';
import Testimonials from '@/components/layout/Testimonials';
import Contact from '@/components/layout/Contact';
import Footer from '@/components/layout/Footer';
import { ContactFAB } from '@/components/ui/ContactFAB';
import SoftSnap from '@/components/ui/SoftSnap';

export default function Home() {
  return (
    <main className="relative w-full overflow-clip" style={{ backgroundColor: 'var(--color-bg-light)' }}>
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
      <ContactFAB />
      <SoftSnap />
    </main>
  );
}
