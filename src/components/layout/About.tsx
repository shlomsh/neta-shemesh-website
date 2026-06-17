'use client';

import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="px-12 py-24 mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between">
      <motion.div 
        className="md:w-1/2 mb-12 md:mb-0"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Placeholder for Profile Image */}
        <div className="w-full max-w-md aspect-square bg-[#C8AAAA]/20 rounded-full mx-auto relative shadow-sm flex items-center justify-center text-[#9F8383]">
          [ Profile Image Placement ]
        </div>
      </motion.div>

      <motion.div 
        className="md:w-1/2 md:pl-16 space-y-6"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-[#5C4A52]" style={{ fontFamily: 'var(--font-canva-secondary)' }}>
          Dr. Elowen Avalon, PhD
        </h2>
        <h3 className="text-xl uppercase tracking-widest text-[#9F8383]" style={{ fontFamily: 'var(--font-canva-primary)' }}>
          Clinical Psychologist
        </h3>
        <p className="text-lg text-[#5C4A52] leading-relaxed" style={{ fontFamily: 'var(--font-canva-primary)' }}>
          Expert guidance for overcoming obstacles and strengthening your bond. Quisque ut dui vel turpis dignissim congue a et elit.
        </p>
        
        <div className="grid grid-cols-2 gap-6 pt-6 mt-6 border-t border-[#C8AAAA]/30">
          <div>
            <div className="text-3xl font-serif text-[#5C4A52] mb-2" style={{ fontFamily: 'var(--font-canva-secondary)' }}>15+</div>
            <div className="text-sm uppercase tracking-wider text-[#9F8383]" style={{ fontFamily: 'var(--font-canva-primary)' }}>Years Experience</div>
          </div>
          <div>
            <div className="text-3xl font-serif text-[#5C4A52] mb-2" style={{ fontFamily: 'var(--font-canva-secondary)' }}>1,000+</div>
            <div className="text-sm uppercase tracking-wider text-[#9F8383]" style={{ fontFamily: 'var(--font-canva-primary)' }}>Satisfied Clients</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
