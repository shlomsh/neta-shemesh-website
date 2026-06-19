const fs = require('fs');
let content = fs.readFileSync('src/app/globals.css', 'utf8');

// Remove all the .canva-slide and main > section blocks I appended
content = content.replace(/@layer (utilities|base) \{[\s\S]*?(?=\n@layer|\n\n$|$)/g, '');

// Append cleanly
content += `\n@layer base {
  main > section {
    @apply lg:sticky lg:top-0 lg:min-h-[100dvh];
    background-color: var(--color-bg-light);
  }
}
`;

fs.writeFileSync('src/app/globals.css', content);
