'use client';

interface ContactDetailsProps {
  phone: string;
  email: string;
  addressStrong: string;
}

export function ContactDetails({
  phone,
  email,
  addressStrong,
}: ContactDetailsProps) {
  const emailParts = email.split('@');
  const hasAt = emailParts.length > 1;

  return (
    <ul className="flex flex-col gap-[24px] list-none">
      {/* Address */}
      <li className="flex items-center gap-[16px]">
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
        </div>
      </li>

      {/* Phone */}
      <li className="flex items-center gap-[16px]">
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
            dir="ltr"
            data-body-large="true"
            className="font-bold uppercase hover:opacity-80 transition-opacity font-[family-name:var(--font-stanga)] text-inherit inline-block"
          >
            {phone}
          </a>
        </div>
      </li>

      {/* Email */}
      <li className="flex items-center gap-[16px]">
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
            dir="ltr"
            className="font-bold uppercase hover:opacity-80 transition-opacity font-[family-name:var(--font-stanga)] text-inherit inline-block contact-email-link"
          >
            {hasAt ? (
              <>
                {emailParts[0]}
                <span className="font-sans">@</span>
                {emailParts[1]}
              </>
            ) : (
              email
            )}
          </a>
        </div>
      </li>
    </ul>
  );
}
