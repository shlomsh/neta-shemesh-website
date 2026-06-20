import React from 'react';

export interface QuoteTextProps {
  text: string;
}

export function QuoteText({ text }: QuoteTextProps) {
  return (
    <p
      className="
        text-[var(--color-text-primary)]
        font-[family-name:var(--font-canva-primary)]
        font-bold
        text-base
        md:text-[18px]
        leading-[1.65]
        text-right
        mt-[64px]
        mb-[32px]
      "
    >
      {text}
    </p>
  );
}
