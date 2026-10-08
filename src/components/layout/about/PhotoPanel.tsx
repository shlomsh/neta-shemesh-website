export interface PhotoPanelProps {
  src: string;
  alt?: string;
  objectPosition?: string;
  className?: string;
}

export function PhotoPanel({
  src,
  alt = '',
  objectPosition = '50% 50%',
  className = '',
}: PhotoPanelProps) {
  return (
    <div className={`relative overflow-hidden rounded-card safari-clip ${className}`}>
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
