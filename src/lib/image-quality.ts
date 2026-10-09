/**
 * Quality passed to every `next/image` photo (Photo `engine="next"`, the CTA band).
 *
 * Next 16.3+ scales the requested quality down for AVIF (`round(q * 50 / 80)`; 16.2.9 used `q - 20`),
 * so the default 75 became AVIF 47 instead of 55 and the photos came out softer. Next 16.4 also ships
 * sharp 0.35 (newer libaom), which is not byte- or quality-identical to 0.34 at the same setting.
 * Measured on 5 site photos against the source (PSNR, dB), 16.2.9 at q75 vs 16.4.0:
 *   q75 -0.86 avg (softer), q80 -0.30, q84 about 0.00 (parity), q88 +0.36 (sharper, bigger files).
 * 84 is the parity point. Must be listed in `images.qualities` (next.config.ts), or the optimizer
 * rejects the request.
 */
export const PHOTO_QUALITY = 84;

/** The contact-consultation photo: fine detail, still 1.4 dB softer than 16.2.9 at q84, and 92 is still short (34.97 dB), so it gets 96 (35.54 dB vs 35.43 for 16.2.9 at q75). */
export const PHOTO_QUALITY_DETAIL = 96;
