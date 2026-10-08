export interface QuoteTextProps {
  text: string;
}

export function QuoteText({ text }: QuoteTextProps) {
  return (
    <p
      className="
        type-quote
        text-[var(--color-text-primary)]
        font-[family-name:var(--font-body)]
        text-right
        mt-[64px]
        mb-[32px]
      "
    >
      {text}
    </p>
  );
}
