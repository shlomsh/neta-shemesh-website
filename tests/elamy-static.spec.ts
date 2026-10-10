import { test, expect } from '@playwright/test';

/**
 * Elamy section titles are static (CLAUDE.md typography rule 9).
 *
 * Elamy's declared ascent (0.8em) is far below its glyph ink (up to 1.5em), and iPhone Safari repaints text
 * only inside the declared height. Any animated repaint of a `.type-title` (a ScrollReveal fade/rise, an
 * opacity or transform change, a colour transition) therefore cuts the tops of the tall swashes (ל צ ק and the
 * final forms), and they stay cut until a scroll repaints them. So no `.type-title` may be, or sit inside,
 * a `[data-reveal]` wrapper, nor carry a running-capable `transition` / `animation` on itself or on an
 * ancestor up to its section. No allowlist. The hero H1, the step numerals and the signature are out of scope.
 */
for (const route of ['/', '/blog']) {
test(`${route}: every .type-title is static: no [data-reveal], transition or animation on it or its ancestors`, async ({ page }) => {
  await page.goto(route);
  await page.waitForSelector('.type-title');
  // Give the reveal observer the chance to arm (it only does so when it can animate); never required.
  await page.waitForSelector('html[data-reveal-armed]', { state: 'attached', timeout: 5_000 }).catch(() => {});

  const result = await page.evaluate(() => {
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${typeof el.className === 'string' && el.className ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : ''}`;
    const offenders: string[] = [];
    const titles = [...document.querySelectorAll('.type-title')];
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
  });

  expect(result.count, 'the home page should render .type-title headings').toBeGreaterThan(0);
  expect(result.offenders, 'Elamy titles must not animate (iPhone Safari cuts the swash tops)').toEqual([]);
});
}
