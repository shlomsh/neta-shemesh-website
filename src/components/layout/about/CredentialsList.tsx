export interface Credential {
  text: string;
}

export interface CredentialsListProps {
  items: Credential[];
  checkIconSrc: string;
}

export function CredentialsList({ items, checkIconSrc }: CredentialsListProps) {
  return (
    <ul className="grid grid-cols-2 md:grid-cols-3 gap-[32px] md:gap-[64px]" dir="rtl">
      {items.map((item, i) => (
        <li key={i} className="flex flex-col items-center text-center">
          <img
            src={checkIconSrc}
            alt=""
            aria-hidden="true"
            className="w-[48px] h-[48px] shrink-0 mb-[16px]"
            loading="lazy"
          />
          <span
            className="text-[var(--color-text-primary)] leading-[1.08] tracking-[0.012em] text-center font-[family-name:var(--font-canva-primary)]"
          >
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
