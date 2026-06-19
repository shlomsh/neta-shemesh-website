'use client';

import { ReactNode } from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface FooterRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Thin wrapper that delegates to the shared ScrollReveal primitive.
 * Lives here so the server-parent Footer can pass a numeric delay
 * and each block gets its own stagger without any client state.
 */
export function FooterReveal({ children, delay = 0, className }: FooterRevealProps) {
  return (
    <ScrollReveal delay={delay} className={className}>
      {children}
    </ScrollReveal>
  );
}
