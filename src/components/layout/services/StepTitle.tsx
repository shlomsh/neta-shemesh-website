interface StepTitleProps {
  text: string;
}

export function StepTitle({ text }: StepTitleProps) {
  return (
    <h3 className="mt-2 mb-3 text-[clamp(18px,2.4vw,24px)] font-bold leading-tight text-white drop-shadow">
      {text}
    </h3>
  );
}
