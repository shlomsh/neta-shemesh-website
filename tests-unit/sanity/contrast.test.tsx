/**
 * SANITY NS-42: rendered-DOM contrast matrix (WCAG 2.x) over the home page, /blog and every post.
 *
 * Every visible text node is measured: effective text colour (class -> @theme palette, `/NN` alpha,
 * color-mix, `--header-color`, ancestor `opacity-*`) against the effective backdrop (nearest opaque
 * background, stacking translucent layers), at the type class's MOBILE MINIMUM size: >= 24px regular
 * or >= 18.67px bold needs 3:1, everything else 4.5:1. jsdom has no Tailwind CSS, so the resolver in
 * helpers.ts (`contrastReport`) reads class lists; its limits are listed in README.md. Anything it cannot
 * evaluate is reported as skipped and fails the matrix, never silently passed.
 *
 * The only failures allowed are the owner's documented decisions below. A row whose text disappears
 * (stale) or whose ratio drifts fails too, so a redesign cannot silently change what the owner agreed to.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import {
  colourEnv,
  contrastReport,
  contrastRatio,
  evalColour,
  expectNone,
  hexToRgb,
  ratchetContrast,
  renderContrastPages,
  requiredRatio,
  themeColours,
  type ContrastAllow,
  type ContrastReport,
} from './helpers';

/** Permanent owner decisions (2026-10-09). NOT debt: documented choices. Do NOT "fix" these (CLAUDE.md). */
export interface OwnerException extends ContrastAllow {
  /** the day the owner decided */
  decided: string;
  /** ticket / ruling the row implements */
  decision: string;
}

const NS43_C = 'NS-43 option C: the cream titles on the mauve sections stay as designed (2.26:1; a real render measures 2.11-2.22 because the soft-light paper grain darkens the mauve)';

export const OWNER_EXCEPTIONS: OwnerException[] = [
  { page: 'home', where: '#about-intro', text: 'ליווי מקצועי', ratio: 2.26, decided: '2026-10-09', decision: 'NS-43 C', reason: `Intro title. ${NS43_C}` },
  { page: 'home', where: '#about-gallery', text: 'להצית מחדש', ratio: 2.26, decided: '2026-10-09', decision: 'NS-43 C', reason: `Reignite title. ${NS43_C}` },
  { page: 'home', where: '#about-gallery', text: 'תמיכה והכוונה', ratio: 2.26, decided: '2026-10-09', decision: 'NS-43 C', reason: `Reignite subtitle (type-quote 24px). ${NS43_C}` },
  { page: 'home', where: '#contact-office', text: 'המשרד שלי', ratio: 2.26, decided: '2026-10-09', decision: 'NS-43 C', reason: `ContactOffice title. ${NS43_C}` },
  { page: '*', where: '[data-testid=fab-whatsapp]', text: 'וואטסאפ', ratio: 1.98, decided: '2026-10-09', decision: 'WhatsApp green stays', reason: 'WhatsApp brand green (bg-whatsapp = --color-whatsapp #25D366) with a white #FFFFFF label on the contact FAB: the owner keeps the brand colour (design decisions Oct 2026); 1.98:1' },
];

/**
 * Text that sits over a photo: the backdrop is an image the DOM cannot describe, so the matrix skips
 * it. Keyed by section; a NEW photo-backed text anywhere else fails, and an entry with nothing to skip fails as stale.
 */
const PHOTO_BACKDROP: Array<{ where: string; reason: string }> = [
  { where: '#services', reason: 'StepCard: cream text over a photo with a from-black/85 gradient scrim' },
  { where: '#cta-band', reason: 'CTA band: cream title + subtitle over cta-background.webp with bg-black/20' },
  { where: 'footer', reason: 'Footer: cream text over the footer photo with a dark overlay' },
];

// ─── 1. The ratio maths matches CLAUDE.md ────────────────────────────────────

describe('colour maths: the palette pairs match the CLAUDE.md contrast table to two decimals', () => {
  const pal = themeColours();

  it.each([
    ['plum/cream', 'plum', 'cream', 5.55],
    ['cream/plum', 'cream', 'plum', 5.55],
    ['blush/plum', 'blush', 'plum', 3.89],
    ['mauve/cream', 'mauve', 'cream', 2.26],
    ['mauve/plum', 'mauve', 'plum', 2.46],
    ['blush/cream', 'blush', 'cream', 1.43],
  ])('%s', (_name, a, b, want) => {
    expect(Math.round(contrastRatio(pal[a], pal[b]) * 100) / 100).toBe(want);
  });

  it('--surface-veil is ~#F6E7E8, 4.97:1 against plum (quoted in CLAUDE.md)', () => {
    const veil = evalColour('var(--surface-veil)', colourEnv())!;
    expect(veil.a).toBe(1);
    expect({ r: Math.round(veil.r), g: Math.round(veil.g), b: Math.round(veil.b) }).toEqual(hexToRgb('#F6E7E8'));
    expect(Math.abs(contrastRatio(pal.plum, veil) - 4.97)).toBeLessThan(0.02);
  });

  it('size classes: >= 24px regular and >= 18.67px bold are "large" (3:1); everything else needs 4.5:1', () => {
    const t = (size: number, bold: boolean) => requiredRatio({ size, bold, typeClass: null });
    expect([t(24, false), t(23.9, false), t(18.67, true), t(18, true), t(22, true), t(16, true)]).toEqual([3, 4.5, 3, 4.5, 3, 4.5]);
  });
});

// ─── 2. The resolver is not blind: fixtures with a known answer ──────────────

describe('resolver controls (small DOM fixtures with a known ratio)', () => {
  const run = (html: string): ContrastReport => {
    const holder = document.createElement('div');
    holder.innerHTML = html;
    return contrastReport(holder, 'fixture');
  };
  const one = (html: string) => {
    const r = run(html);
    expect(r.all.length, `fixture must measure exactly one text: ${html}`).toBe(1);
    return r.all[0];
  };

  it('the tone sets the colours: plum on cream 5.55 passes; mid tone is cream on mauve 2.26 and fails even as large text', () => {
    expect(one('<div data-bg-tone="cream"><p class="type-body">hello</p></div>').ratio).toBe(5.55);
    expect(run('<div data-bg-tone="cream"><p class="type-body">hello</p></div>').findings).toEqual([]);
    const title = run('<div data-bg-tone="mid"><h2 class="type-title font-bold text-[color:var(--header-color)]">שלום</h2></div>');
    expect(title.findings.map((f) => [f.ratio, f.required])).toEqual([[2.26, 3]]);
  });

  it('a text-* class beats the tone colour (text-inherit gives it back); a nested Card is judged on its own surface; on-dark flips --header-color', () => {
    expect(one('<div data-bg-tone="dark"><p class="type-body text-plum">x</p></div>').ratio).toBe(1);
    expect(one('<div data-bg-tone="dark"><p class="type-body text-plum"><span class="text-inherit">y</span></p></div>').ratio).toBe(1);
    expect(one('<section data-bg-tone="dark"><div data-bg-tone="cream"><p class="type-body">x</p></div></section>').ratio).toBe(5.55);
    expect(one('<div data-bg-tone="dark"><h2 class="on-dark type-title text-[color:var(--header-color)]">x</h2></div>').fg).toBe('#fff5f0');
  });

  it('size decides the threshold: blush on plum (3.89) passes at type-quote / type-card-title, fails at type-small, type-eyebrow and bold type-lead; .font-latin shrinks by x0.88', () => {
    const wrap = (cls: string) => `<div data-bg-tone="dark"><p class="${cls} text-blush">x</p></div>`;
    expect(run(wrap('type-quote')).findings).toEqual([]);
    expect(run(wrap('type-card-title')).findings).toEqual([]);
    for (const cls of ['type-small', 'type-eyebrow', 'type-lead font-bold']) expect(run(wrap(cls)).findings.length, cls).toBe(1);
    const latin = run('<div data-bg-tone="dark"><p class="type-quote text-blush"><span class="font-latin">abc</span></p></div>');
    expect(latin.findings.map((f) => [f.ratio, f.required])).toEqual([[3.89, 4.5]]);
  });

  it('alpha and opacity are composited: text-plum/50 on cream, an opacity-60 ancestor, a bg-cream/35 layer stacked on mauve', () => {
    const half = one('<div data-bg-tone="cream"><p class="type-body text-plum/50">x</p></div>');
    expect([half.fg, half.ratio < 2.5]).toEqual(['#bda7b4', true]);
    const plain = one('<div data-bg-tone="cream"><p class="type-body">x</p></div>').ratio;
    expect(one('<div data-bg-tone="cream"><div class="opacity-60"><p class="type-body">x</p></div></div>').ratio).toBeLessThan(plain);
    expect(one('<div data-bg-tone="mid"><div class="bg-cream/35"><p class="type-body text-plum">x</p></div></div>').bg).toBe('#d9bacc');
  });

  it('group opacity on the backdrop fades both colours against what is behind it; a group over a photo is left alone (the Expertise pill stays 2.26)', () => {
    const faded = one('<div data-bg-tone="cream"><div class="bg-plum opacity-50"><p class="type-body text-cream">x</p></div></div>');
    expect([faded.bg, faded.ratio < 5.55]).toEqual(['#bda7b4', true]);
    const pill = '<main><section id="s"><div class="relative bg-plum"><img alt="" src="/a.webp" style="position:absolute;height:100%;width:100%"/><div class="bg-mauve opacity-95"><span class="type-small font-bold text-cream">x</span></div></div></section></main>';
    expect(one(pill).ratio).toBe(2.26);
  });

  it('a full-cover sibling bg is the backdrop (the hero plum field); a full-cover image or a bare top-level section makes the text a "photo" skip, not a guess', () => {
    expect(one('<main><section id="h"><div class="absolute inset-0 bg-plum"></div><p class="type-body text-cream">x</p></section></main>').ratio).toBe(5.55);
    const photo = run('<main><section id="p"><div class="absolute inset-0"><img alt="" src="/a.webp"/></div><p class="type-body text-cream">x</p></section></main>');
    expect([photo.measured, photo.skipped.map((s) => s.reason)]).toEqual([0, [expect.stringContaining('photo backdrop')]]);
    expect(run('<main><section id="p"><p class="type-body text-cream">x</p></section></main>').skipped.length).toBe(1);
  });

  it('base state only: hover:/md: colour variants are ignored; sr-only, display:none and punctuation-only text are not measured; hidden-below-md text still is', () => {
    expect(one('<div data-bg-tone="cream"><p class="type-body hover:text-cream md:text-cream">x</p></div>').ratio).toBe(5.55);
    expect(run('<div data-bg-tone="cream"><p class="sr-only text-cream">x</p><p class="hidden text-cream">y</p><p>·</p></div>').measured).toBe(0);
    expect(run('<div data-bg-tone="dark"><nav class="hidden md:flex"><a class="text-plum">z</a></nav></div>').findings.length).toBe(1);
  });

  it('a passing copy of a text never hides a failing copy of the same text', () => {
    const r = run('<div data-bg-tone="cream"><p class="type-body">שלום</p><p class="type-body text-cream">שלום</p></div>');
    expect([r.measured, r.all.map((f) => f.ratio).sort(), r.findings.map((f) => f.ratio)]).toEqual([2, [1, 5.55], [1]]);
  });

  describe('a colour syntax the resolver does not understand is skipped (and the matrix fails on a skip), never ignored', () => {
    it.each([
      ['text-plum/[0.3]', 'text'],
      ['text-[oklch(0.5_0.1_200)]', 'text'],
      ['text-(--nope)', 'text'],
      ['bg-[rgb(1,2,3)]', 'bg'],
      ['bg-cream/[0.5]', 'bg'],
    ])('%s', (cls, kind) => {
      const html = kind === 'text' ? `<div data-bg-tone="cream"><p class="type-body ${cls}">x</p></div>` : `<div data-bg-tone="cream"><div class="${cls}"><p class="type-body">x</p></div></div>`;
      const r = run(html);
      expect(r.measured, cls).toBe(0);
      expect(r.skipped.map((s) => s.reason)[0], cls).toMatch(/unresolved (text colour|background)/);
    });

    it('non-colour utilities (sizes, urls, gradients) are not mistaken for colours; the Tailwind v4 shorthand text-(--color-plum) / bg-(--surface-veil) resolves', () => {
      for (const cls of ['text-[14px]', 'text-[length:var(--x)]', 'text-[clamp(1rem,2vw,2rem)]', 'bg-[url(/a.png)]', 'bg-[linear-gradient(red,blue)]', 'bg-cover']) {
        const r = run(`<div data-bg-tone="cream"><div class="${cls}"><p class="type-body ${cls}">x</p></div></div>`);
        expect([r.skipped, r.all[0].ratio], cls).toEqual([[], 5.55]);
      }
      const f = one('<div data-bg-tone="mid"><div class="bg-(--surface-veil)"><p class="type-body text-(--color-plum)">x</p></div></div>');
      expect([f.fg, f.bg]).toEqual(['#7a5978', '#f6e7e8']);
    });
  });
});

describe('ratchetContrast (pure)', () => {
  const f = { page: 'home', where: '#x', text: 'שלום עולם', ratio: 2.26, required: 3, fg: '#fff5f0', bg: '#c49ab8', size: 30, bold: true, typeClass: 'type-title' };
  const a: ContrastAllow = { page: 'home', where: '#x', text: 'שלום', ratio: 2.26, reason: 'r' };

  it('an allow-listed failure passes; an unlisted one is new; an entry that no longer fails is stale; a moved ratio is drift', () => {
    expect(ratchetContrast([f], [a])).toEqual({ fresh: [], stale: [], drifted: [] });
    expect(ratchetContrast([f, { ...f, where: '#y' }], [a]).fresh).toHaveLength(1);
    expect(ratchetContrast([], [a]).stale[0]).toMatch(/^stale allow entry, remove it/);
    expect(ratchetContrast([{ ...f, ratio: 2.9 }], [a]).drifted).toHaveLength(1);
    expect(ratchetContrast([{ ...f, ratio: 2.27 }], [a]).drifted).toEqual([]);
    expect(ratchetContrast([{ ...f, page: 'blog/one' }], [{ ...a, page: '*' }]).fresh).toEqual([]);
  });
});

// ─── 3. The matrix over the real pages ───────────────────────────────────────

describe('contrast matrix: home, /blog, every post', () => {
  let pages: Array<{ page: string; root: HTMLElement }>;
  let reports: ContrastReport[];
  beforeAll(async () => {
    pages = await renderContrastPages();
    reports = pages.map(({ page, root }) => contrastReport(root, page));
  });

  it('covers the home page, the blog index and at least two posts, and measures a real amount of text on each (the matrix is not blind)', () => {
    const names = pages.map((p) => p.page);
    expect(names).toEqual(expect.arrayContaining(['home', 'blog']));
    expect(names.filter((n) => n.startsWith('blog/')).length).toBeGreaterThanOrEqual(2);
    const byPage = Object.fromEntries(reports.map((r, i) => [pages[i].page, r.measured]));
    expect(byPage.home, 'home text nodes measured').toBeGreaterThan(50);
    expect(byPage.blog, 'blog index text nodes measured').toBeGreaterThan(15);
    for (const n of names.filter((x) => x.startsWith('blog/'))) expect(byPage[n], `${n} text nodes measured`).toBeGreaterThan(30);
  });

  it('nothing is skipped except text over photos (no unresolved colour syntax, no unknown backdrop)', () => {
    const odd = reports.flatMap((r) => r.skipped).filter((s) => !s.reason.startsWith('photo backdrop'));
    expectNone(odd.map((s) => `[${s.page}] ${s.where} "${s.text}": ${s.reason}`), 'text the resolver could not measure (teach helpers.ts the new class / colour syntax)');
  });

  it('photo-backed text sits only in the sections listed in PHOTO_BACKDROP, and each entry still has such text', () => {
    const where = new Set(reports.flatMap((r) => r.skipped).map((s) => s.where));
    const known = new Set(PHOTO_BACKDROP.map((p) => p.where));
    expectNone([...where].filter((w) => !known.has(w)).map((w) => `${w}: text over a photo that the matrix cannot measure; give it a tone/backdrop or add it to PHOTO_BACKDROP with a reason`), 'new photo-backed text');
    expectNone([...known].filter((w) => !where.has(w)).map((w) => `stale allow entry, remove it: PHOTO_BACKDROP ${w}`), 'photo table');
  });

  it('every failure is an owner exception (a new low-contrast pair fails here); every exception still fails with its measured ratio', () => {
    const r = ratchetContrast(reports.flatMap((x) => x.findings), OWNER_EXCEPTIONS);
    expectNone(r.fresh, 'new contrast failure: fix the colour pair (mauve has no compliant text pair; blush only large text), or, only with the owner agreeing, add an OWNER_EXCEPTIONS row');
    expectNone(r.stale, 'the pair was fixed (or the text removed): delete its row');
    expectNone(r.drifted, 'ratio drift: update the row when a change only moves the pair');
  });

  it('OWNER_EXCEPTIONS rows are dated decisions with a reason', () => {
    for (const e of OWNER_EXCEPTIONS) {
      expect(e.decided, `${e.where} ${e.text}`).toBe('2026-10-09');
      expect(e.decision.length).toBeGreaterThan(3);
      expect(e.reason.length).toBeGreaterThan(30);
    }
  });
});
