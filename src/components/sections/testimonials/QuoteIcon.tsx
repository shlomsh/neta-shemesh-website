export function QuoteIcon() {
  return (
    <div className="absolute top-[32px] right-[32px] opacity-100 z-10">
      <img // eslint-disable-line @next/next/no-img-element -- decorative SVG quote mark; next/image does not optimise SVG
        src="/images/quote-mark-card.svg"
        alt="ציטוט"
        className="w-[48px] h-[48px]"
      />
    </div>
  );
}
