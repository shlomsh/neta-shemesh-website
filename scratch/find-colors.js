const fs = require('fs');
const path = require('path');

const dir = 'src/components/layout';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const colors = new Set();
const images = new Set();
const svgs = new Set();

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf-8');
  
  // Find colors
  const colorMatches = content.match(/#[0-9a-fA-F]{3,6}/g);
  if (colorMatches) {
    colorMatches.forEach(c => colors.add(c.toLowerCase()));
  }
  
  // Find images (src="...")
  const imgMatches = content.match(/src="images\/[^"]+"/g);
  if (imgMatches) {
    imgMatches.forEach(img => images.add(img));
  }
  
  // Find SVG paths or full tags? We know there are <svg> tags inside the HTML.
  const svgMatches = content.match(/<svg\b[^>]*>.*?<\/svg>/gs);
  if (svgMatches) {
    // Just count them or show length to know how many to extract
    svgs.add(`${f}: ${svgMatches.length} SVGs`);
  }
});

console.log('--- Unique Colors ---');
console.log(Array.from(colors).join(', '));

console.log('\n--- Images ---');
console.log(Array.from(images).length + ' images found.');

console.log('\n--- SVGs ---');
console.log(Array.from(svgs).join('\n'));
