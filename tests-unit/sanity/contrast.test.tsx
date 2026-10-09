/**
 * SANITY NS-42: rendered-DOM contrast matrix (WCAG 2.x) over the home page, /blog and every post.
 *
 * Every visible text node is measured: effective text colour (class -> @theme palette, `/NN` alpha,
 * color-mix, `--header-color`, ancestor `opacity-*`) against the effective backdrop (nearest opaque
 * background, stacking translucent layers), at the type class's MOBILE MINIMUM size: >= 24px regular
 * or >= 18.67px bold needs 3:1, everything else 4.5:1. jsdom has no Tailwind CSS, so the resolver in
 * helpers.ts (`contrastReport`) reads class lists; its limits are listed in README.md.
 *
 * The allow-table below is a RATCHET: today's known failures are listed with their ratio; a failure
 * that is not listed fails the test, and a listed entry that no longer fails ALSO fails ("stale allow
 * entry, remove it"), so a contrast fix has to delete its row in the same change.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import {
  allowMatches,
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
  type ContrastFinding,
  type ContrastReport,
} from './helpers';

// ─── The allow-table: today's known failures ─────────────────────────────────

/**
 * Permanent owner decisions (2026-10-09). NOT debt: they are documented choices, kept out of the
 * CONTRAST_ALLOW ratchet. They still fail when the text goes away (stale) or its ratio drifts, so a
 * redesign cannot silently change what the owner agreed to.
 */
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
  { page: '*', where: '[data-testid=fab-whatsapp]', text: 'וואטסאפ', ratio: 1.98, decided: '2026-10-09', decision: 'WhatsApp green stays', reason: 'WhatsApp brand green #25D366 with a white label on the contact FAB: the owner keeps the brand colour (design decisions Oct 2026); 1.98:1' },
];

/** Ratchet debt: known failures somebody is meant to fix. Empty since NS-33 landed (the PostCard / AuthorCard / pill / blog-meta rows are gone). Rows may only be deleted. */
export const CONTRAST_ALLOW: ContrastAllow[] = [];

/**
 * Text that sits over a photo: the backdrop is an image the DOM cannot describe, so the matrix skips
 * it. Keyed by section; a NEW photo-backed text anywhere else fails, and an entry with nothing to
 * skip fails as stale.
 */
const PHOTO_BACKDROP: Array<{ where: string; reason: string }> = [
  { where: '#services', reason: 'StepCard: cream text over a photo with a from-black/85 gradient scrim' },
  { where: '#cta-band', reason: 'CTA band: cream title + subtitle over cta-background.webp with bg-black/20' },
  { where: 'footer', reason: 'Footer: cream text over the footer photo with a dark overlay' },
];

// ─── 1. The ratio maths matches CLAUDE.md ────────────────────────────────────

describe('NS-42 colour maths: the six palette pairs match the CLAUDE.md contrast table to two decimals', () => {
  const pal = themeColours();
  const PAIRS: Array<[string, string, string, number]> = [
    ['dark/cream', 'plum', 'cream', 5.55],
    ['cream/dark', 'cream', 'plum', 5.55],
    ['light/dark', 'blush', 'plum', 3.89],
    ['mid/cream', 'mauve', 'cream', 2.26],
    ['mid/dark', 'mauve', 'plum', 2.46],
    ['light/cream', 'blush', 'cream', 1.43],
  ];

  it('@theme declares the four brand hexes this suite relies on', () => {
    expect(pal.plum).toEqual(hexToRgb('#7A5978'));
    expect(pal.mauve).toEqual(hexToRgb('#C49AB8'));
    expect(pal.blush).toEqual(hexToRgb('#ECC8CE'));
    expect(pal.cream).toEqual(hexToRgb('#FFF5F0'));
    expect(pal.white, '--color-white is the cream alias').toEqual(pal.cream);
  });

  it.each(PAIRS)('%s', (_name, a, b, want) => {
    expect(Math.round(contrastRatio(pal[a], pal[b]) * 100) / 100).toBe(want);
  });

  it('known-good plum on cream passes (5.55:1) and known-bad cream on mauve fails (2.26:1) the 4.5 / 3 thresholds', () => {
    const good = contrastRatio(pal.plum, pal.cream);
    const bad = contrastRatio(pal.cream, pal.mauve);
    expect(good).toBeGreaterThanOrEqual(4.5);
    expect(bad).toBeLessThan(3);
  });

  it('translucent colours: bg-mauve/75 over plum is ~#B28AA8 and 2.76:1 with cream; --surface-veil is ~4.97:1 against plum (both quoted in CLAUDE.md)', () => {
    const env = colourEnv();
    const m75 = evalColour('color-mix(in srgb, var(--color-mauve) 75%, transparent)', env)!;
    expect(m75.a).toBeCloseTo(0.75);
    // the same 8-bit colour CLAUDE.md quotes (#B28AA8): channels rounded like a browser's framebuffer
    const over = {
      r: Math.round(m75.r * 0.75 + pal.plum.r * 0.25),
      g: Math.round(m75.g * 0.75 + pal.plum.g * 0.25),
      b: Math.round(m75.b * 0.75 + pal.plum.b * 0.25),
    };
    expect(Math.round(over.r)).toBe(0xb2);
    expect(Math.round(over.g)).toBe(0x8a);
    expect(Math.round(over.b)).toBe(0xa8);
    expect(Math.round(contrastRatio(pal.cream, over) * 100) / 100).toBe(2.76);
    const veil = evalColour('var(--surface-veil)', env)!;
    expect(veil.a).toBe(1);
    // CLAUDE.md quotes ~#F6E7E8 -> 4.97:1 (the exact mix is 4.98, the 8-bit rounding 4.96): same colour, +-0.02
    const veil8 = { r: Math.round(veil.r), g: Math.round(veil.g), b: Math.round(veil.b) };
    expect(veil8).toEqual(hexToRgb('#F6E7E8'));
    expect(Math.abs(contrastRatio(pal.plum, veil) - 4.97)).toBeLessThan(0.02);
    expect(Math.abs(contrastRatio(pal.plum, veil8) - 4.97)).toBeLessThan(0.02);
  });

  it('size classes: >= 24px regular and >= 18.67px bold are "large" (3:1); everything else needs 4.5:1', () => {
    const t = (size: number, bold: boolean) => requiredRatio({ size, bold, typeClass: null });
    expect(t(24, false)).toBe(3);
    expect(t(23.9, false)).toBe(4.5);
    expect(t(18.67, true)).toBe(3);
    expect(t(18, true), 'type-lead (18px) bold is NOT large').toBe(4.5);
    expect(t(22, true)).toBe(3);
    expect(t(16, true)).toBe(4.5);
  });
});

// ─── 2. The resolver is not blind: fixtures with a known answer ──────────────

describe('NS-42 resolver controls (small DOM fixtures with a known ratio)', () => {
  const run = (html: string): ContrastReport => {
    const holder = document.createElement('div');
    holder.innerHTML = html;
    return contrastReport(holder, 'fixture');
  };
  const one = (html: string): ContrastFinding => {
    const r = run(html);
    expect(r.all.length, `fixture must measure exactly one text: ${html}`).toBe(1);
    return r.all[0];
  };

  it('plum on a cream tone: 5.55:1, passes', () => {
    const f = one('<div data-bg-tone="cream"><p class="type-body">hello</p></div>');
    expect(f.ratio).toBe(5.55);
    expect(run('<div data-bg-tone="cream"><p class="type-body">hello</p></div>').findings).toEqual([]);
  });

  it('cream on a mid tone: 2.26:1, fails even as large text (type-title bold, 30px, needs 3:1)', () => {
    const html = '<div data-bg-tone="mid"><h2 class="type-title font-bold text-[color:var(--header-color)]">שלום</h2></div>';
    const r = run(html);
    expect(r.findings.map((f) => [f.ratio, f.required])).toEqual([[2.26, 3]]);
  });

  it('the tone sets the default text colour: mid tone with no text-* class is cream on mauve', () => {
    expect(one('<div data-bg-tone="mid"><p class="type-body">x</p></div>').ratio).toBe(2.26);
  });

  it('a text-* class beats the tone colour; text-inherit gives it back', () => {
    expect(one('<div data-bg-tone="dark"><p class="type-body text-plum">x</p></div>').ratio).toBe(1);
    expect(one('<div data-bg-tone="dark"><p class="type-body text-plum"><span class="text-inherit">y</span></p></div>').ratio).toBe(1);
  });

  it('a nested Card (data-bg-tone="cream") inside a dark section is judged on its own surface', () => {
    expect(one('<section data-bg-tone="dark"><div data-bg-tone="cream"><p class="type-body">x</p></div></section>').ratio).toBe(5.55);
  });

  it('text-blush on plum is 3.89:1: fine at type-quote (large), a failure at type-small / type-eyebrow', () => {
    const wrap = (cls: string) => `<div data-bg-tone="dark"><p class="${cls} text-blush">x</p></div>`;
    expect(run(wrap('type-quote')).findings).toEqual([]);
    expect(run(wrap('type-small')).findings.map((f) => f.ratio)).toEqual([3.89]);
    expect(run(wrap('type-eyebrow')).findings.map((f) => f.ratio)).toEqual([3.89]);
    // 18px bold (type-lead font-bold) is not large; type-card-title (22px bold) is
    expect(run(wrap('type-lead font-bold')).findings.length).toBe(1);
    expect(run(wrap('type-card-title')).findings).toEqual([]);
  });

  it('.font-latin shrinks the effective size (x0.88): a 24px quote with a latin span is no longer "large"', () => {
    const html = '<div data-bg-tone="dark"><p class="type-quote text-blush"><span class="font-latin">abc</span></p></div>';
    expect(run(html).findings.map((f) => [f.ratio, f.required])).toEqual([[3.89, 4.5]]);
  });

  it('/NN alpha is composited over the backdrop: text-plum/50 on cream', () => {
    const f = one('<div data-bg-tone="cream"><p class="type-body text-plum/50">x</p></div>');
    expect(f.ratio).toBeGreaterThan(1.5);
    expect(f.ratio).toBeLessThan(2.5);
    expect(f.fg).toBe('#bda7b4'); // plum 50% over cream
  });

  it('color-mix(... transparent) text resolves to the mixed alpha: plum 70% on cream is ~3.0:1 and fails at body size', () => {
    const html = '<div data-bg-tone="cream"><p class="type-body text-[color:color-mix(in_srgb,var(--color-plum)_70%,transparent)]">x</p></div>';
    const f = one(html);
    expect(f.ratio).toBeCloseTo(3.0, 1);
    expect(run(html).findings.length).toBe(1);
  });

  it('opacity on an ancestor fades the text: opacity-60 plum on cream drops below 4.5', () => {
    const plain = one('<div data-bg-tone="cream"><p class="type-body">x</p></div>').ratio;
    const faded = one('<div data-bg-tone="cream"><div class="opacity-60"><p class="type-body">x</p></div></div>').ratio;
    expect(faded).toBeLessThan(plain);
    expect(run('<div data-bg-tone="cream"><div class="opacity-[0.6]"><p class="type-body">x</p></div></div>').findings.length).toBe(1);
  });

  it('a translucent bg stacks on the next opaque one: bg-cream/35 on mauve under cream text', () => {
    const f = one('<div data-bg-tone="mid"><div class="bg-cream/35"><p class="type-body text-plum">x</p></div></div>');
    expect(f.bg).toBe('#d9bacc'); // cream 35% over mauve
  });

  it('--surface-veil is read from globals.css: plum text on a veil card inside a mauve section is 4.97:1 and passes', () => {
    const f = one('<section data-bg-tone="mid"><div class="bg-[var(--surface-veil)]"><p class="type-body text-plum">x</p></div></section>');
    expect(f.ratio).toBeGreaterThanOrEqual(4.96);
    expect(f.ratio).toBeLessThanOrEqual(4.99);
    expect(f.bg).toBe('#f6e7e8');
  });

  it('on-dark flips --header-color to cream on the element itself', () => {
    const f = one('<div data-bg-tone="dark"><h2 class="on-dark type-title text-[color:var(--header-color)]">x</h2></div>');
    expect(f.fg).toBe('#fff5f0');
  });

  it('a full-cover sibling background is the backdrop (the hero plum field), a full-cover image makes the text "photo" (skipped, not guessed)', () => {
    const hero = '<main><section id="h"><div class="absolute inset-0 bg-plum"></div><p class="type-body text-cream">x</p></section></main>';
    expect(one(hero).ratio).toBe(5.55);
    const photo = '<main><section id="p"><div class="absolute inset-0"><img alt="" src="/a.webp"/></div><p class="type-body text-cream">x</p></section></main>';
    const r = run(photo);
    expect(r.measured).toBe(0);
    expect(r.skipped.map((s) => s.reason)).toEqual([expect.stringContaining('photo backdrop')]);
  });

  it('text with no resolvable backdrop at the top of a section (no tone, no bg) is a photo skip, not a cream default', () => {
    const r = run('<main><section id="p"><p class="type-body text-cream">x</p></section></main>');
    expect(r.measured).toBe(0);
    expect(r.skipped.length).toBe(1);
  });

  it('hover:/md: variants are ignored (base state), sr-only and display:none text is not measured, punctuation-only text is not measured', () => {
    expect(one('<div data-bg-tone="cream"><p class="type-body hover:text-cream md:text-cream">x</p></div>').ratio).toBe(5.55);
    expect(run('<div data-bg-tone="cream"><p class="sr-only text-cream">x</p><p class="hidden text-cream">y</p><p>·</p></div>').measured).toBe(0);
    // hidden on mobile but shown from md: measured (the desktop nav)
    expect(run('<div data-bg-tone="dark"><nav class="hidden md:flex"><a class="text-plum">z</a></nav></div>').findings.length).toBe(1);
  });

  it('an unresolvable colour expression is reported as skipped, never silently passed', () => {
    const r = run('<div data-bg-tone="cream"><p class="type-body text-[color:var(--nope)]">x</p></div>');
    expect(r.measured).toBe(0);
    expect(r.skipped[0].reason).toMatch(/unresolved text colour/);
  });
});

describe('NS-42 resolver controls: review blockers (dedupe, unrecognised colour syntax, group opacity)', () => {
  const run = (html: string): ContrastReport => {
    const holder = document.createElement('div');
    holder.innerHTML = html;
    return contrastReport(holder, 'fixture');
  };

  it('a passing copy of a text does not hide a failing copy of the same text in the same section', () => {
    const r = run('<div data-bg-tone="cream"><p class="type-body">שלום</p><p class="type-body text-cream">שלום</p></div>');
    expect(r.measured).toBe(2);
    expect(r.all.map((f) => f.ratio).sort()).toEqual([1, 5.55]);
    expect(r.findings.map((f) => f.ratio)).toEqual([1]);
    // and in the other order
    const r2 = run('<div data-bg-tone="cream"><p class="type-body text-cream">שלום</p><p class="type-body">שלום</p></div>');
    expect(r2.findings.length).toBe(1);
  });

  it('identical copies (same colours, same type class) are still reported once', () => {
    const r = run('<div data-bg-tone="cream"><p class="type-body text-cream">שלום</p><p class="type-body text-cream">שלום</p></div>');
    expect(r.measured).toBe(2);
    expect(r.findings.length).toBe(1);
  });

  describe('a colour syntax the resolver does not understand is skipped (and the matrix fails on a skip), never ignored', () => {
    it.each([
      ['text-plum/[0.3]', 'text'],
      ['text-[oklch(0.5_0.1_200)]', 'text'],
      ['text-(color:--x)', 'text'],
      ['text-(--nope)', 'text'],
      ['text-[color:var(--c)]/50', 'text'],
      ['bg-[rgb(1,2,3)]', 'bg'],
      ['bg-(--nope)', 'bg'],
      ['bg-cream/[0.5]', 'bg'],
    ])('%s', (cls, kind) => {
      const html = kind === 'text' ? `<div data-bg-tone="cream"><p class="type-body ${cls}">x</p></div>` : `<div data-bg-tone="cream"><div class="${cls}"><p class="type-body">x</p></div></div>`;
      const r = run(html);
      expect(r.measured, cls).toBe(0);
      expect(r.skipped.map((s) => s.reason)[0], cls).toMatch(/unresolved (text colour|background)/);
    });

    it('the Tailwind v4 shorthand resolves: text-(--color-cream) is cream, bg-(--surface-veil) is the veil', () => {
      const f = run('<div data-bg-tone="mid"><div class="bg-(--surface-veil)"><p class="type-body text-(--color-plum)">x</p></div></div>').all[0];
      expect(f.fg).toBe('#7a5978');
      expect(f.bg).toBe('#f6e7e8');
      expect(run('<div data-bg-tone="dark"><p class="type-body text-(--color-cream)">x</p></div>').all[0].ratio).toBe(5.55);
    });

    it.each([
      'text-[14px]', 'text-[length:var(--x)]', 'text-(length:--x)', 'text-[clamp(1rem,2vw,2rem)]', 'text-[.9rem]', 'text-[percentage:50%]',
      'bg-[url(/a.png)]', 'bg-[linear-gradient(red,blue)]', 'bg-[position:left_top]', 'bg-[size:10px]', 'bg-[image:var(--g)]', 'bg-(length:--x)', 'bg-cover', 'bg-gradient-to-t',
    ])('non-colour utility %s is not treated as a colour', (cls) => {
      const r = run(`<div data-bg-tone="cream"><div class="${cls}"><p class="type-body ${cls}">x</p></div></div>`);
      expect(r.skipped, cls).toEqual([]);
      expect(r.all[0].ratio, cls).toBe(5.55);
    });
  });

  describe('group opacity on, or above, the backdrop supplier fades both colours against what is behind it', () => {
    it('opacity-50 on the element that paints the bg: plum at 50% over cream is #bda7b4, and the text fades with it', () => {
      const f = run('<div data-bg-tone="cream"><div class="bg-plum opacity-50"><p class="type-body text-cream">x</p></div></div>').all[0];
      expect(f.bg).toBe('#bda7b4');
      expect(f.fg).toBe('#fff5f0'); // cream text fading toward the cream page behind the group stays cream
      expect(f.ratio).toBeLessThan(5.55);
    });

    it('opacity above the supplier gives the same result as on it', () => {
      const on = run('<div data-bg-tone="cream"><div class="bg-plum opacity-50"><p class="type-body text-cream">x</p></div></div>').all[0];
      const above = run('<div data-bg-tone="cream"><div class="opacity-50"><div class="bg-plum"><p class="type-body text-cream">x</p></div></div></div>').all[0];
      expect(above.bg).toBe(on.bg);
      expect(above.ratio).toBe(on.ratio);
    });

    it('without any group opacity the same pair is 5.55:1, so the fade is what moved it', () => {
      expect(run('<div data-bg-tone="cream"><div class="bg-plum"><p class="type-body text-cream">x</p></div></div>').all[0].ratio).toBe(5.55);
    });

    it('a group whose parent backdrop is a photo is left alone (unknowable): the Expertise pill stays 2.26:1', () => {
      const html = '<main><section id="s"><div class="relative bg-plum"><img alt="" src="/a.webp" style="position:absolute;height:100%;width:100%"/><div class="bg-mauve opacity-95"><span class="type-small font-bold text-cream">x</span></div></div></section></main>';
      expect(run(html).all[0].ratio).toBe(2.26);
    });
  });
});

describe('NS-42 ratchet logic (pure)', () => {
  const f = (over: Partial<ContrastFinding> = {}): ContrastFinding => ({
    page: 'home', where: '#x', text: 'שלום עולם', ratio: 2.26, required: 3, fg: '#fff5f0', bg: '#c49ab8', size: 30, bold: true, typeClass: 'type-title', ...over,
  });
  const a = (over: Partial<ContrastAllow> = {}): ContrastAllow => ({ page: 'home', where: '#x', text: 'שלום', ratio: 2.26, reason: 'r', ...over });

  it('an allow-listed failure passes', () => {
    expect(ratchetContrast([f()], [a()])).toEqual({ fresh: [], stale: [], drifted: [] });
  });

  it('a failure that is not in the table is reported as new', () => {
    const r = ratchetContrast([f(), f({ where: '#y' })], [a()]);
    expect(r.fresh.length).toBe(1);
    expect(r.fresh[0]).toContain('#y');
  });

  it('an allow entry that no longer fails is reported as "stale allow entry, remove it"', () => {
    const r = ratchetContrast([], [a()]);
    expect(r.stale).toHaveLength(1);
    expect(r.stale[0]).toMatch(/^stale allow entry, remove it/);
  });

  it('a changed ratio (a partial fix that still fails) is reported so the table gets updated', () => {
    expect(ratchetContrast([f({ ratio: 2.9 })], [a()]).drifted).toHaveLength(1);
    expect(ratchetContrast([f({ ratio: 2.27 })], [a()]).drifted).toEqual([]);
  });

  it('wildcards: page globs, where alternatives, text "*" narrowed by type', () => {
    const entry = a({ page: 'blog/*', where: '#a|#b', text: '*', type: 'type-small' });
    expect(ratchetContrast([f({ page: 'blog/one', where: '#b', typeClass: 'type-small' })], [entry]).fresh).toEqual([]);
    expect(ratchetContrast([f({ page: 'blog', where: '#b', typeClass: 'type-small' })], [entry]).fresh).toHaveLength(1);
    expect(ratchetContrast([f({ page: 'blog/one', where: '#b', typeClass: 'type-body' })], [entry]).fresh).toHaveLength(1);
  });
});

// ─── 3. The matrix over the real pages ───────────────────────────────────────

describe('NS-42 contrast matrix: home, /blog, every post', () => {
  let pages: Array<{ page: string; root: HTMLElement }>;
  let reports: ContrastReport[];
  beforeAll(async () => {
    pages = await renderContrastPages();
    reports = pages.map(({ page, root }) => contrastReport(root, page));
  });

  it('covers the home page, the blog index and at least two posts, and measures a real amount of text on each (the matrix is not blind)', () => {
    const names = pages.map((p) => p.page);
    expect(names).toContain('home');
    expect(names).toContain('blog');
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

  const failures = () => reports.flatMap((r) => r.findings);
  const BOTH: ContrastAllow[] = [...OWNER_EXCEPTIONS, ...CONTRAST_ALLOW];

  it('every failure is an owner exception or in CONTRAST_ALLOW (a new low-contrast pair fails here)', () => {
    expectNone(ratchetContrast(failures(), BOTH).fresh, 'new contrast failure: fix the colour pair, or (only with the owner agreeing) add it to CONTRAST_ALLOW');
  });

  it.each([
    ['CONTRAST_ALLOW', CONTRAST_ALLOW],
    ['OWNER_EXCEPTIONS', OWNER_EXCEPTIONS],
  ] as const)('every %s entry still fails: stale allow entry, remove it', (_n, table) => {
    expectNone(ratchetContrast(failures(), table).stale, 'the pair was fixed (or the text removed): delete its row');
  });

  it.each([
    ['CONTRAST_ALLOW', CONTRAST_ALLOW],
    ['OWNER_EXCEPTIONS', OWNER_EXCEPTIONS],
  ] as const)('every %s ratio is still the measured one (update the row when a change only moves the pair)', (_n, table) => {
    expectNone(ratchetContrast(failures(), table).drifted, 'ratio drift');
  });

  it('every CONTRAST_ALLOW entry carries a reason', () => {
    for (const e of CONTRAST_ALLOW) expect(e.reason.length, `${e.where} ${e.text}`).toBeGreaterThan(10);
  });

  it('OWNER_EXCEPTIONS rows are dated decisions with a reason, and no failure sits in both tables (a decision is not debt)', () => {
    for (const e of OWNER_EXCEPTIONS) {
      expect(e.decided, `${e.where} ${e.text}`).toBe('2026-10-09');
      expect(e.decision.length).toBeGreaterThan(3);
      expect(e.reason.length).toBeGreaterThan(30);
    }
    const both = failures().filter((f) => OWNER_EXCEPTIONS.some((o) => allowMatches(o, f)) && CONTRAST_ALLOW.some((o) => allowMatches(o, f)));
    expectNone(both.map((f) => `${f.page} ${f.where} "${f.text}"`), 'failure listed as owner exception AND as debt');
  });
});
