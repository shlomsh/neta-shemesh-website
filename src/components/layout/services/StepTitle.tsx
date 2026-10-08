interface StepTitleProps {
  text: string;
}

export function StepTitle({ text }: StepTitleProps) {
  return (
    <h3 className="type-card-title mt-2 mb-3 text-white drop-shadow">
      {text}
    </h3>
  );
}
