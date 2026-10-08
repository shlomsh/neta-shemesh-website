export interface QuoteBlockProps {
  lines: string[];
  authorName?: string;
  authorTitle?: string;
}

export function QuoteBlock({ lines, authorName, authorTitle }: QuoteBlockProps) {
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
      {(authorName || authorTitle) && (
        <div className="mt-[1.5em]">
          {authorName && (
            <p className="type-lead font-bold">
              {authorName}
            </p>
          )}
          {authorTitle && (
            <p className="type-small opacity-80">
              {authorTitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
