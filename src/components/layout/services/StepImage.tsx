interface StepImageProps {
  src: string;
  alt: string;
}

export function StepImage({ src, alt }: StepImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
