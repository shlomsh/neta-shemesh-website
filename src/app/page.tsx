import Hero from '@/components/layout/Hero';
import About from '@/components/layout/About';
import Expertise from '@/components/layout/Expertise';
import Services from '@/components/layout/Services';
import Testimonials from '@/components/layout/Testimonials';
import Contact from '@/components/layout/Contact';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main className="relative w-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-light)' }}>
      <Hero />
      <About />
      <Expertise />
      <Services />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
