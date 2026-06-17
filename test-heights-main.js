const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  
  await page.waitForTimeout(1000);
  
  const h = await page.evaluate(() => document.querySelector('main').getBoundingClientRect().height);
  const bodyH = await page.evaluate(() => document.body.getBoundingClientRect().height);
  const scrollH = await page.evaluate(() => document.documentElement.scrollHeight);
  
  console.log({ mainHeight: h, bodyHeight: bodyH, scrollHeight: scrollH });
  
  await browser.close();
})();
