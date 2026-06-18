import React from 'react';

interface ProseProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
  text?: string;
}

export function Prose({ children, text, ...props }: ProseProps) {
  return (
    <p {...props}>
      {children || text}
    </p>
  );
}
