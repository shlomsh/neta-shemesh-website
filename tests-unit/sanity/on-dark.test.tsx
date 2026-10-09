/**
 * SANITY: `.on-dark` and bare font variables (moved from the legacy colour-inheritance.test.tsx
 * and fonts.test.tsx, NS-20).
 *
 * `.on-dark` flips `--header-color` to cream for a title on a PHOTO band, which carries no
 * `data-bg-tone` of its own. On a toned section the title already follows the tone, so an
 * `on-dark` there is a hard-coded colour that silently fights the tone (and the contrast table).
 * So: only the photo bands (CTA band, footer) may use it, through SectionTitle's `onDark` /
 * SectionHeader's `onPhoto`, and only SectionTitle.tsx writes the literal class.
 *
 * Bare `font-[var(--font-x)]` is the other half: Tailwind cannot tell a font-family variable from a
 * weight there, so the class generates nothing. It must be `font-[family-name:var(--font-x)]`.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { classTokens, expectNone, hasClass, readSources, renderHome, type SourceFile } from './helpers';

/** `.on-dark` elements that sit inside a toned section (they should follow the tone instead). */
function onDarkInsideTone(root: ParentNode): string[] {
  return Array.from(root.querySelectorAll('.on-dark'))
    .filter((el) => el.closest('[data-bg-tone]'))
    .map((el) => `<${el.tagName.toLowerCase()} class="${classTokens(el).slice(0, 5).join(' ')}"> inside [data-bg-tone="${el.closest('[data-bg-tone]')!.getAttribute('data-bg-tone')}"]`);
}

/** Files that write the literal `on-dark` class, outside the allowed one. */
function strayOnDarkLiterals(files: Array<Pick<SourceFile, 'path' | 'name' | 'text'>>): string[] {
  return files
    .filter((f) => /\.tsx?$/.test(f.name) && f.name !== 'SectionTitle.tsx' && /(?<![\w-])on-dark(?![\w-])/.test(f.text))
    .map((f) => f.path);
}

/** Files that pass `onDark` to a SectionTitle or `onPhoto` to a SectionHeader/SectionSubtitle, outside the allowed ones. */
const ALLOWED_PHOTO_BAND = new Set(['CtaBand.tsx', 'Footer.tsx', 'SectionHeader.tsx']);
function strayPhotoBandProps(files: Array<Pick<SourceFile, 'path' | 'name' | 'text'>>): string[] {
  const re = /<(?:SectionTitle|SectionHeader|SectionSubtitle)\b[^>]*?\b(?:onDark|onPhoto)\b/;
  return files.filter((f) => /\.tsx$/.test(f.name) && !ALLOWED_PHOTO_BAND.has(f.name) && re.test(f.text)).map((f) => f.path);
}

/** Bare `font-[var(--font-*)]` (no `family-name:`) anywhere in a source text. */
function bareFontVar(text: string): string[] {
  return text.match(/font-\[var\(--font-[\w-]+\)\]/g) ?? [];
}

let home: HTMLElement;
beforeAll(async () => {
  home = await renderHome();
});

describe('on-dark is for photo bands only', () => {
  it('no .on-dark element on the home page sits inside a toned section', () => {
    expectNone(onDarkInsideTone(home), 'on-dark inside a toned section (let the title follow --header-color)');
  });

  it('the photo bands do use it (so the rule is not vacuous): the CTA band title and the footer tagline', () => {
    const users = Array.from(home.querySelectorAll('.on-dark'));
    expect(users.length, '.on-dark elements on the page').toBeGreaterThanOrEqual(2);
    expect(users.every((el) => !el.closest('[data-bg-tone]'))).toBe(true);
  });

  it('only SectionTitle.tsx writes the literal class, and only the photo bands pass onDark / onPhoto', () => {
    const files = readSources();
    expectNone(strayOnDarkLiterals(files), 'files hard-coding the on-dark class');
    expectNone(strayPhotoBandProps(files), 'files passing onDark / onPhoto to a title or header outside the photo bands');
  });

  it('controls: the checkers flag a toned on-dark title, a stray literal and a stray prop, and spare the bands', () => {
    const bad = document.createElement('div');
    bad.innerHTML = '<section data-bg-tone="cream"><h2 class="on-dark type-title">x</h2></section><footer><p class="on-dark">y</p></footer>';
    expect(onDarkInsideTone(bad)).toHaveLength(1);
    expect(hasClass(bad.querySelector('footer p'), 'on-dark')).toBe(true);

    const file = (name: string, text: string) => ({ path: `src/components/${name}`, name, text });
    expect(strayOnDarkLiterals([file('Intro.tsx', '<h2 className="on-dark type-title">')])).toHaveLength(1);
    expect(strayOnDarkLiterals([file('SectionTitle.tsx', "onDark && 'on-dark'"), file('x.tsx', 'no-on-darkness')])).toEqual([]);
    expect(strayPhotoBandProps([file('Gallery.tsx', '<SectionHeader\n  id="x"\n  onPhoto\n/>')])).toHaveLength(1);
    expect(strayPhotoBandProps([file('Gallery.tsx', '<CredentialsList onDark />'), file('CtaBand.tsx', '<SectionHeader onPhoto />')])).toEqual([]);
  });
});

describe('font family variables use the family-name: form', () => {
  it('no source file writes a bare font-[var(--font-*)] class', () => {
    const hits = readSources().filter((f) => /\.tsx?$/.test(f.name) && bareFontVar(f.text).length).map((f) => f.path);
    expectNone(hits, 'bare font-[var(--font-*)] (generates nothing: use font-[family-name:var(--font-*)])');
  });

  it('controls: flags the bare form, spares family-name:', () => {
    expect(bareFontVar('className="font-[var(--font-body)]"')).toEqual(['font-[var(--font-body)]']);
    expect(bareFontVar('className="font-[family-name:var(--font-body)]"')).toEqual([]);
  });
});
