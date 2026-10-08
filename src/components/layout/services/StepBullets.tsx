interface StepBulletsProps {
  items: string[];
}

export function StepBullets({ items }: StepBulletsProps) {
  return (
    <ul className="flex flex-col gap-[6px]">
      {items.map((item, i) => (
        <li
          key={i}
          className="type-small text-white/90"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
