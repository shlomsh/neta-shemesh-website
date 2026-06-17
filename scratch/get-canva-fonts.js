const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://kromaticdesignstudio.my.canva.site/couples-therapist', { waitUntil: 'networkidle' });

  const fonts = await page.evaluate(() => {
    const results = {};
    const elements = document.querySelectorAll('*');
    for (const el of elements) {
      if (el.textContent.includes('Success Stories')) {
        results['Success Stories'] = window.getComputedStyle(el).fontFamily;
      }
      if (el.textContent.includes('Expert Guidance for Couples')) {
        results['Expert Guidance'] = window.getComputedStyle(el).fontFamily;
      }
      if (el.textContent.includes('Doctor Avalon')) {
        results['Doctor Avalon'] = window.getComputedStyle(el).fontFamily;
      }
      if (el.textContent.trim() === '01.') {
        results['01.'] = window.getComputedStyle(el).fontFamily;
      }
    }
    return results;
  });

  console.log(JSON.stringify(fonts, null, 2));
  await browser.close();
})();
