const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const htmlContent = fs.readFileSync('canva-source/index.html', 'utf8');
const dom = new JSDOM(htmlContent);
const document = dom.window.document;

const sections = Array.from(document.querySelectorAll('section'));

sections.forEach((section, index) => {
  const images = Array.from(section.querySelectorAll('img')).map(img => img.src);
  const text = section.textContent.replace(/\s+/g, ' ').trim().substring(0, 100);
  
  console.log(`Section ${index + 1}:`);
  console.log(`  Images: ${images.length}`);
  console.log(`  Text: ${text}`);
});
