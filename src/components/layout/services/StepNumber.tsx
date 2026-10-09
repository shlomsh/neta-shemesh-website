interface StepNumberProps {
  text: string;
}

export function StepNumber({ text }: StepNumberProps) {
  return (
    <span
      dir="ltr"
      className="type-display self-end text-cream drop-shadow-md"
    >
      {text}
    </span>
  );
}
