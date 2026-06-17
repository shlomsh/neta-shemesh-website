const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('BATCH')) {
      console.log(msg.text());
    }
  });

  await page.goto('http://localhost:3000');
  
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    window.observerLog = [];
    const observer = new IntersectionObserver(entries => {
      const is = entries.filter(e => e.isIntersecting);
      if(is.length > 0) console.log('BATCH:', is.length);
    });
    document.querySelectorAll('.animation_container').forEach(el => observer.observe(el));
  });
  
  await page.evaluate(() => window.scrollBy(0, 1500));
  await page.waitForTimeout(500);
  
  await browser.close();
})();
