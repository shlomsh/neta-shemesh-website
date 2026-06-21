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
            src="/images/contact-icon-location.svg"
            alt="location glyph icon"
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </span>
        <div className="text-right">
          <p
            data-body-large="true"
            className="font-bold leading-[1.45] tracking-[0.012em] font-[family-name:var(--font-stanga)] text-inherit"
          >
            {addressStrong}
          </p>
          <p
            data-body-large="true"
            className="leading-[1.45] tracking-[0.012em] font-[family-name:var(--font-stanga)] text-inherit"
          >
            {addressLabel}
          </p>
        </div>
      </li>

      {/* Phone */}
      <li className="flex items-center gap-[16px] flex-row-reverse">
        <span className="flex-shrink-0 w-[24px] h-[24px]">
          <img
            src="/images/contact-icon-phone.svg"
            alt="Phone Call Glyph Icon"
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </span>
        <div className="text-right">
          <a
            href={`tel:${phone.replace(/[\s-]/g, '')}`}
            data-body-large="true"
            className="font-bold uppercase hover:opacity-80 transition-opacity font-[family-name:var(--font-stanga)] text-inherit"
          >
            {phone}
          </a>
          <p
            data-body-large="true"
            className="leading-[1.27] tracking-[0.05em] font-[family-name:var(--font-stanga)] text-inherit"
          >
            {phoneLabel}
          </p>
        </div>
      </li>

      {/* Email */}
      <li className="flex items-center gap-[16px] flex-row-reverse">
        <span className="flex-shrink-0 w-[24px] h-[24px]">
          <img
            src="/images/contact-icon-email.svg"
            alt="email icon"
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </span>
        <div className="text-right">
          <a
            href={`mailto:${email}`}
            data-body-large="true"
            className="font-bold uppercase hover:opacity-80 transition-opacity font-[family-name:var(--font-stanga)] text-inherit"
          >
            {email}
          </a>
          <p
            data-body-large="true"
            className="leading-[1.27] tracking-[0.05em] font-[family-name:var(--font-stanga)] text-inherit"
          >
            {emailLabel}
          </p>
        </div>
      </li>
    </ul>
  );
}
