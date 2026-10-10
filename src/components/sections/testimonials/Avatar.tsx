interface AvatarProps {
  src: string;
  alt: string;
}

export function Avatar({ src, alt }: AvatarProps) {
  return (
    <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 me-4">
      <img // eslint-disable-line @next/next/no-img-element -- 64px static avatar in the parked testimonials block
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
