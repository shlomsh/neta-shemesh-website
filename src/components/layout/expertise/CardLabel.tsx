interface CardLabelProps {
  title: string;
  description: string;
}

export function CardLabel({ title, description }: CardLabelProps) {
  return (
    <div
      className="
        absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2
        bg-[var(--color-brand-primary)] opacity-95
        rounded-[50px]
        px-[24px] py-[8px]
        w-max max-w-[90%]
        text-center
        z-[5]
      "
    >
      <span
        className="
          block
          font-[family-name:var(--font-body)]
          text-[var(--color-white)]
          font-bold
          text-[clamp(14px,1.6vw,18px)]
          leading-[1.3]
          tracking-[0.012em]
        "
      >
        {title}
      </span>
      <span className="sr-only">
        {description}
      </span>
    </div>
  );
}
