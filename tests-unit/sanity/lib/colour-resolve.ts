/**
 * Class-list -> colour resolver for the contrast matrix: what colour does text have, and what is behind it. jsdom has
 * no Tailwind CSS, so this reads every ancestor's classes against the `@theme` palette (base/mobile state only; limits
 * in sanity/README.md). Teach it a new colour syntax here (colourFromToken, foregroundOf, backdropOf) with a fixture.
 */
import { evalColour, colourEnv, compositeOver, hex2, type ColourEnv, type RGB, type RGBA } from './colour-math';
import { parseToneRules } from './css';
import { classTokens, hasClass } from './dom';

/** [variant, utility] of a class token; the variant chain is whatever precedes the last top-level ':' (outside [...] and (...)). */
export function splitVariant(token: string): { variant: string; util: string } {
  let depth = 0;
  let cut = -1;
  for (let i = 0; i < token.length; i++) {
    const ch = token[i];
    if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') depth--;
    else if (ch === ':' && depth === 0) cut = i;
  }
  return cut < 0 ? { variant: '', util: token } : { variant: token.slice(0, cut), util: token.slice(cut + 1) };
}

/** Class tokens that apply in the base state (no hover:/md:/focus-visible: ... prefix). */
export function baseTokens(el: Element): string[] {
  return classTokens(el).filter((t) => splitVariant(t).variant === '');
}

const NAMED_COLOUR = '(plum|mauve|blush|cream|white|black|whatsapp)';

export type ColourToken = { kind: 'inherit' } | { kind: 'colour'; value: RGBA } | { kind: 'unresolved'; token: string };

/**
 * Non-colour uses of `text-[...]` / `bg-[...]` / `text-(...)`: sizes, lengths, urls, images, gradients ...
 * Everything else that starts `text-[` / `bg-[` / `text-(` / `bg-(` or is `<named>/[...]` is a colour syntax:
 * if the resolver cannot evaluate it, it is reported as unresolved (a skipped text fails the matrix), never ignored.
 */
const NON_COLOUR_ARBITRARY = /^(?:\((?:length|percentage|position|size|url|image|angle|number):|\[(?:length|percentage|position|size|url|image|angle|number):|\[url\(|\[(?:\d|\.\d|calc\(|clamp\(|min\(|max\()|\[[^\]]*gradient\()/;

/** Interpret one base `text-*` / `bg-*` utility as a colour; null when it is not a colour utility at all (text-right, bg-cover, text-[14px] ...). */
function colourFromToken(prefix: 'text' | 'bg', token: string, env: ColourEnv): ColourToken | null {
  if (prefix === 'text' && (token === 'text-inherit' || token === 'text-current')) return { kind: 'inherit' };
  const named = token.match(new RegExp(`^${prefix}-${NAMED_COLOUR}(?:/(\\d+))?$`));
  if (named) {
    const c = env.palette[named[1] === 'white' ? 'white' : named[1]] ?? env.palette.cream;
    return { kind: 'colour', value: { ...c, a: named[2] === undefined ? 1 : Number(named[2]) / 100 } };
  }
  if (prefix === 'text' && token === 'text-transparent') return { kind: 'colour', value: { r: 0, g: 0, b: 0, a: 0 } };
  if (prefix === 'bg' && token === 'bg-transparent') return { kind: 'colour', value: { r: 0, g: 0, b: 0, a: 0 } };
  const unresolved: ColourToken = { kind: 'unresolved', token };
  // plum/[0.3], cream/[30%]: an arbitrary opacity modifier on a named colour
  if (new RegExp(`^${prefix}-${NAMED_COLOUR}/\\[`).test(token)) return unresolved;
  const rest = token.slice(prefix.length + 1);
  // Tailwind v4 shorthand: text-(--color-cream), bg-(--surface-veil), text-(color:--x)
  const short = rest.match(/^\((?:color:)?(--[\w-]+)\)$/);
  if (short) {
    const v = evalColour(`var(${short[1]})`, env);
    return v ? { kind: 'colour', value: v } : unresolved;
  }
  if (rest.startsWith('(')) return NON_COLOUR_ARBITRARY.test(rest) ? null : unresolved;
  if (rest.startsWith('[')) {
    if (NON_COLOUR_ARBITRARY.test(rest)) return null;
    const arb = rest.match(/^\[(?:color:)?(.+)\]$/);
    if (!arb) return unresolved; // e.g. text-[color:var(--c)]/50: modifier after the bracket
    const v = evalColour(arb[1], env);
    return v ? { kind: 'colour', value: v } : unresolved;
  }
  return null;
}

/** `--header-color` as seen by this element: its own/ancestor `.on-dark` (cream) or the nearest `[data-bg-tone]` rule. */
function headerColourAt(el: Element, env: ColourEnv = colourEnv()): RGBA {
  const tones = parseToneRules();
  for (let a: Element | null = el; a; a = a.parentElement) {
    if (hasClass(a, 'on-dark')) return { ...env.palette.cream, a: 1 };
    const tone = a.getAttribute('data-bg-tone');
    if (tone && tones[tone]?.header) return evalColour(tones[tone].header!, env) ?? { ...env.palette.plum, a: 1 };
  }
  return { ...env.palette.plum, a: 1 }; // :root { --header-color: var(--color-plum) }
}

function envAt(el: Element, base: ColourEnv): ColourEnv {
  const h = headerColourAt(el, base);
  return { palette: base.palette, vars: { ...base.vars, '--header-color': hex2(h) } };
}

function inlineStyleColour(el: Element, prop: 'color' | 'background-color', env: ColourEnv): RGBA | null {
  const style = el.getAttribute('style') ?? '';
  const m = style.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`));
  if (!m || m[1].trim() === 'currentColor' || m[1].trim() === 'transparent') return null;
  return evalColour(m[1], env);
}

export type Resolved<T> = { ok: true; value: T } | { ok: false; reason: string };

/** The text colour that applies to text directly inside `el` (before opacity). Translucent colours keep their alpha. */
export function foregroundOf(el: Element, base: ColourEnv = colourEnv()): Resolved<RGBA> {
  const tones = parseToneRules();
  for (let a: Element | null = el; a; a = a.parentElement) {
    const env = envAt(a, base);
    const inline = inlineStyleColour(a, 'color', env);
    if (inline) return { ok: true, value: inline };
    let inherit = false;
    for (const t of baseTokens(a)) {
      const c = colourFromToken('text', t, env);
      if (!c) continue;
      if (c.kind === 'unresolved') return { ok: false, reason: `unresolved text colour ${c.token}` };
      if (c.kind === 'inherit') inherit = true;
      else return { ok: true, value: c.value };
    }
    if (inherit) continue;
    const tone = a.getAttribute('data-bg-tone');
    if (tone && tones[tone]?.color) {
      const v = evalColour(tones[tone].color!, env);
      if (v) return { ok: true, value: v };
    }
  }
  return { ok: true, value: { ...base.palette.plum, a: 1 } }; // html { color: var(--color-plum) }
}

/** opacity contributed by `el` itself: opacity-60, opacity-[0.18], inline opacity:.5 (base state only). */
function ownOpacity(el: Element): number {
  let o = 1;
  for (const t of baseTokens(el)) {
    const m = t.match(/^opacity-(\d+)$/) ?? t.match(/^opacity-\[(0?\.\d+|1)\]$/);
    if (m) o *= m[0].includes('[') ? Number(m[1]) : Number(m[1]) / 100;
  }
  const inline = (el.getAttribute('style') ?? '').match(/(?:^|;)\s*opacity\s*:\s*([\d.]+)/);
  if (inline) o *= Number(inline[1]);
  return o;
}

/** An absolutely positioned element that covers its parent (`absolute inset-0`, or a next/image `fill`). */
function isCoverLayer(c: Element): boolean {
  const toks = baseTokens(c);
  const style = c.getAttribute('style') ?? '';
  const absolute = toks.includes('absolute') || /position:\s*absolute/.test(style);
  const cover = toks.includes('inset-0') || (/width:\s*100%/.test(style) && /height:\s*100%/.test(style));
  return absolute && cover;
}

/**
 * Group opacity on the backdrop supplier or above it fades text AND backdrop together against whatever is
 * behind that group (the backdrop of its parent). Folded into both colours, innermost group first. A group
 * whose parent backdrop is unknowable (a photo) is ignored, so the Expertise pill (`bg-mauve opacity-95`
 * over a photo) keeps its plain 2.26:1.
 */
export function composeGroupOpacity(fg: RGB, bg: RGB, supplier: Element | null, base: ColourEnv = colourEnv()): { fg: RGB; bg: RGB } {
  const mix = (behind: RGB, c: RGB, o: number): RGB => compositeOver({ ...c, a: o }, behind);
  for (let g: Element | null = supplier; g; g = g.parentElement) {
    const o = ownOpacity(g);
    if (o >= 0.999) continue;
    const behind = g.parentElement ? backdropOf(g.parentElement, base) : null;
    if (behind && !behind.ok) continue;
    const behindColour = behind && behind.ok ? behind.value.colour : base.palette.cream;
    fg = mix(behindColour, fg, o);
    bg = mix(behindColour, bg, o);
  }
  return { fg, bg };
}

/**
 * The effective backdrop behind text in `el`: walks up, stacking translucent backgrounds until an
 * opaque one. `faded` is the product of ancestor opacities strictly BELOW the element that supplied
 * the opaque backdrop (they fade the text but not that backdrop); `supplier` is that element, whose own
 * opacity and its ancestors' fade BOTH colours (see `composeGroupOpacity`). `photo` marks a top-level
 * section/footer with no tone and no background of its own: the backdrop is an image we cannot see.
 */
export function backdropOf(el: Element, base: ColourEnv = colourEnv()): Resolved<{ colour: RGB; faded: number; via: string; supplier: Element | null }> | { ok: false; photo: true; reason: string } {
  const tones = parseToneRules();
  const layers: RGBA[] = [];
  let faded = 1;
  for (let a: Element | null = el; a; a = a.parentElement) {
    const env = envAt(a, base);
    let opaque: RGB | null = null;
    let via = '';
    const inline = inlineStyleColour(a, 'background-color', env);
    const layersHere: RGBA[] = [];
    if (inline) layersHere.push(inline);
    for (const t of baseTokens(a)) {
      if (/^(?:bg-gradient|bg-linear|from-|via-|to-)/.test(t) && !t.startsWith('bg-[')) continue;
      const c = colourFromToken('bg', t, env);
      if (!c) continue;
      if (c.kind === 'unresolved') return { ok: false, reason: `unresolved background ${c.token}` };
      if (c.kind === 'colour') layersHere.push(c.value);
    }
    const tone = a.getAttribute('data-bg-tone');
    if (tone && tones[tone]?.bg) {
      const v = evalColour(tones[tone].bg!, env);
      if (v) layersHere.unshift(v);
    }
    // a tone paints before the element's own utilities; within one element the later layer sits on top.
    // `layers` is ordered nearest-to-the-text first, so this element's layers go in reverse.
    const local: RGBA[] = [];
    for (const l of layersHere) {
      if (l.a >= 0.999) {
        opaque = { r: l.r, g: l.g, b: l.b };
        via = tone ? `[data-bg-tone=${tone}]` : 'bg';
        local.length = 0;
      } else if (l.a > 0) local.push(l);
    }
    layers.push(...local.reverse());
    if (a.parentElement) {
      // a full-cover sibling painted behind the content: the hero's `absolute inset-0 bg-plum` field, or a photo.
      // A cover IMAGE wins even over this element's own bg (that bg is only the photo's fallback colour).
      for (const c of Array.from(a.children)) {
        if (c.contains(el) || !isCoverLayer(c)) continue;
        if (c.tagName === 'IMG' || c.querySelector('img')) {
          return { ok: false, photo: true, reason: `photo backdrop (full-cover image beside the text, in ${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''})` };
        }
        if (opaque) continue;
        const own = baseTokens(c).map((t) => colourFromToken('bg', t, envAt(c, base))).find((t) => t?.kind === 'colour' && t.value.a >= 0.999);
        if (own?.kind === 'colour') {
          opaque = { r: own.value.r, g: own.value.g, b: own.value.b };
          via = 'cover sibling bg';
        }
      }
    }
    if (opaque) {
      let colour = opaque;
      for (const l of layers.reverse()) colour = compositeOver(l, colour);
      return { ok: true, value: { colour, faded, via, supplier: a } };
    }
    // a top-level solid card without tone or bg paints nothing: a photo section (hero, CTA band, footer)
    if (a.parentElement?.tagName === 'MAIN' && /^(SECTION|FOOTER)$/.test(a.tagName)) {
      return { ok: false, photo: true, reason: `photo backdrop under ${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}` };
    }
    faded *= ownOpacity(a);
  }
  // reached <html>: the page background (html, body { background-color: cream })
  let colour: RGB = base.palette.cream;
  for (const l of layers.reverse()) colour = compositeOver(l, colour);
  return { ok: true, value: { colour, faded, via: 'page', supplier: null } };
}
