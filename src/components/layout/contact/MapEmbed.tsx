import { mapEmbedSrc } from '@/content/site';

interface MapEmbedProps {
  /** Classes that size the outer wrapper (height / min-height); it has no intrinsic height. */
  className: string;
}

export function MapEmbed({ className }: MapEmbedProps) {
  return (
    <div className={`relative w-full rounded-tile overflow-hidden ${className}`}>
      <iframe
        src={mapEmbedSrc()}
        title="מיקום הקליניקה"
        className="absolute inset-0 w-full h-full border-0"
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        loading="lazy"
      />
    </div>
  );
}
