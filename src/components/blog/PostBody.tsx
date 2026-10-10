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
    <div className="flex flex-col gap-[clamp(1.25rem,2.6vw,1.875rem)]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'lead':
            return (
              <p key={i} className="type-read-lead text-start text-plum">
                {block.text}
              </p>
            );

          case 'paragraph':
            return (
              <p key={i} className="type-read text-start text-plum">
                {block.text}
              </p>
            );

          case 'heading':
            return (
              <h2
                key={i}
                className="type-card-title mt-[clamp(0.75rem,2vw,1.5rem)] text-start text-plum"
              >
                <span className="block">{block.text}</span>
                <span
                  aria-hidden="true"
                  className="mt-2.5 block h-[3px] w-11 rounded-full bg-mauve"
                />
              </h2>
            );

          case 'quote':
            return (
              <blockquote
                key={i}
                className="my-[clamp(0.5rem,1.5vw,1rem)] border-s-[3px] border-mauve ps-[clamp(1.125rem,3vw,2.125rem)]"
              >
                <p className="type-quote text-start text-plum/92">
                  {block.text}
                </p>
              </blockquote>
            );

          case 'list':
            return (
              <ul key={i} className="flex flex-col gap-4">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="mt-3 h-2 w-2 shrink-0 rounded-full bg-mauve"
                    />
                    <p className="type-read text-start text-plum">
                      {item.lead && (
                        <span className="font-bold text-plum">{item.lead} </span>
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
