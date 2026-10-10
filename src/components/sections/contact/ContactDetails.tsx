import { MaskIcon } from '@/components/primitives/ui/MaskIcon';
import { CONTACT_ICONS } from '@/content/home/contact';
import { SITE, addressLine, mailHref, telHref } from '@/content/site';

interface ContactRow {
  icon: string;
  /** Plain text row when absent; otherwise an LTR `Latin` link (phone, email). */
  href?: string;
  text: string;
}

/** Address, phone, email: all values come from content/site.ts. */
const CONTACT_ROWS: ContactRow[] = [
  { icon: CONTACT_ICONS.address, text: addressLine() },
  { icon: CONTACT_ICONS.phone, href: telHref(), text: SITE.phone.display },
  { icon: CONTACT_ICONS.email, href: mailHref(), text: SITE.email },
];

export function ContactDetails() {
  return (
    <ul className="flex flex-col gap-[24px] list-none">
      {CONTACT_ROWS.map(({ icon, href, text }) => (
        <li key={icon} className="flex items-center gap-[16px]">
          <MaskIcon src={icon} size="sm" />
          <div className="text-start">
            {href ? (
              <a
                href={href}
                dir="ltr"
                className="type-lead hover:opacity-80 transition-opacity text-inherit inline-block"
              >
                <span className="font-latin">{text}</span>
              </a>
            ) : (
              <p className="type-lead">{text}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
