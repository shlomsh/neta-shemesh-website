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
          <p className="type-lead">
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
            className="type-lead hover:opacity-80 transition-opacity text-inherit inline-block"
          >
            <span className="font-latin">{phone}</span>
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
            className="type-lead hover:opacity-80 transition-opacity text-inherit inline-block"
          >
            <span className="font-latin">{email}</span>
          </a>
        </div>
      </li>
    </ul>
  );
}
