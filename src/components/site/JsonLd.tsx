/**
 * Serialises JSON-LD for a `<script>` body. `<` becomes `\u003c` so a string like
 * "</script>" in the data can never close the tag early; JSON parsers read identical data.
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Emits one schema.org JSON-LD `<script>` (data comes from lib/seo/jsonld.ts). */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
