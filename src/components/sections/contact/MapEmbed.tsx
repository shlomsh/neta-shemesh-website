import { mapEmbedSrc } from '@/content/site';
import { cx } from '@/lib/cx';
import { MapIllustration } from './MapIllustration';

interface MapEmbedProps {
  /** Classes that size the outer wrapper (height / min-height); it has no intrinsic height. */
  className: string;
}

/**
 * The office map: a plain lazy iframe (the browser's own `loading="lazy"` already defers it and
 * fetches it well ahead of the viewport) on top of a designed placeholder, an abstract map and
 * pin. Until the iframe paints it is transparent, so the illustration shows; once it paints it
 * covers it. Zero JS, same box as before, so nothing shifts.
 */
export function MapEmbed({ className }: MapEmbedProps) {
  return (
    <div data-map-embed className={cx('relative w-full rounded-tile overflow-hidden bg-plum', className)}>
      <MapIllustration />
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
