import { test, expect } from '@playwright/test';

/**
 * Elamy section titles are static (CLAUDE.md typography rule 9).
 *
 * Elamy's declared ascent (0.8em) is far below its glyph ink (up to 1.5em), and iPhone Safari repaints text
 * only inside the declared height. Any animated repaint of a `.type-title` (a ScrollReveal fade/rise, an
 * opacity or transform change, a colour transition) therefore cuts the tops of the tall swashes (ל צ ק and the
 * final forms), and they stay cut until a scroll repaints them. So no `.type-title` may be, or sit inside,
 * a `[data-reveal]` wrapper, nor carry a running-capable `transition` / `animation` on itself or on an
 * ancestor up to its section. No allowlist. The hero H1 is held to the same rule; the step numerals and the
 * signature are out of scope.
 *
 * Second guard: iPhone Safari also cuts the swash tops inside an `overflow: hidden|auto|scroll` ancestor. So at a phone
 * width (390px; every project is forced to it for this test) no `.type-title` and no hero H1 may have such an ancestor
 * up to and including its section (use `overflow-clip`). It is deliberately NOT asserted at lg+: Bio keeps
 * `lg:overflow-hidden!` for its sticky column (see Bio.tsx), and the Safari defect was only reproduced on phones.
 * The same test fails a title that a row flex/grid container centres (`items-center`) in a taller row: Safari cut the
 * Bio/Services swashes that way (SectionTitle with a `marker`).
 */
const TITLES = '.type-title, h1.type-display';
const SCROLLERS = ['hidden', 'auto', 'scroll'];

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
