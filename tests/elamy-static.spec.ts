import { test, expect } from '@playwright/test';

/**
 * Elamy section titles are static (CLAUDE.md typography rule 9).
 *
 * Elamy's declared ascent (0.8em) is far below its glyph ink (up to 1.5em), and iPhone Safari repaints text
 * only inside the declared height. Any animated repaint of a `.type-title` (a ScrollReveal fade/rise, an
 * opacity or transform change, a colour transition) therefore cuts the tops of the tall swashes (ל צ ק and the
 * final forms), and they stay cut until a scroll repaints them. So no `.type-title` may be, or sit inside,
 * a `[data-reveal]` wrapper, nor carry a running-capable `transition` / `animation` on itself or on an
 * ancestor up to its section. No allowlist. The hero H1 is held to the same rule; the step numerals are out of scope
 * (the signatures have their own guard, last test below).
 *
 * Second guard: iPhone Safari also cuts the swash tops inside an `overflow: hidden|auto|scroll` ancestor. So at a phone
 * width (390px; every project is forced to it for this test) no `.type-title` and no hero H1 may have such an ancestor
 * up to and including its section (use `overflow-clip`). It is deliberately NOT asserted at lg+: Bio keeps
 * `lg:overflow-hidden!` for its sticky column (see Bio.tsx), and the Safari defect was only reproduced on phones.
 * The same test fails a title that a row flex/grid container centres (`items-center`) in a taller row: Safari cut the
 * Bio/Services swashes that way (SectionTitle with a `marker`).
 *
 * Third guard (any width): Safari clips a `filter` / `mask` / `clip-path` to the element's LAYOUT box, which for Elamy is
 * far smaller than the ink (see INK_EM). The CTA band title carried `drop-shadow-md` and lost the top of its final ץ in
 * Safari (Mac, iPad, iPhone; not Chromium) with nothing animating. So any such element at or above a title (up to its
 * section) must reach INK_EM above and below the title's text and 1rem (the gutter) beside it: the `ink-box` utility
 * (padding + equal negative margin) does that without moving anything.
 */
const TITLES = '.type-title, h1.type-display';
const SCROLLERS = ['hidden', 'auto', 'scroll'];
// Elamy Bold ink beyond the text's content area, in em (fontkit, Hebrew glyphs): 0.72 above (ץ 1.516 - 0.8 ascent) and
// 0.65 below (ך -0.8 - -0.15 descent). Sideways (up to 0.71em, נ ל ץ) only the title's line ends can reach a box edge, and
// a wider box would leave the 1rem gutter at 375px, so the inline cover is 1rem.
const INK_EM = 0.72;
const INK_SIDE_REM = 1;

for (const route of ['/', '/blog']) {
test(`${route}: every .type-title and the hero H1 is static: no [data-reveal], transition or animation on it or its ancestors`, async ({ page }) => {
  await page.goto(route);
  await page.waitForSelector(TITLES);
  // Give the reveal observer the chance to arm (it only does so when it can animate); never required.
  await page.waitForSelector('html[data-reveal-armed]', { state: 'attached', timeout: 5_000 }).catch(() => {});

  const result = await page.evaluate((sel) => {
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : ''}`;
    const offenders: string[] = [];
    const titles = [...document.querySelectorAll(sel)];
    for (const title of titles) {
      const label = `${describe(title)} "${(title.textContent ?? '').trim().slice(0, 30)}"`;
      for (let el: Element | null = title; el && el !== document.body; el = el.parentElement) {
        const where = el === title ? 'itself' : `ancestor ${describe(el)}`;
        if (el.hasAttribute('data-reveal')) offenders.push(`${label}: [data-reveal] on ${where}`);
        const cs = getComputedStyle(el);
        const durations = cs.transitionDuration.split(',').map((d) => parseFloat(d) * (d.trim().endsWith('ms') ? 0.001 : 1));
        const delays = cs.transitionDelay.split(',').map((d) => parseFloat(d) * (d.trim().endsWith('ms') ? 0.001 : 1));
        const transitions = durations.some((d, i) => d + (delays[i % delays.length] || 0) > 0) && cs.transitionProperty !== 'none';
        if (transitions) offenders.push(`${label}: transition (${cs.transitionProperty} ${cs.transitionDuration}) on ${where}`);
        if (cs.animationName !== 'none') offenders.push(`${label}: animation ${cs.animationName} on ${where}`);
        if (el.tagName === 'SECTION') break;
      }
    }
    return { count: titles.length, offenders };
  }, TITLES);

  expect(result.count, 'the home page should render .type-title headings').toBeGreaterThan(0);
  expect(result.offenders, 'Elamy titles must not animate (iPhone Safari cuts the swash tops)').toEqual([]);
});

// Scoped to the home page: the blog pages mount `<PageShell overflow="hidden">` (a deliberate, documented difference), so
// their `main` is a scroll container. Not yet covered by this assertion (follow-up for the owner).
test(`${route}: a filter, mask or clip-path at or above an Elamy title covers the swash ink (Safari clips it to the layout box)`, async ({ page }) => {
  await page.goto(route);
  await page.waitForSelector(TITLES);

  const result = await page.evaluate(({ sel, ink, side }) => {
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : ''}`;
    const none = (v: string) => v === 'none' || v === '';
    const offenders: string[] = [];
    const titles = [...document.querySelectorAll(sel)];
    for (const title of titles) {
      const label = `${describe(title)} "${(title.textContent ?? '').trim().slice(0, 30)}"`;
      const em = parseFloat(getComputedStyle(title).fontSize);
      const range = document.createRange();
      range.selectNodeContents(title);
      const text = range.getBoundingClientRect();
      for (let el: Element | null = title; el && el !== document.body; el = el.parentElement) {
        const cs = getComputedStyle(el);
        const clipping = [['filter', cs.filter], ['mask-image', cs.maskImage], ['-webkit-mask-image', cs.webkitMaskImage], ['clip-path', cs.clipPath]].filter(([, v]) => !none(v));
        if (clipping.length) {
          const box = el.getBoundingClientRect();
          const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
          const gaps = { top: [text.top - box.top, ink * em], bottom: [box.bottom - text.bottom, ink * em], start: [text.left - box.left, side * rem], end: [box.right - text.right, side * rem] };
          const short = Object.entries(gaps).filter(([, [g, need]]) => g < need - 0.5).map(([where, [g]]) => `${where} ${(g / em).toFixed(2)}em`);
          if (short.length) offenders.push(`${label}: ${clipping.map(([n]) => n).join('+')} on ${el === title ? 'itself' : `ancestor ${describe(el)}`} leaves the swash ink uncovered (${short.join(', ')}; needs ${ink}em above/below, ${side}rem beside)`);
        }
        if (el.tagName === 'SECTION') break;
      }
    }
    return { count: titles.length, offenders };
  }, { sel: TITLES, ink: INK_EM, side: INK_SIDE_REM });

  expect(result.count).toBeGreaterThan(0);
  expect(result.offenders, 'a filtered Elamy title needs the ink-box utility (Safari cuts the swash tops to the layout box)').toEqual([]);
});

if (route === '/')
test(`${route}: the footer signature carries ink room and the Bio signature masks a <g> with a full-size rect (iOS Safari clips the tails)`, async ({ page }) => {
  await page.goto(route);
  await page.waitForSelector('.type-signature');

  const result = await page.evaluate((ink) => {
    const offenders: string[] = [];
    // 1. Footer `.type-signature` (Elamy 400, the last item of a column that sits over a parallax photo): iOS Safari
    // composites that column and clips it to its layout box, so the long tail of the final letter was cut. The `ink-box`
    // utility (padding + equal negative margin) must give it ink room above and below, with no layout change.
    for (const sig of document.querySelectorAll('.type-signature')) {
      const em = parseFloat(getComputedStyle(sig).fontSize);
      const range = document.createRange();
      range.selectNodeContents(sig);
      const text = range.getBoundingClientRect();
      const box = sig.getBoundingClientRect();
      const top = (text.top - box.top) / em;
      const bottom = (box.bottom - text.bottom) / em;
      if (top < ink - 0.01 || bottom < ink - 0.01) offenders.push(`.type-signature: ink room above ${top.toFixed(2)}em / below ${bottom.toFixed(2)}em, needs ${ink}em (use ink-box)`);
    }
    // 2. Bio signature (SVG): Safari clips an SVG <text mask> to the text's font-metric box, which ends above the tail of
    // the final letter. The mask must sit on a <g> that also holds a full-size rect, never directly on the <text>.
    for (const text of document.querySelectorAll('text.sig-text')) {
      if (text.hasAttribute('mask')) offenders.push('text.sig-text carries mask directly (Safari clips it to the font-metric box)');
      const g = text.parentElement;
      if (!g || g.tagName.toLowerCase() !== 'g' || !g.hasAttribute('mask')) offenders.push('text.sig-text is not inside a <g mask>');
      else if (!g.querySelector(':scope > rect')) offenders.push('<g mask> around text.sig-text has no sizing <rect>');
    }
    return { sigs: document.querySelectorAll('.type-signature').length + document.querySelectorAll('text.sig-text').length, offenders };
  }, INK_EM);

  expect(result.sigs).toBeGreaterThan(0);
  expect(result.offenders, 'signature tails must not be clipped (iOS Safari)').toEqual([]);
});

if (route === '/')
test(`${route}: no .type-title or hero H1 sits in a scroll container or is centred in a taller flex/grid row at 390px`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await page.waitForSelector(TITLES);

  const result = await page.evaluate(({ sel, scrollers }) => {
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : ''}`;
    const offenders: string[] = [];
    const titles = [...document.querySelectorAll(sel)];
    for (const title of titles) {
      const label = `${describe(title)} "${(title.textContent ?? '').trim().slice(0, 30)}"`;
      for (let el: Element | null = title; el && el !== document.body; el = el.parentElement) {
        const cs = getComputedStyle(el);
        if (scrollers.includes(cs.overflowX) || scrollers.includes(cs.overflowY)) {
          offenders.push(`${label}: overflow ${cs.overflowX}/${cs.overflowY} on ${el === title ? 'itself' : `ancestor ${describe(el)}`}`);
        }
        // iPhone Safari also cuts the swashes of a title that a row flex/grid container centres (align-items:center)
        // in a taller row (Bio and Services: the marker is taller than the title on phones). Only the title and its
        // two-child marker row are checked: Section-level centring of whole content blocks (CTA band) is not this defect.
        const parent = el.parentElement;
        if (parent && (el === title || (el === title.parentElement && el.children.length === 2))) {
          const ps = getComputedStyle(parent);
          const row = (ps.display.includes('flex') && ps.flexDirection.startsWith('row')) || ps.display.includes('grid');
          const align = cs.alignSelf !== 'auto' ? cs.alignSelf : ps.alignItems;
          if (row && align === 'center' && parent.getBoundingClientRect().height - el.getBoundingClientRect().height > 1) {
            offenders.push(`${label}: centred (align-items:center) in a taller ${ps.display} row (${el === title ? 'itself' : `its wrapper ${describe(el)}`})`);
          }
        }
        if (el.tagName === 'SECTION') break;
      }
    }
    return { count: titles.length, offenders };
  }, { sel: TITLES, scrollers: SCROLLERS });

  expect(result.count).toBeGreaterThan(0);
  expect(result.offenders, 'Elamy titles must not sit in a scroll container at phone width (use overflow-clip)').toEqual([]);
});
}
