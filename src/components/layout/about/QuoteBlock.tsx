export interface QuoteBlockProps {
  lines: string[];
  authorName: string;
  authorTitle: string;
}

export function QuoteBlock({ lines, authorName, authorTitle }: QuoteBlockProps) {
  return (
    <div className="flex flex-col gap-[0.75em]" dir="rtl">
      {lines.map((line, i) => (
        <p
          key={i}
          className="text-[var(--color-white)] leading-[1.45] tracking-[0.012em] font-[family-name:var(--font-canva-primary)]"
        >
          {line}
        </p>
      ))}
      <div className="mt-[0.5em]">
        <p
          className="text-[var(--color-white)] font-bold leading-[1.45] tracking-[0.012em] font-[family-name:var(--font-canva-secondary)]"
        >
          {authorName}
        </p>
        <p
          className="text-[var(--color-white)] italic leading-[1.45] tracking-[0.012em] font-[family-name:var(--font-canva-primary)]"
        >
          {authorTitle}
        </p>
      </div>
    </div>
  );
}
