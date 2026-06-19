'use client';

/**
 * FooterReveal — local ScrollReveal wrapper for the Footer rebuild.
 *
 * Uses framer-motion so that under Playwright's reducedMotion:'reduce'
 * the element resolves immediately to opacity:1 / translateY:0 (no hidden
 * intermediate state). This satisfies the structural-verify gate.
 *
 * We do NOT touch globals.css, ScrollReveal.tsx (non-existent), or any
 * shared primitive.
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FooterRevealProps {
  children: ReactNode;
  delay?: number; // seconds
  style?: React.CSSProperties;
}

export function FooterReveal({ children, delay = 0, style }: FooterRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  // When reducedMotion is requested, skip animation entirely — resolve immediately.
  if (prefersReducedMotion) {
    return (
      <div style={{ opacity: 1, transform: 'none', ...style }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
