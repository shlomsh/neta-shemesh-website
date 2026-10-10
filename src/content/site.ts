/**
 * Site facts: the ONE place for name, contact details, address, hours and URLs.
 * Every consumer (components, metadata, JSON-LD, the FAB, the sitemap) imports from here, so
 * a phone number or street never has to be edited in more than one file.
 *
 * Plain data only (no JSX, no component imports): safe to import from server and client
 * components, route files and tests alike.
 */

export const PRODUCTION_URL = 'https://www.netashemesh.co.il';

/** The clinic's city: one literal feeds both `SITE.city` (prose) and `SITE.address.city`. */
const CITY = 'נתניה';

export const SITE = {
  name: 'נטע שמש',
  /** Short service line used in titles / OG ("נטע שמש | טיפול זוגי ומשפחתי"). */
  tagline: 'טיפול זוגי ומשפחתי',
  /** Professional title shown on the author card and in the Person JSON-LD. */
  jobTitle: 'עו״ס קלינית ומטפלת זוגית ומשפחתית',
  /** City of the clinic, in prose ("... בנתניה"). */
  city: CITY,
  // Overridable at build time (a preview deploy or tunnel can point OG/canonical URLs at its own
  // host; IS_PRODUCTION_HOST then turns the noindex guard on). Production leaves it unset and
  // falls back to the production domain.
  // Keep the literal `process.env.NEXT_PUBLIC_SITE_URL` so Next inlines it into client bundles.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? PRODUCTION_URL,
  phone: {
    /** As shown on screen. */
    display: '054-571-1060',
    /** E.164, used for every tel: link and for WhatsApp. */
    e164: '+972545711060',
  },
  email: 'nettabe@gmail.com',
  address: {
    street: 'רחוב אמנון ותמר 6',
    city: CITY,
    region: 'השרון',
    postalCode: '4220209',
    country: 'IL',
    geo: { latitude: 32.2568, longitude: 34.8585 },
    /** Pre-encoded `q=` value of the Google Maps embed. */
    mapQuery: 'Amnon+ve-Tamar+6,+Netanya',
  },
  /** schema.org openingHours. */
  openingHours: ['Su-Th 09:00-19:00'],
  priceRange: '₪₪₪',
  /** Prefilled first message of the WhatsApp contact pill. */
  whatsappMessage: 'שלום נטע, אשמח לשמוע קצת יותר פרטים',
  /**
   * Real social profile URLs for JSON-LD `sameAs`. Empty on purpose: the footer icons in
   * content/home/social.ts still point at the networks' home pages (owner to supply the real
   * profiles, tech-debt plan Y3), and those must not be advertised to search engines.
   */
  sameAs: [] as string[],
};

/** `tel:` link for the clinic phone (E.164: dials the same number from anywhere). */
export const telHref = () => `tel:${SITE.phone.e164}`;

/** `mailto:` link for the clinic email. */
export const mailHref = () => `mailto:${SITE.email}`;

/** WhatsApp deep link with the prefilled message (spaces become `+`, Hebrew stays unescaped). */
export const waHref = () =>
  `https://wa.me/${SITE.phone.e164.replace('+', '')}?text=${SITE.whatsappMessage.replace(/ /g, '+')}`;

/** "רחוב אמנון ותמר 6, נתניה" */
export const addressLine = () => `${SITE.address.street}, ${SITE.address.city}`;

/** Google Maps embed URL for the clinic. */
export const mapEmbedSrc = () =>
  `https://maps.google.com/maps?q=${SITE.address.mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

/** True when this build is the production site (staging copies must stay non-indexable). */
export const IS_PRODUCTION_HOST = SITE.url === PRODUCTION_URL;
