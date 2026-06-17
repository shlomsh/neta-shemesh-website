const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('INTERSECTED')) {
      console.log(msg.text());
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  console.log("Page loaded");
  
  await page.evaluate(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          console.log(`INTERSECTED: top=${Math.round(e.boundingClientRect.top)} id=${e.target.id}`);
        }
      });
    });
    document.querySelectorAll('.animation_container').forEach(el => observer.observe(el));
  });
  
  await page.waitForTimeout(1000);
  console.log("Scrolling...");
  
  // Scroll down 1000px
  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(1000);
  
  // Scroll down another 1000px
  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(1000);
  
  await browser.close();
})();
