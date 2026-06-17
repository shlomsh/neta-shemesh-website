const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const fontUrls = [];
  page.on('response', response => {
    const url = response.url();
    if (url.includes('.woff') || url.includes('fonts/')) {
      fontUrls.push(url);
    }
  });

  await page.goto('https://kromaticdesignstudio.my.canva.site/couples-therapist', { waitUntil: 'networkidle' });

  console.log(JSON.stringify(fontUrls, null, 2));
  await browser.close();
})();
