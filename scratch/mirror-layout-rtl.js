const fs = require('fs');
const path = require('path');

const layoutDir = path.join(__dirname, '../src/components/layout');

function mirrorRTL() {
  const files = fs.readdirSync(layoutDir).filter(f => f.endsWith('.tsx'));

  files.forEach(file => {
    const filePath = path.join(layoutDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Swap left: and right:
    content = content.replace(/(?<!-)\b(left|right):/g, (match, p1) => p1 === 'left' ? 'RIGHT_PLACEHOLDER:' : 'LEFT_PLACEHOLDER:');
    content = content.replace(/RIGHT_PLACEHOLDER:/g, 'right:');
    content = content.replace(/LEFT_PLACEHOLDER:/g, 'left:');

    // 2. Swap margin-left and margin-right
    content = content.replace(/(margin-left|margin-right):/g, (match, p1) => p1 === 'margin-left' ? 'MARGIN_RIGHT_PLACEHOLDER:' : 'MARGIN_LEFT_PLACEHOLDER:');
    content = content.replace(/MARGIN_RIGHT_PLACEHOLDER:/g, 'margin-right:');
    content = content.replace(/MARGIN_LEFT_PLACEHOLDER:/g, 'margin-left:');

    // 3. Flip translate X values: translate(-58%, ...) -> translate(58%, ...)
    content = content.replace(/translate\(([-0-9.]+)(px|%),/g, (match, xVal, unit) => {
      const mirroredX = -parseFloat(xVal);
      const finalX = mirroredX === 0 ? 0 : mirroredX;
      return `translate(${finalX}${unit},`;
    });

    // 4. Update direction:ltr to direction:rtl
    content = content.replace(/direction:ltr;/g, 'direction:rtl;');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Mirrored ${file} to RTL`);
  });
}

mirrorRTL();
