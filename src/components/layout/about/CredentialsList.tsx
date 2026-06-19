export interface Credential {
  text: string;
}

export interface CredentialsListProps {
  items: Credential[];
  checkIconSrc: string;
}

export function CredentialsList({ items, checkIconSrc }: CredentialsListProps) {
  return (
    <ul className="flex flex-col gap-[16px]" dir="rtl">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-[12px]">
          <img
            src={checkIconSrc}
            alt=""
            aria-hidden="true"
            className="w-[28px] h-[28px] shrink-0"
            loading="lazy"
          />
          <span
            className="text-[var(--color-text-primary)] leading-[1.08] tracking-[0.012em] text-center font-[family-name:var(--font-stanga)]"
          >
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
