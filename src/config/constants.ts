export const AUTHOR_NAME = 'נטע שמש';
export const AUTHOR_TITLE = 'עו״ס קלינית ומטפלת זוגית ומשפחתית';
export const CLINIC_LOCATION = 'נתניה';
// Overridable at build time (POC: point OG/canonical URLs at the Azure host).
// Falls back to the production domain, so Vercel builds are unaffected.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.netashemesh.co.il';

