'use client';

interface ContactDetailsProps {
  phone: string;
  phoneLabel: string;
  email: string;
  emailLabel: string;
  addressStrong: string;
  addressLabel: string;
}

export function ContactDetails({
  phone,
  phoneLabel,
  email,
  emailLabel,
  addressStrong,
  addressLabel,
}: ContactDetailsProps) {
  return (
    <ul className="flex flex-col gap-[24px] mt-[24px] list-none">
      {/* Address */}
      <li className="flex items-center gap-[16px] flex-row-reverse">
        <span className="flex-shrink-0 w-[24px] h-[24px]">
          <img
            src="/images/cd9be1bf1825d90196a68c69aa65fa1b.svg"
            alt="location glyph icon"
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </span>
        <div className="text-right">
          <p
            className="font-bold leading-[1.45] tracking-[0.012em] font-[family-name:var(--font-stanga)] text-[color:var(--color-white)]"
          >
            {addressStrong}
          </p>
          <p
            className="leading-[1.45] tracking-[0.012em] font-[family-name:var(--font-stanga)] text-[color:var(--color-white)]"
          >
            {addressLabel}
          </p>
        </div>
      </li>

      {/* Phone */}
      <li className="flex items-center gap-[16px] flex-row-reverse">
        <span className="flex-shrink-0 w-[24px] h-[24px]">
          <img
            src="/images/0bfd9601e3558f04c5a26db04e792688.svg"
            alt="Phone Call Glyph Icon"
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </span>
        <div className="text-right">
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="font-bold uppercase hover:opacity-80 transition-opacity font-[family-name:var(--font-stanga)] text-[color:var(--color-white)]"
          >
            {phone}
          </a>
          <p
            className="leading-[1.27] tracking-[0.05em] font-[family-name:var(--font-stanga)] text-[color:var(--color-white)]"
          >
            {phoneLabel}
          </p>
        </div>
      </li>

      {/* Email */}
      <li className="flex items-center gap-[16px] flex-row-reverse">
        <span className="flex-shrink-0 w-[24px] h-[24px]">
          <img
            src="/images/957b9c4d000919fda0fad512d9b1e7f6.svg"
            alt="email icon"
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </span>
        <div className="text-right">
          <a
            href={`mailto:${email}`}
            className="font-bold uppercase hover:opacity-80 transition-opacity font-[family-name:var(--font-stanga)] text-[color:var(--color-white)]"
          >
            {email}
          </a>
          <p
            className="leading-[1.27] tracking-[0.05em] font-[family-name:var(--font-stanga)] text-[color:var(--color-white)]"
          >
            {emailLabel}
          </p>
        </div>
      </li>
    </ul>
  );
}
