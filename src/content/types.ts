import type { AnchorId } from './ids';

/**
 * Types for the typed home-page content in `content/home/*`.
 * Content modules and components both import from here; this file imports only id types, so content
 * never depends on a component.
 */

/** One of the four service areas (Expertise cards; the JSON-LD Service nodes are derived from them). */
export interface ExpertiseCardData {
  /** Short stable key; becomes the JSON-LD id fragment `#service-<slug>`. */
  slug: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

/** One step of the "איך זה עובד?" process. */
export interface Step {
  imageSrc: string;
  numberText: string;
  title: string;
  bullets: string[];
}

/** One item of the credentials grid. */
export interface Credential {
  text: string;
}

/** A photo placed with an explicit `object-position` crop. */
export interface CroppedPhoto {
  src: string;
  objectPosition: string;
}

/**
 * A header nav link. Either an in-page anchor (the nav prefixes the base path: `#contact` on
 * the home page, `/#contact` from the blog) or a plain route (`/blog`).
 */
export type NavLink =
  | { label: string; anchor: AnchorId; route?: never }
  | { label: string; route: string; anchor?: never };

export interface SocialLink {
  href: string;
  label: string;
  iconSrc: string;
}

/** "start <strong>bold</strong> end": the copy pattern used by the contact panels. */
export interface RichLine {
  start: string;
  bold: string;
  end: string;
}

/** Placement of one contact photo in the mobile stack and in the desktop mosaic. */
export interface ContactPhoto {
  src: string;
  alt: string;
  /** CSS `object-position` crop; centred when absent. */
  objectPosition?: string;
  /** Mobile stack: aspect ratio of the frame. */
  mobile: { ratio: '4/5' | '2/3' };
  desktop: {
    /** grid-area name */
    area: string;
    /** extra style props on the frame, e.g. the tall portrait spanning both rows */
    extraStyle?: { gridRow: string };
    sizes: string;
  };
}

export interface TestimonialData {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatarSrc: string;
  variant: 'default' | 'highlighted';
}
