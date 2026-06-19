const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');
content = content.replace('overflow-hidden', '');
content = content.replace(/style=\{\{\s*backgroundColor.*?\}\}/, 'className="relative w-full bg-[var(--color-bg-light)] pb-[35px]"');
fs.writeFileSync('src/app/page.tsx', content);
