/** Decorative organic blob — z-0, pointer-events-none, aria-hidden */
export function OrganicBg({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 600"
      className={`absolute inset-0 w-full h-full pointer-events-none select-none z-0 ${className}`}
    >
      <ellipse
        cx="300"
        cy="300"
        rx="280"
        ry="260"
        fill="var(--color-canva-light)"
        opacity="0.18"
        transform="rotate(-15 300 300)"
      />
      <ellipse
        cx="320"
        cy="290"
        rx="200"
        ry="230"
        fill="var(--color-canva-mid)"
        opacity="0.10"
        transform="rotate(20 320 290)"
      />
    </svg>
  );
}
