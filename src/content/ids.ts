/**
 * DOM ids: the ONE place for every id the page exposes as a hook.
 *
 * Components render them, nav links / aria refs point at them, and the Playwright specs and
 * unit tests import them, so a rename is a one-file change plus the compiler telling you who
 * else cares. Convention: kebab-case, `<section>` for the section, `<section>-title` for its
 * heading. Never reuse a 16-character random string (the old Canva export ids are retired).
 *
 * Plain data, no imports.
 */

/** Section ids and heading ids. */
export const ID = {
  // Page-level skip link target (the <main> element, see site/PageShell)
  main: 'main',

  // Hero
  hero: 'hero',
  // (named *-heading, not *-title: a removed CSS class called like the latter is banned by the source scan)
  heroTitle: 'hero-heading',
  brandLogo: 'brand-logo',

  // Intro ("ליווי מקצועי לזוגות")
  aboutIntro: 'about-intro',
  aboutIntroTitle: 'about-intro-title',

  // Expertise: the section has no id of its own, the scroll anchor is ANCHOR.expertise
  expertiseTitle: 'expertise-title',

  // Bio ("קצת עלי")
  aboutMeSection: 'about-me-section',
  aboutMeTitle: 'about-me-title',

  // Credentials
  aboutCredentials: 'about-credentials',
  aboutCredentialsTitle: 'about-credentials-title',

  // Re-ignite gallery ("להצית מחדש")
  aboutGallery: 'about-gallery',
  aboutGalleryTitle: 'about-gallery-title',

  // Services ("איך זה עובד?")
  services: 'services',
  servicesTitle: 'services-title',

  // CTA band over the photo
  ctaBand: 'cta-band',
  ctaBandTitle: 'cta-band-title',

  // Six-photo gallery ("טיפול זוגי לקשר בריא ותומך"); `gallery` is taken by a scroll anchor
  photoGallery: 'photo-gallery',
  photoGalleryTitle: 'photo-gallery-title',

  // Contact, panel 1 (social). The title is rendered twice (mobile stack / desktop column).
  contactSocial: 'contact-social',
  contactSocialTitle: 'contact-social-title',
  contactSocialTitleMobile: 'contact-social-title-mobile',

  // Contact, panel 2 (office + map)
  contactOffice: 'contact-office',
  contactOfficeTitle: 'contact-office-title',

  // Parked testimonials block (SHOW_TESTIMONIALS = false)
  testimonials: 'testimonials',
  testimonialsTitle: 'testimonials-title',
  testimonialsGrid: 'testimonials-grid',
  testimonialCardArt: 'testimonial-card-art',

  // Chrome
  mobileMenu: 'mobile-menu',
  blogIntro: 'blog-intro',
  blogPosts: 'blog-posts',
  postHero: 'post-hero',
  postBody: 'post-body',
  postCta: 'post-cta',
  postMore: 'post-more',
} as const;

/**
 * Zero-height scroll anchors. Only `aboutMe`, `expertise` and `contact` are linked to (nav and
 * CTAs); the others are historical landing points kept so old shared URLs still scroll to the
 * same place. `anchorHref(ANCHOR.contact)` builds the `#contact` link.
 */
export const ANCHOR = {
  /** before the hero */
  pageTop: 'page-1',
  /** before the intro section */
  about: 'about',
  aboutMe: 'about-me',
  expertise: 'expertise',
  /** before the credentials section */
  credentials: 'page-4',
  /** before the re-ignite gallery */
  reignite: 'about-2',
  /** before the six-photo gallery */
  gallery: 'gallery',
  contact: 'contact',
} as const;

export type AnchorId = (typeof ANCHOR)[keyof typeof ANCHOR];

/** `#contact` (in-page) or `${base}#contact` (from another route, e.g. '/'). */
export const anchorHref = (id: AnchorId, basePath = '') => `${basePath}#${id}`;
