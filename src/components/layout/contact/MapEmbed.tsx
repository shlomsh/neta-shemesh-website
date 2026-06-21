interface MapEmbedProps {
  /** Extra classes for the outer wrapper. When provided, aspect-[4/3] is NOT applied
   *  so the caller can control height (e.g. h-full or min-h-[400px]). */
  className?: string;
}

export function MapEmbed({ className }: MapEmbedProps) {
  const wrapperClass = className
    ? `w-full rounded-[8px] overflow-hidden ${className}`
    : 'w-full aspect-[4/3] rounded-[8px] overflow-hidden';
  return (
    <div className={wrapperClass}>
      <iframe
        src="https://maps.google.com/maps?q=Amnon+ve-Tamar+6,+Netanya&t=&z=15&ie=UTF8&iwloc=&output=embed"
        title="מיקום הקליניקה"
        className="w-full h-full border-0"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        loading="lazy"
      />
    </div>
  );
}
