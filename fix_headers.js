const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/layout/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace section-header with the correct inline sizes but leave the font family alone!
  // Wait, section-header was previously giving it Stanga implicitly? No.
  content = content.replace(/className="section-header"/g, 'className="font-[family-name:var(--font-stanga)] font-bold text-[clamp(28px,4.375vw,56px)] leading-[1.2] tracking-[-0.01em] normal-case text-[var(--color-canva-dark)]"');
  content = content.replace(/className="section-header text-center"/g, 'className="font-[family-name:var(--font-canva-accent)] font-bold text-[clamp(28px,4.375vw,56px)] leading-[1.2] tracking-[-0.01em] normal-case text-[var(--color-canva-dark)] text-center"');
  content = content.replace(/className="section-header on-dark"/g, 'className="font-[family-name:var(--font-stanga)] font-bold text-[clamp(28px,4.375vw,56px)] leading-[1.2] tracking-[-0.01em] normal-case text-[var(--color-white)]"');
  
  fs.writeFileSync(file, content);
});
console.log('Fixed headers');
