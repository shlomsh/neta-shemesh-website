interface StepTitleProps {
  text: string;
}

export function StepTitle({ text }: StepTitleProps) {
  return (
    <h3 className="mt-2 mb-3 font-[family-name:var(--font-stanga)] font-bold text-[clamp(18px,2.4vw,24px)] leading-tight text-white drop-shadow normal-case">
      {text}
    </h3>
  );
}
