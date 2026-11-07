import { MaskIcon } from '@/components/primitives/ui/MaskIcon';
import { CONTACT_ICONS } from '@/content/home/contact';
import { SITE, addressLine, mailHref, mapSearchHref, telHref } from '@/content/site';

interface ContactRow {
  icon: string;
  href: string;
  text: string;
  latin?: boolean;
}

/** Address, phone, email: all values come from content/site.ts. */
const CONTACT_ROWS: ContactRow[] = [
  { icon: CONTACT_ICONS.address, href: mapSearchHref(), text: addressLine() },
  { icon: CONTACT_ICONS.phone, href: telHref(), text: SITE.phone.display, latin: true },
  { icon: CONTACT_ICONS.email, href: mailHref(), text: SITE.email, latin: true },
];

export function ContactDetails() {
  return (
    <ul className="flex flex-col gap-6 list-none">
      {CONTACT_ROWS.map(({ icon, href, text, latin }) => (
        <li key={icon} className="flex items-center gap-4">
          <MaskIcon src={icon} size="sm" />
          <div className="text-start">
            <a
              href={href}
              dir={latin ? 'ltr' : undefined}
              className="type-lead hover:opacity-80 transition-opacity text-inherit inline-block"
            >
              {latin ? <span className="font-latin">{text}</span> : text}
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
