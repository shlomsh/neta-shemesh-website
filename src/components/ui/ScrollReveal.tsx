'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Fade/rise-in on scroll.
 *
 * Always renders the same <motion.div> on the server and the client. Do NOT
 * branch on `useReducedMotion()` here: it is false during SSR and true on the
 * first client render, so the server HTML ships `style="opacity:0"`, React
 * hydration never patches mismatched style attributes, and the content stays
 * invisible forever for reduce-motion users.
 *
 * Reduced motion is handled in CSS instead: `[data-reveal]` is forced to
 * opacity:1 / transform:none under `@media (prefers-reduced-motion: reduce)`
 * (globals.css), which beats the inline styles and does not depend on hydration.
 */
export function ScrollReveal({ children, delay = 0, className = '' }: ScrollRevealProps) {
  return (
    <motion.div
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
