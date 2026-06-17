const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  
  const badElements = await page.locator('[classname="animated"]').all();
  console.log("Elements with classname:", badElements.length);
  
  await browser.close();
})();
