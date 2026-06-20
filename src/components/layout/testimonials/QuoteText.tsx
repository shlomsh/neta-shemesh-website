import React from 'react';

export interface QuoteTextProps {
  text: string;
}

export function QuoteText({ text }: QuoteTextProps) {
  return (
    <p
      className="
        type-quote
        text-[var(--color-text-primary)]
        font-[family-name:var(--font-canva-primary)]
        text-right
        mt-[64px]
        mb-[32px]
      "
    >
      {text}
    </p>
  );
}
