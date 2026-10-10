import { test, expect } from '@playwright/test';

test.describe.configure({ timeout: 120000 });

/**
 * Console chatter that is not ours to fix, so it must not fail the guard:
 *  - Firefox parses the Google map iframe's own Content-Security-Policy and logs its "Ignoring 'unsafe-inline' ..."
 *    warnings into our console (the message carries the frame's file URL, https://www.google.com/maps/embed...).
 *  - Firefox's font sanitizer notes the OS/2 sxHeight (-1) of the self-hosted Elamy files and repairs it;
 *    nothing renders differently.
 */
const IGNORED_CONSOLE = [
  /Content-Security-Policy: Ignoring [\s\S]*https:\/\/www\.google\.com\/maps\/embed/,
  /downloadable font: OS\/2: Bad sxHeight [\s\S]*Elamy/i,
];

test.describe('Runtime Health Guards', () => {
  test('Guard 3 & 4: Console Health and Image Integrity', async ({ page, request }) => {
    const consoleLogs: { type: string, text: string }[] = [];
    const pageErrors: Error[] = [];

    page.on('console', msg => {
      if ((msg.type() === 'error' || msg.type() === 'warning') && !IGNORED_CONSOLE.some((re) => re.test(msg.text()))) {
        consoleLogs.push({ type: msg.type(), text: msg.text() });
      }
    });

    page.on('pageerror', error => {
      pageErrors.push(error);
    });

    await page.goto('/', { waitUntil: 'load' });
    
    // Scroll down to ensure lazy loaded images and components are triggered
    await page.evaluate(async () => {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const scrollHeight = document.body.scrollHeight;
      const viewportHeight = window.innerHeight;
      for (let i = 0; i < scrollHeight; i += Math.max(viewportHeight / 2, 100)) {
        window.scrollTo(0, i);
        await delay(200);
      }
      window.scrollTo(0, 0);
    });
    
    await page.waitForTimeout(2000);

    // Readiness, not a fixed sleep: on a cold CI runner the first /_next/image request of each size is resized on the fly
    // and can outlast the 2 s above, which showed as "Zero-width image" on WebKit. Wait until every image that is on the
    // page has finished loading (the assertions below still fail on one that loaded as zero-width or never loaded).
    await page
      .waitForFunction(() => Array.from(document.querySelectorAll('img')).every((img) => img.complete || img.getClientRects().length === 0), undefined, { timeout: 30000 })
      .catch(() => undefined);

    // Guard 4: Console Errors & Warnings
    if (pageErrors.length > 0 || consoleLogs.length > 0) {
      const errorMsg = [
        `Found ${pageErrors.length} page errors and ${consoleLogs.length} console warnings/errors.`,
        'Page Errors:',
        ...pageErrors.map(e => e.message),
        'Console logs:',
        ...consoleLogs.map(l => `[${l.type}] ${l.text}`)
      ].join('\n');
      // Always fail if there are warnings or errors to report for manager review
      expect(pageErrors.length + consoleLogs.length, errorMsg).toBe(0);
    }

    // Guard 3: Image Integrity
    const imageElements = await page.evaluate(() => {
      const isElementHidden = (el: HTMLElement | null): boolean => {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        // display:none (the other breakpoint's copy) or visibility:hidden (a closed accordion panel): lazy, so never loaded.
        if (style.display === 'none' || style.visibility === 'hidden') return true;
        return isElementHidden(el.parentElement);
      };

      return Array.from(document.querySelectorAll('img')).map(img => {
        const srcCandidates: string[] = [];
        if (img.currentSrc) {
          srcCandidates.push(img.currentSrc);
        } else if (img.src) {
          srcCandidates.push(img.src);
        }
        
        // rudimentary srcset parser
        if (img.srcset) {
          const parts = img.srcset.split(',');
          for (const p of parts) {
            const urlMatch = p.trim().split(/\s+/)[0];
            if (urlMatch) {
              // try to resolve relative URL to absolute
              try {
                srcCandidates.push(new URL(urlMatch, window.location.href).href);
              } catch {
                // ignore invalid
              }
            }
          }
        }
        return {
          src: img.src,
          candidates: Array.from(new Set(srcCandidates)),
          naturalWidth: img.naturalWidth,
          isHidden: isElementHidden(img)
        };
      });
    });

    const brokenImages: string[] = [];
    
    for (const img of imageElements) {
      if (img.isHidden) continue; // Skip hidden elements (the other breakpoint's images, closed accordion panels)

      if (img.naturalWidth === 0) {
        brokenImages.push(`Zero-width image: ${img.src}`);
      }

      for (const url of img.candidates) {
        if (!url.startsWith('http') && !url.startsWith('data:')) continue; // Skip if invalid
        if (url.startsWith('data:')) continue; // skip inline base64

        const res = await request.get(url);
        if (!res.ok()) {
          brokenImages.push(`Broken image (HTTP ${res.status()}): ${url}`);
        }
      }
    }

    if (brokenImages.length > 0) {
      expect(brokenImages.length, `Found broken images:\n${brokenImages.join('\n')}`).toBe(0);
    }
  });

});
