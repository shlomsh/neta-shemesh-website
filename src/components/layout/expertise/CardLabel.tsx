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
        rounded-full
        px-[24px] py-[8px]
        w-max max-w-[90%]
        text-center
        z-[5]
      "
    >
      <span
        className="
          block
          type-small
          text-[var(--color-white)]
          font-bold
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
