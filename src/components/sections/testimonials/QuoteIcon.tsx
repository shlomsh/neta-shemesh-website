export function QuoteIcon() {
  return (
    <div className="absolute top-8 start-8 opacity-100 z-10">
      <img // eslint-disable-line @next/next/no-img-element -- decorative SVG quote mark; next/image does not optimise SVG
        src="/images/quote-mark-card.svg"
        alt="ציטוט"
        className="w-12 h-12"
      />
    </div>
  );
}
