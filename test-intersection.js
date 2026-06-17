const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  
  await page.waitForTimeout(1000);
  
  const rects = await page.evaluate(() => {
    const els = document.querySelectorAll('.animated');
    return Array.from(els).map(el => Math.round(el.getBoundingClientRect().top));
  });
  
  console.log(rects);
  
  await browser.close();
})();
