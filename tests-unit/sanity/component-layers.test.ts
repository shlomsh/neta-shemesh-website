// @vitest-environment node
/**
 * SANITY E: the dependency direction between the component folders (src/components/README.md).
 *
 *   content -> lib -> primitives, motion -> site -> sections, blog -> app
 *
 * Each layer may import from the layers before it, never after. primitives and motion are
 * siblings (primitives may use motion, e.g. Photo uses ScrollReveal; motion never uses primitives),
 * and sections and blog are siblings (neither imports the other, and no section imports another
 * section: a section folder is a self-contained unit that page.tsx composes).
 *
 * History: Photo (a primitive) imported two components from `components/ui`, a folder that also held
 * a site widget (ContactFAB) and the footer lived in `layout/` although the shell in `site/` renders
 * it; nothing stopped the folders from importing each other in circles.
 */
import { dirname, posix } from 'node:path';
import { describe, expect, it } from 'vitest';
import { expectNone, readSources } from './helpers';

export type Layer = 'content' | 'lib' | 'primitives' | 'motion' | 'site' | 'sections' | 'blog' | 'app';

/** layer -> the layers it may import from (itself is always allowed, except `sections`, see below). */
export const MAY_IMPORT: Record<Layer, readonly Layer[]> = {
  content: [],
  lib: ['content'],
  primitives: ['lib', 'motion'], // content-agnostic: no `content` import
  motion: ['lib'],
  site: ['content', 'lib', 'primitives', 'motion'],
  sections: ['content', 'lib', 'primitives', 'motion', 'site'],
  blog: ['content', 'lib', 'primitives', 'motion', 'site'],
  app: ['content', 'lib', 'primitives', 'motion', 'site', 'sections', 'blog'],
};

/** `src/components/sections/hero/Hero.tsx` -> { layer: 'sections', unit: 'hero' }; null outside the known folders. */
export function placeOf(srcPath: string): { layer: Layer; unit: string } | null {
  const parts = srcPath.replace(/^src\//, '').split('/');
  if (parts[0] === 'components') {
    const layer = parts[1] as Layer;
    return layer in MAY_IMPORT ? { layer, unit: layer === 'sections' ? parts[2] : '' } : null;
  }
  if (parts[0] === 'content' || parts[0] === 'lib' || parts[0] === 'app') return { layer: parts[0], unit: '' };
  return null;
}

/** The src-relative path (no extension) an import specifier points at, or null for a package import. */
export function resolveImport(fromPath: string, spec: string): string | null {
  if (spec.startsWith('@/')) return 'src/' + spec.slice(2);
  if (spec.startsWith('.')) return posix.normalize(posix.join(dirname(fromPath), spec));
  return null;
}

export interface Violation {
  file: string;
  import: string;
  why: string;
}

/** Pure form (unit-testable with fake files). */
export function layerViolations(files: { path: string; text: string }[]): Violation[] {
  const out: Violation[] = [];
  for (const f of files) {
    const from = placeOf(f.path);
    if (!from) continue;
    for (const m of f.text.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
      const target = resolveImport(f.path, m[1]);
      if (!target) continue;
      const to = placeOf(target);
      if (!to) continue;
      if (to.layer === from.layer) {
        if (from.layer === 'sections' && to.unit !== from.unit) {
          out.push({ file: f.path, import: m[1], why: `section "${from.unit}" imports section "${to.unit}" (sections are independent units)` });
        }
        continue;
      }
      if (!MAY_IMPORT[from.layer].includes(to.layer)) {
        out.push({ file: f.path, import: m[1], why: `${from.layer} must not import ${to.layer}` });
      }
    }
  }
  return out;
}

describe('E1: component folders only import in one direction', () => {
  it('positive control: the checker flags upward and sideways imports and spares allowed ones', () => {
    const v = layerViolations([
      { path: 'src/components/primitives/ui/Photo.tsx', text: "import { ScrollReveal } from '@/components/motion/ScrollReveal';" },
      { path: 'src/components/primitives/ui/Bad.tsx', text: "import { SITE } from '@/content/site';" },
      { path: 'src/components/motion/Bad.tsx', text: "import { Photo } from '../primitives/ui/Photo';" },
      { path: 'src/components/site/Bad.tsx', text: "import { Hero } from '@/components/sections/hero/Hero';" },
      { path: 'src/components/sections/hero/Hero.tsx', text: "import { SiteNav } from '@/components/site/SiteNav';\nimport { X } from './HeroContent';" },
      { path: 'src/components/sections/hero/Bad.tsx', text: "import { Intro } from '../intro/Intro';" },
      { path: 'src/components/blog/Bad.tsx', text: "import { Hero } from '@/components/sections/hero/Hero';" },
      { path: 'src/lib/Bad.ts', text: "import { Section } from '@/components/primitives/layout/Section';" },
      { path: 'src/content/Bad.ts', text: "import { cx } from '@/lib/cx';" },
      { path: 'src/components/sections/hero/Pkg.tsx', text: "import Link from 'next/link';" },
    ]);
    expect(v.map((x) => x.file.split('/').pop())).toEqual(['Bad.tsx', 'Bad.tsx', 'Bad.tsx', 'Bad.tsx', 'Bad.tsx', 'Bad.ts', 'Bad.ts']);
    expect(v.map((x) => x.why)).toEqual([
      'primitives must not import content',
      'motion must not import primitives',
      'site must not import sections',
      'section "hero" imports section "intro" (sections are independent units)',
      'blog must not import sections',
      'lib must not import primitives',
      'content must not import lib',
    ]);
  });

  it('placeOf maps the real folders and ignores the rest', () => {
    expect(placeOf('src/components/sections/cta-band/CtaBand.tsx')).toEqual({ layer: 'sections', unit: 'cta-band' });
    expect(placeOf('src/components/site/footer/Footer.tsx')).toEqual({ layer: 'site', unit: '' });
    expect(placeOf('src/components/mystery/X.tsx')).toBeNull();
    expect(placeOf('src/proxy.ts')).toBeNull();
  });

  it('the real src tree has no upward, sideways or circular folder import', () => {
    const files = readSources().filter((f) => /\.tsx?$/.test(f.name));
    expectNone(
      layerViolations(files).map((v) => `${v.file}: from '${v.import}' (${v.why})`),
      'import against the layer direction (content -> lib -> primitives, motion -> site -> sections, blog -> app)',
    );
  });

  it('every folder under src/components is a known layer (a new top-level folder needs a row in MAY_IMPORT and the README)', () => {
    const top = new Set(readSources().filter((f) => f.path.startsWith('src/components/')).map((f) => f.path.split('/')[2]));
    expect([...top].filter((d) => !(d in MAY_IMPORT)).sort()).toEqual([]);
  });
});
