const fs = require('fs');
const path = require('path');

const layoutDir = path.join(__dirname, '../src/components/layout');

function fixRTL() {
  const files = fs.readdirSync(layoutDir).filter(f => f.endsWith('.tsx'));

  files.forEach(file => {
    const filePath = path.join(layoutDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // ONLY change text direction and alignment. DO NOT touch absolute positioning (left/right/translate).
    // The browser's native RTL grid handling will mirror the columns automatically.
    
    // 1. Update text direction
    content = content.replace(/direction:ltr;/g, 'direction:rtl;');
    
    // 2. Update text alignment from left to right (for RTL reading)
    content = content.replace(/text-align:left;/g, 'text-align:right;');

    // 3. Update any hardcoded margin-left to margin-right for text spacing
    content = content.replace(/(margin-left|margin-right):/g, (match, p1) => p1 === 'margin-left' ? 'MARGIN_RIGHT_PLACEHOLDER:' : 'MARGIN_LEFT_PLACEHOLDER:');
    content = content.replace(/MARGIN_RIGHT_PLACEHOLDER:/g, 'margin-right:');
    content = content.replace(/MARGIN_LEFT_PLACEHOLDER:/g, 'margin-left:');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed text direction for ${file}`);
  });
}

fixRTL();
