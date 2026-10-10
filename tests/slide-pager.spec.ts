import { test, expect, type Page } from '@playwright/test';

/**
 * Slide pager end to end (NS-48, gate in src/lib/soft-snap.ts).
 *
 * The unit tests (tests-unit/slide-pager.test.ts) cover the decisions with plain numbers. This spec covers what
 * only a browser can: that on a desktop-width viewport with a fine pointer one wheel gesture or one key press
 * really moves the page by exactly one card, and that touch devices (coarse pointer) never download or run the
 * pager, at any width (the iPad is 1194px wide and still scrolls natively).
 *
 * No fixed sleeps stand in for "the slide is done": `settle()` waits until the scroll position has not moved for
 * about 400 ms of animation frames.
 */

/** A string literal that exists only in SlidePager.tsx (the card selector) and survives minification: it marks the pager chunk. */
const PAGER_CHUNK_MARKER = 'main > section, main > footer';
/** Same selector the pager measures; the hero is the first card and sits at the top. */
const CARD_SELECTOR = 'main > section, main > footer';
/** The slide ends on a card top; sub-pixel layout and scrollTo rounding allow a pixel or two. */
const LANDING_TOLERANCE_PX = 3;

/** Remembers every script response that contains the pager code, so "never requested" can be asserted. */
function watchPagerChunk(page: Page) {
  const found: string[] = [];
  const pending: Promise<void>[] = [];
  page.on('response', (res) => {
    if (!/\/_next\/static\/.*\.js(\?|$)/.test(res.url())) return;
    pending.push(
      res.text().then(
        (body) => {
          if (body.includes(PAGER_CHUNK_MARKER)) found.push(res.url());
        },
        () => undefined, // a response that was redirected or aborted has no body
      ),
    );
  });
  return {
    /** URLs of the pager chunk requested so far (after every response seen so far was read). */
    async requested() {
      await Promise.all(pending);
      return found;
    },
  };
}

/** Top (document coordinates) and height of every card, in page order. */
const readCards = (page: Page) =>
  page.evaluate((selector) => {
    return Array.from(document.querySelectorAll<HTMLElement>(selector), (el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, height: r.height };
    });
  }, CARD_SELECTOR);

/** Resolves with window.scrollY once it has stayed put for ~24 animation frames (about 400 ms), or after 5 s. */
const settle = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const started = performance.now();
        let last = window.scrollY;
        let still = 0;
        const tick = () => {
          const y = window.scrollY;
          still = Math.abs(y - last) < 0.01 ? still + 1 : 0;
          last = y;
          if (still >= 24 || performance.now() - started > 5000) resolve(y);
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );

/** Assert that the page came to rest on `top` (and did not carry on to the card after it). */
async function expectRestsAt(page: Page, top: number, what: string) {
  const y = await settle(page);
  expect(Math.abs(y - top), `${what}: rested at ${y.toFixed(1)}, wanted the card top ${top.toFixed(1)}`).toBeLessThanOrEqual(LANDING_TOLERANCE_PX);
}

test.describe('slide pager: desktop width, fine pointer', () => {
  test.skip(({ isMobile, browserName }) => isMobile || browserName === 'firefox', 'engines with a mouse and a fine pointer: Chromium and Safari');
  // Tall enough that every card is exactly one screen high (a taller card scrolls natively until its edge, by design).
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    // The pager registers the only `wheel` listener on window. Seeing it registered is the readiness signal.
    await page.addInitScript(() => {
      const w = window as unknown as { __wheelListeners: number };
      w.__wheelListeners = 0;
      const add = window.addEventListener.bind(window);
      window.addEventListener = ((type: string, ...rest: unknown[]) => {
        if (type === 'wheel') w.__wheelListeners += 1;
        return (add as (...a: unknown[]) => void)(type, ...rest);
      }) as typeof window.addEventListener;
    });
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForFunction(() => (window as unknown as { __wheelListeners: number }).__wheelListeners > 0);
    await page.mouse.move(720, 450);
    // Hero first: layout is final, every card one screen.
    const cards = await readCards(page);
    expect(cards.length).toBeGreaterThanOrEqual(5);
    for (const [i, c] of cards.entries()) {
      expect(c.height, `card ${i} is one screen high`).toBeLessThanOrEqual(900 + 4);
    }
    expect(Math.abs((await settle(page)) - cards[0].top)).toBeLessThanOrEqual(LANDING_TOLERANCE_PX);
  });

  test('the pager chunk is requested (so the "never requested" checks on touch devices are not vacuous)', async ({ page }) => {
    const watcher = watchPagerChunk(page);
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => (window as unknown as { __wheelListeners: number }).__wheelListeners > 0);
    expect((await watcher.requested()).length).toBeGreaterThan(0);
  });

  test('one mouse-wheel notch moves exactly one card, down and back up', async ({ page }) => {
    const cards = await readCards(page);
    for (let i = 1; i <= 3; i++) {
      await page.mouse.wheel(0, 120); // a classic mouse notch: one discrete event
      await expectRestsAt(page, cards[i].top, `notch ${i} down`);
    }
    await page.mouse.wheel(0, -120);
    await expectRestsAt(page, cards[2].top, 'notch up');
  });

  test('a trackpad-style burst (sharp rise, long decaying tail) still moves exactly one card', async ({ page }) => {
    const cards = await readCards(page);
    // ~15 events, 16 ms apart, the shape of one finger flick; the tail keeps coming while the slide runs.
    const flick = [4, 14, 30, 48, 62, 66, 58, 46, 34, 24, 16, 10, 6, 4, 2];
    for (let i = 1; i <= 2; i++) {
      for (const dy of flick) {
        await page.mouse.wheel(0, dy);
        await page.waitForTimeout(16);
      }
      await expectRestsAt(page, cards[i].top, `flick ${i}`);
    }
  });

  test('PageDown, ArrowDown and PageUp each move exactly one card', async ({ page }) => {
    const cards = await readCards(page);
    await page.keyboard.press('PageDown');
    await expectRestsAt(page, cards[1].top, 'PageDown');
    await page.keyboard.press('ArrowDown');
    await expectRestsAt(page, cards[2].top, 'ArrowDown');
    await page.keyboard.press('PageDown');
    await expectRestsAt(page, cards[3].top, 'PageDown again');
    await page.keyboard.press('PageUp');
    await expectRestsAt(page, cards[2].top, 'PageUp');
  });
});

test.describe('slide pager: touch devices (coarse pointer) never get it', () => {
  test.skip(({ hasTouch }) => !hasTouch, 'touch projects only (iphone, ipad)');

  test('no pager chunk is requested and the page scrolls natively', async ({ page }) => {
    const watcher = watchPagerChunk(page);
    await page.addInitScript(() => {
      const w = window as unknown as { __wheelListeners: number };
      w.__wheelListeners = 0;
      const add = window.addEventListener.bind(window);
      window.addEventListener = ((type: string, ...rest: unknown[]) => {
        if (type === 'wheel') w.__wheelListeners += 1;
        return (add as (...a: unknown[]) => void)(type, ...rest);
      }) as typeof window.addEventListener;
    });
    await page.goto('/', { waitUntil: 'load' });

    const gate = await page.evaluate(() => ({
      width: window.innerWidth,
      coarse: matchMedia('(pointer: coarse)').matches,
      fine: matchMedia('(pointer: fine)').matches,
      snapMedia: matchMedia('(min-width: 64rem) and (pointer: fine)').matches,
    }));
    expect(gate.snapMedia, `snap media must not match here (${JSON.stringify(gate)})`).toBe(false);

    // Walk the whole page down by native means so any lazily imported chunk would have been fetched by now.
    await page.evaluate(async () => {
      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
      for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(window.innerHeight / 2, 100)) {
        window.scrollTo(0, y);
        await delay(100);
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle').catch(() => undefined); // best effort: the lazy map iframe may keep the network busy

    expect(await watcher.requested(), 'the pager chunk must not be downloaded on a touch device').toEqual([]);
    expect(await page.evaluate(() => (window as unknown as { __wheelListeners: number }).__wheelListeners), 'nothing registered a wheel listener on window').toBe(0);

    // Nothing intercepts input. Mobile WebKit cannot emit real wheel events, so a cancelable synthetic one stands in
    // (with a pager listening, preventDefault would make dispatchEvent return false), plus a real PageDown key press.
    const wheelNotCancelled = await page.evaluate(() =>
      document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: 300, bubbles: true, cancelable: true })),
    );
    expect(wheelNotCancelled, 'a wheel event is never cancelled').toBe(true);
    await page.evaluate(() => {
      (window as unknown as { __keyCancelled: boolean }).__keyCancelled = false;
      window.addEventListener('keydown', (e) => {
        if (e.defaultPrevented) (window as unknown as { __keyCancelled: boolean }).__keyCancelled = true;
      });
    });
    await page.keyboard.press('PageDown');
    await settle(page);
    expect(await page.evaluate(() => (window as unknown as { __keyCancelled: boolean }).__keyCancelled), 'PageDown is never cancelled').toBe(false);

    // No snapping after a scroll: park the page mid-card (a position that is no card top) and it must stay there.
    // (The deleted touch snap pulled the page to a card top shortly after scrolling stopped.)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    const tops = (await readCards(page)).map((c) => c.top);
    const midCard = Math.round((tops[1] + tops[2]) / 2) + 123; // away from every card top
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), midCard);
    const y = await settle(page);
    expect(Math.abs(y - midCard), `scrollY ${y.toFixed(1)} stays where it was put (${midCard})`).toBeLessThanOrEqual(1);
  });
});
