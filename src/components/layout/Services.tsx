'use client';

import { motion } from 'framer-motion';

const services = [
  'adult psychotherapy',
  'memory practice',
  'couples therapy',
  'psychological evaluation',
  'play therapy',
  'neuropsychology',
];

export default function Services() {
  return (
    <section id="services" className="px-12 py-24 mx-auto max-w-7xl bg-white/40 rounded-3xl my-12">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-[#5C4A52] mb-6" style={{ fontFamily: 'var(--font-canva-secondary)' }}>
          Expert Guidance for Couples
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-[#9F8383]" style={{ fontFamily: 'var(--font-canva-primary)' }}>
          Quisque ut dui vel turpis dignissim congue a et elit. Proin vel turpis et ligula commodo malesuada ac id justo. Pellentesque bibendum quam in purus bibendum.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={service}
            className="p-8 border border-[#C8AAAA]/30 rounded-lg text-center hover:bg-white hover:shadow-md transition-all cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-[#F7E2D6] rounded-full flex items-center justify-center">
              <span className="text-[#5C4A52] font-serif text-xl">+</span>
            </div>
            <h3 className="uppercase tracking-widest text-[#5C4A52] font-semibold text-sm" style={{ fontFamily: 'var(--font-canva-primary)' }}>
              {service}
            </h3>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
