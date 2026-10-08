/**
 * SANITY F: single source of truth (content/site.ts, content/ids.ts, content/home/*).
 *
 * History: the phone number lived in 3 formats across 4 files (the `tel:` hrefs even disagreed),
 * the street address in 3 places, 26 sections/headings were addressed by random 16-character Canva
 * export ids, and the JSON-LD service descriptions were hand-copied from the Expertise cards (and
 * drifted by one dash). These tests fail the moment a fact or an id is re-typed somewhere else.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { ANCHOR, ID } from '@/content/ids';
import { SITE, mailHref, telHref, waHref } from '@/content/site';
import { EXPERTISE_CARDS } from '@/content/home/expertise';
import { siteJsonLd } from '@/lib/seo/jsonld';
import { expectNone, readSources, renderHome } from './helpers';

describe('F1: content/ids.ts', () => {
  const entries = [...Object.entries(ID), ...Object.entries(ANCHOR)];
  const KEBAB = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
  /** a Canva-export style random id, optionally with a "-suffix" (the old `<id>-mobile`) */
  const RANDOM_ID = /^[A-Za-z0-9]{16}(?:-[\w-]+)?$/;

  it('every id is readable kebab-case and none looks like a random export id', () => {
    expectNone(entries.filter(([, v]) => !KEBAB.test(v) || RANDOM_ID.test(v)).map(([k, v]) => `${k}: ${v}`), 'ids that are not readable kebab-case');
    expect(entries.length, 'the id tables went empty').toBeGreaterThan(30);
  });

  it('ids are unique across sections, headings and anchors', () => {
    const seen = new Map<string, string[]>();
    for (const [k, v] of entries) seen.set(v, [...(seen.get(v) ?? []), k]);
    expectNone([...seen].filter(([, ks]) => ks.length > 1).map(([v, ks]) => `${v}: ${ks.join(', ')}`), 'ids shared by several keys');
  });
});

describe('F2: the rendered home page uses the shared ids', () => {
  let home: HTMLElement;
  beforeAll(async () => {
    home = await renderHome();
  });

  it('no element id is a random export id', () => {
    const ids = Array.from(home.querySelectorAll('[id]')).map((e) => e.id);
    expect(ids.length).toBeGreaterThan(15);
    expectNone(ids.filter((id) => /^[A-Za-z0-9]{16}(?:-[\w-]+)?$/.test(id)), 'random export ids on the page');
  });

  it('every id the home page declares in content/ids.ts is on the page (hidden testimonials excluded)', () => {
    const PARKED = new Set<string>([ID.testimonials, ID.testimonialsTitle, ID.testimonialsGrid, ID.testimonialCardArt]);
    const BLOG = new Set<string>([ID.blogIntro, ID.blogPosts, ID.postHero, ID.postBody, ID.postCta, ID.postMore]);
    const MENU = new Set<string>([ID.mobileMenu]); // portaled on open, not in the static markup
    const missing = Object.entries(ID)
      .filter(([, v]) => !PARKED.has(v) && !BLOG.has(v) && !MENU.has(v))
      .filter(([, v]) => !home.querySelector(`#${CSS.escape(v)}`))
      .map(([k, v]) => `${k}: #${v}`);
    expectNone(missing, 'ids declared in content/ids.ts but missing from the home page');
    const missingAnchors = Object.entries(ANCHOR).filter(([, v]) => !home.querySelector(`#${CSS.escape(v)}`)).map(([k, v]) => `${k}: #${v}`);
    expectNone(missingAnchors, 'scroll anchors declared in content/ids.ts but missing from the home page');
  });
});

describe('F3: site facts live only in content/site.ts', () => {
  /** [what, regex matching a hand-typed copy, the SITE value it must match]. */
  const FACTS: Array<[string, RegExp, string]> = [
    ['phone (display)', /054-?571-?1060/, SITE.phone.display],
    ['phone (E.164 / WhatsApp)', /972-?54-?571-?1060/, SITE.phone.e164.replace('+', '')],
    ['email', /nettabe@/, SITE.email],
    ['street', /אמנון ותמר/, SITE.address.street],
    ['postal code', /4220209/, SITE.address.postalCode],
    ['map query', /Amnon\+?ve-Tamar/i, SITE.address.mapQuery],
  ];

  let home: HTMLElement;
  beforeAll(async () => {
    home = await renderHome();
  });

  it('each scan regex matches the SITE value it guards (so the scan below is not blind)', () => {
    for (const [what, re, value] of FACTS) expect(re.test(value), `${what} regex no longer matches SITE`).toBe(true);
  });

  it('no component, route or lib file re-types a contact fact', () => {
    const offenders: string[] = [];
    for (const f of readSources().filter((s) => /\.tsx?$/.test(s.name) && s.name !== 'site.ts' && !s.path.startsWith('src/content/posts/'))) {
      for (const [what, re] of FACTS) if (re.test(f.text)) offenders.push(`${f.path}: ${what}`);
    }
    expectNone(offenders, 'contact facts typed outside content/site.ts');
  });

  it('every tel:, mailto: and wa.me link on the page is built from SITE', () => {
    const hrefs = (sel: string) => Array.from(home.querySelectorAll<HTMLAnchorElement>(sel)).map((a) => a.getAttribute('href'));
    const tels = hrefs('a[href^="tel:"]');
    expect(tels.length, 'tel links (hero pill, FAB, office row)').toBeGreaterThanOrEqual(3);
    expect(new Set(tels), 'every tel: link must be the same E.164 href').toEqual(new Set([telHref()]));
    expect(new Set(hrefs('a[href^="mailto:"]'))).toEqual(new Set([mailHref()]));
    expect(new Set(hrefs('a[href*="wa.me"]'))).toEqual(new Set([waHref()]));
  });
});

describe('F4: JSON-LD is derived from the content, not copied', () => {
  const graph = siteJsonLd()['@graph'] as Array<Record<string, unknown>>;

  it('the business node carries the SITE phone, email and address', () => {
    const biz = graph.find((n) => Array.isArray(n['@type']) && (n['@type'] as string[]).includes('LocalBusiness'))!;
    expect(biz.telephone).toBe(SITE.phone.e164);
    expect(biz.email).toBe(SITE.email);
    expect((biz.address as Record<string, string>).streetAddress).toBe(SITE.address.street);
    expect(biz.sameAs).toEqual(SITE.sameAs);
  });

  it('there is one Service node per Expertise card with the card title and description verbatim', () => {
    const services = graph.filter((n) => n['@type'] === 'Service');
    expect(services.map((s) => [s.name, s.description])).toEqual(EXPERTISE_CARDS.map((c) => [c.title, c.description]));
    expect(new Set(services.map((s) => s['@id'])).size, 'Service @ids must be unique').toBe(EXPERTISE_CARDS.length);
  });
});
