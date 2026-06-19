interface StepNumberProps {
  text: string;
}

export function StepNumber({ text }: StepNumberProps) {
  return (
    <span
      dir="ltr"
      className="self-end font-sans text-[clamp(56px,9vw,84px)] font-black leading-none tracking-tight text-white drop-shadow-md"
    >
      {text}
    </span>
  );
}
