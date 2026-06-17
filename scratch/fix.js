const fs = require('fs');
const { execSync } = require('child_process');

// 1. Get original page.tsx
const originalPage = execSync('git show 0010d8c:src/app/page.tsx', { encoding: 'utf-8' });
const lines = originalPage.split('\n');

const components = [
  { name: 'Hero', start: 9, end: 159 },
  { name: 'About', start: 161, end: 681 },
  { name: 'Expertise', start: 683, end: 1049 },
  { name: 'Services', start: 1051, end: 1416 },
  { name: 'Testimonials', start: 1418, end: 1971 },
  { name: 'Contact', start: 1973, end: 2324 },
  { name: 'Footer', start: 2326, end: 2453 }
];

for (const comp of components) {
  let compLines = lines.slice(comp.start - 1, comp.end);
  // remove key props
  compLines = compLines.filter(line => !line.match(/^\s*key="\d+"\s*$/));
  
  const content = `export default function ${comp.name}() {
  return (
    <>
${compLines.join('\n')}
    </>
  );
}
`;
  fs.writeFileSync(`src/components/layout/${comp.name}.tsx`, content);
}

// Write new page.tsx wrapper
const pageContent = `import Hero from '@/components/layout/Hero';
import About from '@/components/layout/About';
import Expertise from '@/components/layout/Expertise';
import Services from '@/components/layout/Services';
import Testimonials from '@/components/layout/Testimonials';
import Contact from '@/components/layout/Contact';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main className="relative w-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-light)', paddingBottom: '35px' }}>
      <Hero />
      <About />
      <Expertise />
      <Services />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
`;
fs.writeFileSync('src/app/page.tsx', pageContent);

// 2. Replace colors in ALL layout components (NO SVG EXTRACTION)
const colorsMap = {
  '#100f0d': 'var(--color-dark)',
  '#ffffff': 'var(--color-white)',
  '#191919': 'var(--color-text-muted)',
  '#29282e': 'var(--color-text-primary)',
  '#000000': 'var(--color-black)',
  '#a68d26': 'var(--color-brand-primary)',
  '#b39d3f': 'var(--color-brand-secondary)',
  '#8e7d32': 'var(--color-brand-dark)',
  '#606060': 'var(--color-text-secondary)',
  '#fffbe8': 'var(--color-bg-light)',
  '#F7E2D6': 'var(--color-bg-light)' // fixing the main background
};

const componentsDir = 'src/components/layout';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = `${componentsDir}/${file}`;
  let content = fs.readFileSync(filePath, 'utf-8');

  for (const [hex, cssVar] of Object.entries(colorsMap)) {
    const regex = new RegExp(hex, 'gi');
    content = content.replace(regex, cssVar);
  }

  fs.writeFileSync(filePath, content);
}

console.log('Restored inline SVGs and injected color variables!');
