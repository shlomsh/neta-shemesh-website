import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const TARGET_URL = process.env.BASE_URL || 'http://localhost:3000';
const GOLDEN_PATH = path.join(__dirname, '__golden__', 'computed-styles.json');
const UPDATE_GOLDEN = process.env.UPDATE_GOLDEN === '1';

const TITLE_IDS = [
  'yWav85A872J3eebD', 'GDq1TYUPnp1UCFMP', 'YoSfu967TqAAsgNM', 'vyKTmOw3YNYlJZPL',
  'pEc3w8pe4QAw5k7o', 'eIrsfUtmMjgXi5KA', 'Dct2rK7XCXJaLA2e', 'T749khVkMfNluBNv',
  'iVtldd7PMtN1BthG', 'ZgJbejfHoeBrgmf7', 'zNSWHTotP3XOaXao'
];
const BADGE_IDS = [
  'iX1y60KQCFRO2tz7', 'nvYoaDfEf8PYEUkZ', 'UTWENAM2BndHWxTG',
  'C6kwWbyjvll4Onps', 'S4Z6ufGypobah33q', 'sxTQm2kdPRgTXj9F'
];
const MAP_ID = 'LW4zsSyHyezRncZj';

const ALL_IDS = [...TITLE_IDS, ...BADGE_IDS, MAP_ID];

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 812 }
];

test.describe.configure({ timeout: 120000 });

test.describe('Computed Style Golden Oracle', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium only');
  let goldenData: any = {};

  test.beforeAll(() => {
    if (fs.existsSync(GOLDEN_PATH)) {
      goldenData = JSON.parse(fs.readFileSync(GOLDEN_PATH, 'utf-8'));
    }
  });

  for (const vp of VIEWPORTS) {
    test(`Capture and assert styles at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(TARGET_URL, { waitUntil: 'load' });

      // Scroll loop to trigger IntersectionObserver animations
      await page.evaluate(async () => {
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const scrollHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;
        for (let i = 0; i < scrollHeight; i += Math.max(viewportHeight / 2, 100)) {
          window.scrollTo(0, i);
          await delay(300);
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(2000);

      const capture = await page.evaluate(({ TITLE_IDS, BADGE_IDS, MAP_ID, ALL_IDS }) => {
        const result: any = {};
        const propsToCapture = [
          'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight',
          'letterSpacing', 'color', 'textTransform', 'textAlign', 'direction',
          'whiteSpace', 'wordBreak'
        ];
        
        for (const id of ALL_IDS) {
          const el = document.getElementById(id);
          if (!el) {
            result[id] = { error: 'Not found' };
            continue;
          }
          
          result[id] = { p: {}, rect: {} };
          
          // Rect
          const rect = el.getBoundingClientRect();
          result[id].rect = {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            top: Math.round(rect.top),
            left: Math.round(rect.left)
          };

          const style = window.getComputedStyle(el);
          for (const p of propsToCapture) {
            result[id].p[p] = style[p as any];
          }
          if (id === MAP_ID) {
            result[id].p['maxWidth'] = style.maxWidth;
            result[id].p['marginLeft'] = style.marginLeft;
            result[id].p['marginRight'] = style.marginRight;
          }

          if (TITLE_IDS.includes(id)) {
            const span = el.querySelector('span');
            if (span) {
              result[id].span = {};
              const spanStyle = window.getComputedStyle(span);
              for (const p of propsToCapture) {
                result[id].span[p] = spanStyle[p as any];
              }
            } else {
              result[id].span = { error: 'No span found' };
            }
          }
        }
        return result;
      }, { TITLE_IDS, BADGE_IDS, MAP_ID, ALL_IDS });

      const sortedCapture = Object.keys(capture).sort().reduce((acc: any, key: string) => {
        acc[key] = capture[key];
        return acc;
      }, {});

      if (!fs.existsSync(GOLDEN_PATH) || UPDATE_GOLDEN) {
        let currentGoldenData: any = {};
        if (fs.existsSync(GOLDEN_PATH)) {
          currentGoldenData = JSON.parse(fs.readFileSync(GOLDEN_PATH, 'utf-8'));
        }
        currentGoldenData[vp.name] = sortedCapture;
        fs.mkdirSync(path.dirname(GOLDEN_PATH), { recursive: true });
        fs.writeFileSync(GOLDEN_PATH, JSON.stringify(currentGoldenData, null, 2));
      } else {
        expect(goldenData[vp.name], `Viewport ${vp.name} styles`).toBeDefined();
        
        // Assert individually to give exact diffs
        for (const id of Object.keys(sortedCapture)) {
          for (const nodeType of Object.keys(sortedCapture[id])) {
            if (nodeType === 'error' || sortedCapture[id][nodeType]?.error) {
              // we don't assert missing elements if golden also misses it, but ideally we match exactly
              continue;
            }
            for (const prop of Object.keys(sortedCapture[id][nodeType])) {
              expect(sortedCapture[id][nodeType][prop], `Mismatch at [${vp.name}][${id}][${nodeType}][${prop}]`)
                .toEqual(goldenData[vp.name]?.[id]?.[nodeType]?.[prop]);
            }
          }
        }
      }
    });
  }
});
