/**
 * Blog content model.
 *
 * Posts are authored as plain data (one file per post under this directory) and
 * rendered by the generic blog layout. Body copy is a sequence of typed blocks
 * so every future post in the series fits the same template without bespoke JSX.
 */

export interface ListItem {
  /** Optional bold lead-in (e.g. a term being defined), rendered before `text`. */
  lead?: string;
  text: string;
}

export type ContentBlock =
  | { type: 'lead'; text: string }        // opening paragraph (type-lead)
  | { type: 'paragraph'; text: string }   // standard body paragraph (type-body)
  | { type: 'heading'; text: string }     // in-article H2 (Stanga bold, type-card-title)
  | { type: 'quote'; text: string }       // pull-quote callout (type-quote)
  | { type: 'list'; items: ListItem[] };  // bulleted list, items may have a bold lead-in

export interface BlogPost {
  /** URL-safe English slug → /blog/<slug> */
  slug: string;
  /** Category label, e.g. "הדרכת הורים" */
  category: string;
  title: string;
  /** Short summary used on the listing card and in metadata. */
  excerpt: string;
  /** ISO 8601 date, e.g. "2026-06-12" — used for <time> and JSON-LD. */
  date: string;
  /** Human Hebrew date for display, e.g. "12 ביוני 2026". */
  dateDisplay: string;
  /** e.g. "4 דקות קריאה" */
  readTime: string;
  /** Path under /public, e.g. "/images/expertise-parenting.webp" */
  coverImage: string;
  coverAlt: string;
  body: ContentBlock[];
  /** Closing call-to-action rendered as its own band after the body. */
  cta: {
    text: string;
    buttonLabel: string;
    href: string;
  };
}
