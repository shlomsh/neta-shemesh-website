import * as fontkit from 'fontkit';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const root = fileURLToPath(new URL('../', import.meta.url));
const globals = readFileSync(path.join(root, 'src/app/globals.css'), 'utf8');
const imports = [...globals.matchAll(/@import "\.\/(palettes\/[\w-]+\.css)";/g)];
if (imports.length !== 1) throw new Error('Expected exactly one palette import in globals.css');
const palette = readFileSync(path.join(root, 'src/app', imports[0][1]), 'utf8');
const color = (name) => {
  const value = palette.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6});`, 'i'))?.[1];
  if (!value) throw new Error(`Palette is missing --color-${name}`);
  return value;
};
const font = fontkit.openSync(path.join(root, 'src/app/fonts/Elamy-Bold.woff2'));
const lines = ['מקום בטוח', 'לצמוח בו ביחד'];
const artwork = (lineStep) => lines.map((text, index) => {
  const run = font.layout(text);
  const box = run.bbox;
  const scale = Math.min(720 / (box.maxX - box.minX), 144 / (box.maxY - box.minY));
  let x = 0;
  let y = 0;
  const glyphs = run.glyphs.map((glyph, i) => {
    const position = run.positions[i];
    const element = `<path transform="translate(${x + position.xOffset} ${y + position.yOffset})" d="${glyph.path.toSVG()}"/>`;
    x += position.xAdvance;
    y += position.yAdvance;
    return element;
  }).join('');
  return `<g transform="translate(${735 - box.maxX * scale} ${8 + index * lineStep + box.maxY * scale}) scale(${scale} ${-scale})">${glyphs}</g>`;
}).join('');

const house = await sharp(path.join(root, 'public/images/logo-horizontal-light.webp'))
  .extract({ left: 768, top: 0, width: 305, height: 320 })
  .png()
  .toBuffer();

for (const [tone, fill] of [
  ['light', color('cream')],
  ['plum', color('plum')],
]) {
  for (const [suffix, lineStep] of [['', 160], ['-compact', 140]]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1073" height="320"><g fill="${fill}">${artwork(lineStep)}</g></svg>`;
    const alpha = await sharp(Buffer.from(svg))
      .composite([{ input: house, left: 768, top: 0 }])
      .ensureAlpha()
      .extractChannel('alpha')
      .raw()
      .toBuffer();
    // Apply the palette after rasterization to avoid premultiplied-alpha color rounding.
    await sharp({ create: { width: 1073, height: 320, channels: 3, background: fill } })
      .joinChannel(alpha, { raw: { width: 1073, height: 320, channels: 1 } })
      .webp({ lossless: true })
      .toFile(path.join(root, 'public/images', `logo-tagline-${tone}${suffix}.webp`));
  }
}
