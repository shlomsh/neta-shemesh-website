'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed w-full z-50 top-0 left-0 px-12 py-8 flex items-center justify-between text-white bg-transparent">
      <Link href="/" className="text-5xl tracking-normal" style={{ fontFamily: 'YAFdtQi73Xs-0, cursive' }}>
        Doctor Avalon
      </Link>
      
      <div className="hidden md:flex items-center space-x-8 font-bold tracking-widest text-sm" style={{ fontFamily: 'YAErUQDw3VY-0, sans-serif' }}>
        <Link href="#about" className="hover:text-white/70 transition-colors uppercase">About</Link>
        <Link href="#expertise" className="hover:text-white/70 transition-colors uppercase">Expertise</Link>
        <Link href="#contact" className="hover:text-white/70 transition-colors uppercase">Contact</Link>
        <button className="bg-[#B39D3F] text-white px-6 py-3 ml-4 hover:bg-[#8e7d32] transition-colors uppercase font-bold">
          +01 234 5678 90
        </button>
      </div>
      <div className="md:hidden">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
    </nav>
  );
}
