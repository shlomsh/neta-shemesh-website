const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/layout/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // We want to add sticky, top-0, h-[100dvh], overflow-y-auto, flex, flex-col, justify-center
  // But wait, many sections have their own flex/grid logic. Let's just add min-h-[100dvh] flex flex-col justify-center sticky top-0
  content = content.replace(/className="(.*?)"/g, (match, classes) => {
    if (classes.includes('relative overflow-hidden') && !classes.includes('sticky top-0 min-h-[100dvh]')) {
      return `className="${classes} sticky top-0 min-h-[100dvh] flex flex-col justify-center"`;
    }
    return match;
  });
  // Also handle cases where className is written on multiple lines
  content = content.replace(/className=\{`([^`]+)`\}/g, (match, classes) => {
     return match;
  });
  
  fs.writeFileSync(file, content);
});
console.log('Patched sections');
