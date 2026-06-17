'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed w-full z-50 top-0 left-0 px-12 py-8 flex items-center justify-between text-white bg-transparent">
      <Link href="/" className="text-5xl tracking-normal" style={{ fontFamily: 'var(--font-canva-accent), cursive' }}>
        נטע שמש
      </Link>
      
      <div className="hidden md:flex items-center space-x-8 font-bold tracking-widest text-sm" style={{ fontFamily: 'var(--font-canva-secondary), sans-serif' }}>
        <Link href="#about" className="hover:text-white/70 transition-colors uppercase">קצת עליי</Link>
        <Link href="#expertise" className="hover:text-white/70 transition-colors uppercase">התמחות</Link>
        <Link href="#contact" className="hover:text-white/70 transition-colors uppercase">יצירת קשר</Link>
        <button className="bg-[var(--color-brand-secondary)] text-white px-6 py-3 ml-4 hover:bg-[var(--color-brand-dark)] transition-colors uppercase font-bold">
          +01 234 5678 90
        </button>
      </div>
      <div className="md:hidden">
        <img src="assets/svg/fa153455.svg"   />
      </div>
    </nav>
  );
}
