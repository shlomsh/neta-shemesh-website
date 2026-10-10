interface QuoteTextProps {
  text: string;
}

export function QuoteText({ text }: QuoteTextProps) {
  return (
    <p
      className="
        type-quote
        text-plum
        font-[family-name:var(--font-body)]
        text-start
        mt-[64px]
        mb-[32px]
      "
    >
      {text}
    </p>
  );
}
