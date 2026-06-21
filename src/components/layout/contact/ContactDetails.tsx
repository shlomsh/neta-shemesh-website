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
    <ul className="flex flex-col gap-[24px] list-none">
      {/* Address */}
      <li className="flex items-start gap-[16px]">
        <span
          className="flex-shrink-0 w-[24px] h-[24px]"
          style={{
            backgroundColor: 'currentColor',
            WebkitMaskImage: 'url(/images/contact-icon-location.svg)',
            maskImage: 'url(/images/contact-icon-location.svg)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
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
      <li className="flex items-start gap-[16px]">
        <span
          className="flex-shrink-0 w-[24px] h-[24px]"
          style={{
            backgroundColor: 'currentColor',
            WebkitMaskImage: 'url(/images/contact-icon-phone.svg)',
            maskImage: 'url(/images/contact-icon-phone.svg)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
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
      <li className="flex items-start gap-[16px]">
        <span
          className="flex-shrink-0 w-[24px] h-[24px]"
          style={{
            backgroundColor: 'currentColor',
            WebkitMaskImage: 'url(/images/contact-icon-email.svg)',
            maskImage: 'url(/images/contact-icon-email.svg)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
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
