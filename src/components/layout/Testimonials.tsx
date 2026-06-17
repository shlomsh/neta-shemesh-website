'use client';

import { motion } from 'framer-motion';

export default function Testimonials() {
  return (
    <section id="testimonials" className="px-12 py-24 mx-auto max-w-7xl">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-[#5C4A52] mb-6" style={{ fontFamily: 'var(--font-canva-secondary)' }}>
          Most Trusted Clinical Psychologist
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <motion.div 
          className="bg-[#C8AAAA]/10 p-12 rounded-2xl relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl text-[#9F8383] font-serif absolute top-6 left-6 opacity-30">"</div>
          <p className="text-xl text-[#5C4A52] relative z-10 italic leading-relaxed" style={{ fontFamily: 'var(--font-canva-secondary)' }}>
            She created a space where we could finally hear each other. For the first time in years, we felt on the same side.
          </p>
          <div className="mt-8 font-semibold tracking-widest uppercase text-sm text-[#9F8383]" style={{ fontFamily: 'var(--font-canva-primary)' }}>
            — L & D
          </div>
        </motion.div>

        <motion.div 
          className="bg-[#C8AAAA]/10 p-12 rounded-2xl relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-6xl text-[#9F8383] font-serif absolute top-6 left-6 opacity-30">"</div>
          <p className="text-xl text-[#5C4A52] relative z-10 italic leading-relaxed" style={{ fontFamily: 'var(--font-canva-secondary)' }}>
            Expert guidance for overcoming obstacles and strengthening your bond. Highly recommended for any couple.
          </p>
          <div className="mt-8 font-semibold tracking-widest uppercase text-sm text-[#9F8383]" style={{ fontFamily: 'var(--font-canva-primary)' }}>
            — A & J
          </div>
        </motion.div>
      </div>
    </section>
  );
}
