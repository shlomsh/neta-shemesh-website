const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  
  await page.waitForTimeout(1000);
  
  const rects = await page.evaluate(() => {
    const els = document.querySelectorAll('.animated');
    return Array.from(els).map(el => {
      const rect = el.getBoundingClientRect();
      return { top: Math.round(rect.top), height: Math.round(rect.height) };
    });
  });
  
  console.log(rects.filter(r => r.top > 2000).slice(0, 10));
  
  await browser.close();
})();
