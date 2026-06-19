import Image from 'next/image';

export interface PhotoPanelProps {
  src: string;
  alt?: string;
  objectPosition?: string;
  /** aspect ratio expressed as height/width * 100 — drives the padding-top intrinsic approach */
  aspectPct?: number;
  /** border-radius as percentage string e.g. "9%" */
  radiusX?: string;
  radiusY?: string;
  className?: string;
}

export function PhotoPanel({
  src,
  alt = '',
  objectPosition = '50% 50%',
  aspectPct,
  radiusX = '0%',
  radiusY = '0%',
  className = '',
}: PhotoPanelProps) {
  const style: React.CSSProperties = aspectPct
    ? { borderRadius: `${radiusX} / ${radiusY}` }
    : { borderRadius: `${radiusX} / ${radiusY}` };

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {aspectPct && <div style={{ paddingTop: `${aspectPct}%` }} />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition }}
      />
    </div>
  );
}
