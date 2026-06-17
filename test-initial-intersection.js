const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen to console to see what intersected
  page.on('console', msg => {
    if (msg.text().includes('INTERSECTED')) {
      console.log(msg.text());
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  await page.evaluate(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          console.log('INTERSECTED:', Math.round(e.boundingClientRect.top));
        }
      });
    });
    document.querySelectorAll('.animated').forEach(el => observer.observe(el));
  });
  
  await page.waitForTimeout(2000);
  
  await browser.close();
})();
