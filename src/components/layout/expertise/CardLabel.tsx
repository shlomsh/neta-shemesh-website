interface CardLabelProps {
  title: string;
  description: string;
}

export function CardLabel({ title, description }: CardLabelProps) {
  return (
    <div
      className="
        absolute bottom-[10%] left-[50%] -translate-x-1/2
        bg-[var(--color-brand-primary)] opacity-90
        rounded-[50px]
        px-[16px] py-[10px]
        min-w-[60%] max-w-[88%]
        text-center
        z-[5]
      "
    >
      <span
        className="
          block
          font-[var(--font-canva-primary)]
          text-[var(--color-white)]
          font-bold
          text-[clamp(14px,1.6vw,20px)]
          leading-[1.3]
          tracking-[0.012em]
        "
      >
        {title}
      </span>
      <span
        className="
          hidden
          sm:block
          font-[var(--font-canva-primary)]
          text-[var(--color-white)]
          font-normal
          text-[clamp(11px,0.9vw,14px)]
          leading-[1.5]
          tracking-[0]
          mt-[4px]
          opacity-85
        "
      >
        {description}
      </span>
    </div>
  );
}
