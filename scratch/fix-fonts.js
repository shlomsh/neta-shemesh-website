const fs = require('fs');

const fontMap = {
  'YAFdtQi73Xs-0': 'var(--font-canva-primary)',
  'YAErUQDw3VY-0': 'var(--font-canva-secondary)',
  'YAD87vDtOPY-0': 'var(--font-canva-accent)',
  'YAEnl21zi4U-1': 'var(--font-canva-primary)'
};

const componentsDir = 'src/components/layout';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = `${componentsDir}/${file}`;
  let content = fs.readFileSync(filePath, 'utf-8');

  for (const [canvaFont, cssVar] of Object.entries(fontMap)) {
    const regex = new RegExp(canvaFont, 'g');
    content = content.replace(regex, cssVar);
  }

  fs.writeFileSync(filePath, content);
}

console.log('Injected font CSS variables directly into HTML strings!');
