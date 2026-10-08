'use client';

/**
 * FooterReveal — local ScrollReveal wrapper for the Footer.
 *
 * Always renders the same <motion.div> on server and client (no
 * `useReducedMotion()` branch: it differs between SSR and the first client
 * render, which left the SSR `opacity:0` stuck after hydration). Under
 * `prefers-reduced-motion: reduce`, the `[data-reveal]` rule in globals.css
 * forces opacity:1 / transform:none, so the content resolves immediately.
 */

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FooterRevealProps {
  children: ReactNode;
  delay?: number; // seconds
  style?: React.CSSProperties;
}

export function FooterReveal({ children, delay = 0, style }: FooterRevealProps) {
  return (
    <motion.div
      data-reveal=""
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
