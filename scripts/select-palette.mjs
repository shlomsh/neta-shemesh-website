import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const file = path.join(root, 'src/app/globals.css');
const css = readFileSync(file, 'utf8');
const imports = [...css.matchAll(/@import "\.\/palettes\/([\w-]+)\.css";/g)];
if (imports.length !== 1) throw new Error('Expected exactly one palette import in globals.css');

const presets = readdirSync(path.join(root, 'src/app/palettes'))
  .filter((name) => /^[\w-]+\.css$/.test(name))
  .map((name) => name.slice(0, -4));
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`Selected: ${imports[0][1]}\nAvailable: ${presets.join(', ')}\nSelect: npm run palette -- <name>`);
} else {
  const [name] = args;
  if (args.length !== 1 || !presets.includes(name)) {
    throw new Error(`Unknown palette. Choose one of: ${presets.join(', ')}`);
  }
  writeFileSync(file, css.replace(imports[0][0], `@import "./palettes/${name}.css";`));
  await import('./generate-brand-logo.mjs');
  console.log(`Selected ${name}; regenerated palette-colored wordmarks.`);
}
