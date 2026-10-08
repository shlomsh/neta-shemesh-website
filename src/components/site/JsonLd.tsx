/** Emits one schema.org JSON-LD `<script>` (data comes from lib/seo/jsonld.ts). */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
