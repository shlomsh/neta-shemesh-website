export interface QuoteBlockProps {
  lines: string[];
}

export function QuoteBlock({ lines }: QuoteBlockProps) {
  return (
    <div className="flex flex-col gap-[1.1em]" dir="rtl">
      {lines.map((line, i) => (
        <p
          key={i}
          className="type-quote"
        >
          {line}
        </p>
      ))}
    </div>
  );
}
