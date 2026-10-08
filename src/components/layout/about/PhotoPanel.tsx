import Image from 'next/image';

export interface PhotoPanelProps {
  src: string;
  alt?: string;
  objectPosition?: string;
  /** aspect ratio expressed as height/width * 100 — drives the padding-top intrinsic approach */
  aspectPct?: number;
  className?: string;
}

export function PhotoPanel({
  src,
  alt = '',
  objectPosition = '50% 50%',
  aspectPct,
  className = '',
}: PhotoPanelProps) {
  return (
    <div className={`relative overflow-hidden rounded-card safari-clip ${className}`}>
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
