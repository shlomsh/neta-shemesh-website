import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const TARGET_URL = process.env.BASE_URL || 'http://localhost:3000';
const GOLDEN_DIR = path.join(__dirname, '__golden__');
const UPDATE_GOLDEN = process.env.UPDATE_GOLDEN === '1';

test.describe.configure({ timeout: 120000 });

test.describe('DOM Fingerprint & Structural Guards', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium only');

  test.beforeEach(async ({ page }) => {
    await page.goto(TARGET_URL, { waitUntil: 'load' });
    await page.waitForTimeout(2000);
  });

  test.skip('Guard 1: DOM Structural Fingerprint', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const fingerprint = await page.evaluate(() => {
      function serialize(el: Element): any {
        const tag = el.tagName.toLowerCase();
        if (tag === 'script' || tag === 'nextjs-portal' || tag === 'next-route-announcer' || (el.id && el.id.includes('route-announcer'))) return null;
        const obj: any = { tag };
        if (el.id) obj.id = el.id;
        if (el.classList.length > 0) {
          obj.classes = Array.from(el.classList).sort();
        }
        const children = Array.from(el.children).map(serialize).filter(Boolean);
        if (children.length > 0) obj.children = children;
        return obj;
      }
      return serialize(document.body);
    });

    const outPath = path.join(GOLDEN_DIR, 'dom-fingerprint.json');
    if (!fs.existsSync(outPath) || UPDATE_GOLDEN) {
      fs.mkdirSync(GOLDEN_DIR, { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(fingerprint, null, 2));
    } else {
      const golden = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
      expect(fingerprint).toEqual(golden);
    }
  });

  test('Guard 2: Canva ID Inventory', async ({ page }) => {
    const ids = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[id]'))
        .map(el => el.id)
        .sort();
    });

    const outPath = path.join(GOLDEN_DIR, 'id-inventory.json');
    if (!fs.existsSync(outPath) || UPDATE_GOLDEN) {
      fs.mkdirSync(GOLDEN_DIR, { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(ids, null, 2));
    } else {
      const golden = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
      // Compare sets
      const added = ids.filter(id => !golden.includes(id));
      const removed = golden.filter((id: string) => !ids.includes(id));
      expect(added, `Added IDs`).toEqual([]);
      expect(removed, `Removed IDs`).toEqual([]);
      expect(ids).toEqual(golden);
    }
  });

  test.skip('Guard 5: Section Background + Order', async ({ page }) => {
    const sections = await page.evaluate(() => {
      const bands = Array.from(document.querySelectorAll('main > div[style*="100rem"]'));
      
      return bands.map(band => {
        // Find the colored backing surface inside the band.
        // We look for a child div that is typically absolutely positioned or fills the area,
        // often having a background color set inline or via tailwind.
        // A robust selector for Canva exported bands is usually the first descendant
        // that has a background-color style, or the first direct child's first child.
        // We'll walk down and find the first element with a computed background-color that is not 'rgba(0, 0, 0, 0)'
        let bgColor = 'rgba(0, 0, 0, 0)';
        const walk = (el: Element) => {
          const comp = window.getComputedStyle(el);
          if (comp.backgroundColor !== 'rgba(0, 0, 0, 0)' && comp.backgroundColor !== 'transparent') {
            bgColor = comp.backgroundColor;
            return true;
          }
          for (let i = 0; i < el.children.length; i++) {
            if (walk(el.children[i])) return true;
          }
          return false;
        };
        walk(band);

        return {
          id: band.id || 'no-id',
          top: Math.round(band.getBoundingClientRect().top),
          backgroundColor: bgColor
        };
      }).sort((a, b) => a.top - b.top);
    });

    const outPath = path.join(GOLDEN_DIR, 'section-surfaces.json');
    if (!fs.existsSync(outPath) || UPDATE_GOLDEN) {
      fs.mkdirSync(GOLDEN_DIR, { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(sections, null, 2));
    } else {
      const golden = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
      expect(sections).toEqual(golden);
    }
  });
});
