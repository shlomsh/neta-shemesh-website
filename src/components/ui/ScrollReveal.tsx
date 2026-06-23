'use client';

import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * ScrollReveal — entrance animation as an element scrolls into view.
 *
 * Refined choreography: a short rise paired with a soft blur-in on a gentle
 * ease-out, so content resolves into focus rather than just sliding. Reveals
 * once, then stays put.
 *
 * Honours `prefers-reduced-motion`: renders children immediately with no
 * transform, blur, or fade.
 */
export function ScrollReveal({ children, delay = 0, className = '' }: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
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
