export interface Credential {
  text: string;
}

export interface CredentialsListProps {
  items: Credential[];
  checkIconSrc: string | string[];
}

export function CredentialsList({ items, checkIconSrc }: CredentialsListProps) {
  const icons = Array.isArray(checkIconSrc) ? checkIconSrc : [checkIconSrc];
  return (
    <ul className="grid grid-cols-2 md:grid-cols-3 gap-[32px] md:gap-[64px]" dir="rtl">
      {items.map((item, i) => (
        <li key={i} className="flex flex-col items-center text-center">
          <img
            src={icons[i % icons.length]}
            alt=""
            aria-hidden="true"
            className="w-[96px] h-auto shrink-0 mb-[16px]"
            loading="lazy"
          />
          <span
            className="type-quote text-[var(--color-text-primary)] leading-[1.08] tracking-[0.012em] text-center"
          >
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
