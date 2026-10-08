import type { ContentBlock } from '@/content/posts';

interface PostBodyProps {
  blocks: ContentBlock[];
}

/**
 * PostBody — renders the structured article blocks into the reading column.
 *
 * Typography per design system:
 *   - lead      → type-lead (opening paragraph)
 *   - paragraph → type-body
 *   - heading   → type-card-title (Stanga bold; Elamy is reserved for the
 *                 single post title, repeated subheads must stay legible)
 *   - quote     → type-quote pull-quote with a mauve start-border (RTL right)
 *   - list      → bulleted list, optional bold lead-in per item
 *
 * Lives on a cream surface → dark plum text (AAA), so any size/weight is safe.
 */
export function PostBody({ blocks }: PostBodyProps) {
  return (
    <div dir="rtl" className="flex flex-col gap-[clamp(20px,2.6vw,30px)]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'lead':
            return (
              <p key={i} className="type-read-lead text-right text-[var(--color-plum)]">
                {block.text}
              </p>
            );

          case 'paragraph':
            return (
              <p key={i} className="type-read text-right text-[var(--color-plum)]">
                {block.text}
              </p>
            );

          case 'heading':
            return (
              <h2
                key={i}
                className="type-card-title mt-[clamp(12px,2vw,24px)] text-right text-[var(--color-plum)]"
              >
                <span className="block">{block.text}</span>
                <span
                  aria-hidden="true"
                  className="mt-[10px] block h-[3px] w-[44px] rounded-full bg-[var(--color-mauve)]"
                />
              </h2>
            );

          case 'quote':
            return (
              <blockquote
                key={i}
                className="my-[clamp(8px,1.5vw,16px)] border-r-[3px] border-[var(--color-mauve)] pr-[clamp(18px,3vw,34px)]"
              >
                <p className="type-quote text-right text-[color:color-mix(in_srgb,var(--color-plum)_92%,transparent)]">
                  {block.text}
                </p>
              </blockquote>
            );

          case 'list':
            return (
              <ul key={i} className="flex flex-col gap-[16px]">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-[14px]">
                    <span
                      aria-hidden="true"
                      className="mt-[12px] h-[8px] w-[8px] shrink-0 rounded-full bg-[var(--color-mauve)]"
                    />
                    <p className="type-read text-right text-[var(--color-plum)]">
                      {item.lead && (
                        <span className="font-bold text-[var(--color-plum)]">{item.lead} </span>
                      )}
                      {item.text}
                    </p>
                  </li>
                ))}
              </ul>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
