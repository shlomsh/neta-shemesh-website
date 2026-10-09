import type { RichLine } from '@/content/types';

/** The contact panels' lead paragraph: `start`, a bold run, `end` (see `RichLine`). */
export function RichParagraph({ line }: { line: RichLine }) {
  return (
    <p className="type-lead">
      {line.start}
      <strong>{line.bold}</strong>
      {line.end}
    </p>
  );
}
