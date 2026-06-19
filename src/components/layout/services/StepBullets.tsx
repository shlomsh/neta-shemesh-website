interface StepBulletsProps {
  items: string[];
}

export function StepBullets({ items }: StepBulletsProps) {
  return (
    <ul className="flex flex-col gap-[6px]">
      {items.map((item, i) => (
        <li
          key={i}
          className="text-[clamp(13px,1.4vw,16px)] leading-snug text-white/90"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
