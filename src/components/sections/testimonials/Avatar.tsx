export interface AvatarProps {
  src: string;
  alt: string;
}

export function Avatar({ src, alt }: AvatarProps) {
  return (
    <div className="w-[64px] h-[64px] rounded-full overflow-hidden shrink-0 ml-[16px]">
      <img // eslint-disable-line @next/next/no-img-element -- 64px static avatar in the parked testimonials block
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
