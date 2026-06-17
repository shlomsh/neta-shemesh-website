'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section 
      className="relative w-full h-screen min-h-[800px] flex items-center bg-black overflow-hidden"
    >
      <div 
        className="absolute inset-0 w-full h-full opacity-80"
        style={{
          backgroundImage: "url('/images/28cc9da582744dbdf29f3d091bd7265a.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-12 w-full flex flex-col items-start pt-32">
        <h1 className="text-white text-6xl md:text-8xl max-w-3xl leading-tight mb-8" style={{ fontFamily: 'YACgEZ1cb1Q-0, serif' }}>
          We're Drifting Apart. Can Somebody Help Save Our Relationship?
        </h1>
        <p className="text-white text-xl max-w-2xl mb-12 tracking-wide font-light leading-relaxed" style={{ fontFamily: 'YAErUQDw3VY-0, sans-serif' }}>
          Our connection, once so strong, now seems fragile. Can we still find the strength to rebuild and rediscover each other?
        </p>
        <button className="bg-[#B39D3F] text-white px-8 py-4 uppercase font-bold tracking-widest text-sm hover:bg-[#8e7d32] transition-colors">
          Consult Dr. Avalon
        </button>
      </div>
    </section>
  );
}
