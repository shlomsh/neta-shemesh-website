const fs = require('fs');
const fontkit = require('fontkit');
const https = require('https');

const font_urls = [
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/e3457ee3558a4e0f64a8300cfef3ccec.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/527cd5a6be21d4e008281f52ae03e6de.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/881b8da5ad9b82b143ab37dcdf069c4c.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/bef8ef17f12980b1c74918237a1623bc.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/b13d468f88f904752a71651083120b9b.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/e8e51b9875286101e41224d1f8f57146.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/d769594df7501703a01b15c58fc23317.woff2",
  "https://kromaticdesignstudio.my.canva.site/couples-therapist/fonts/0d6b73825ffb53723442c5660e87b4d4.woff2"
];

async function downloadAndParse(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        try {
          const font = fontkit.create(buffer);
          console.log('URL: ' + url);
          console.log('Font Family: ' + font.familyName);
        } catch (e) {
          console.log('Failed for ' + url);
        }
        resolve();
      });
    });
  });
}

(async () => {
  for (const url of font_urls) {
    await downloadAndParse(url);
  }
})();
