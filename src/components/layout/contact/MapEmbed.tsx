interface MapEmbedProps {
  /** Classes that size the outer wrapper (height / min-height); it has no intrinsic height. */
  className: string;
}

export function MapEmbed({ className }: MapEmbedProps) {
  return (
    <div className={`relative w-full rounded-tile overflow-hidden ${className}`}>
      <iframe
        src="https://maps.google.com/maps?q=Amnon+ve-Tamar+6,+Netanya&t=&z=15&ie=UTF8&iwloc=&output=embed"
        title="מיקום הקליניקה"
        className="absolute inset-0 w-full h-full border-0"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        loading="lazy"
      />
    </div>
  );
}
