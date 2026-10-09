const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function generate() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Font data
  const fontPath = path.join(__dirname, '../public/fonts/Elamy-Bold.woff2');
  const fontData = fs.readFileSync(fontPath).toString('base64');
  
  const htmlTemplate = (width, height, content, fontSize) => `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <style>
        @font-face {
          font-family: 'Elamy';
          src: url('data:font/woff2;base64,${fontData}') format('woff2');
        }
        body {
          margin: 0;
          padding: 0;
          width: ${width}px;
          height: ${height}px;
          background-color: #F7E2D6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Elamy', sans-serif;
          color: #4A3D4A;
        }
        .content {
          font-size: ${fontSize}px;
          line-height: 1;
        }
      </style>
    </head>
    <body>
      <div class="content">${content}</div>
    </body>
    </html>
  `;

  // 1. OpenGraph Image (1200x630)
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(htmlTemplate(1200, 630, 'נטע שמש<br><span style="font-size: 80px; display:block; text-align:center; margin-top:20px;">טיפול זוגי ומשפחתי</span>', 200));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // give font time to render
  await page.screenshot({ path: path.join(__dirname, '../public/opengraph-image.png') });
  console.log('Generated opengraph-image.png');

  // 2. Apple Icon (180x180)
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(htmlTemplate(180, 180, 'נ', 120));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, '../public/apple-icon.png') });
  console.log('Generated apple-icon.png');

  // 3. Favicon (32x32)
  // For 32x32 we might need to make the letter bigger relative to the box
  await page.setViewportSize({ width: 32, height: 32 });
  await page.setContent(htmlTemplate(32, 32, 'נ', 24));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, '../public/icon.png') });
  console.log('Generated icon.png');

  // 4. Also generate a 192x192 icon for android
  await page.setViewportSize({ width: 192, height: 192 });
  await page.setContent(htmlTemplate(192, 192, 'נ', 130));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, '../public/icon-192.png') });
  console.log('Generated icon-192.png');

  await browser.close();
}

generate().catch(console.error);
