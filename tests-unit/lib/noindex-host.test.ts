/**
 * NS-21: the noindex host guard. Any build not pointed at the production domain (a preview deploy,
 * a tunnel) must ship `robots: noindex, nofollow`; the production host must not.
 * The guard is decided at module load from NEXT_PUBLIC_SITE_URL, so each case re-imports with a stubbed env.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

// next/font/local needs the Next compiler; the layout only reads `.variable` from each font here.
vi.mock('@/app/fonts', () => new Proxy({}, { get: () => ({ variable: 'f', className: 'f' }) }));

async function loadWith(siteUrl: string | undefined) {
  vi.resetModules();
  if (siteUrl === undefined) vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined as unknown as string);
  else vi.stubEnv('NEXT_PUBLIC_SITE_URL', siteUrl);
  const site = await import('@/content/site');
  const layout = await import('@/app/layout');
  return { site, metadata: layout.metadata };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('noindex host guard', () => {
  it('production host (default URL): no robots directive, canonical on the production domain', async () => {
    const { site, metadata } = await loadWith(undefined);
    expect(site.SITE.url).toBe(site.PRODUCTION_URL);
    expect(site.IS_PRODUCTION_HOST).toBe(true);
    expect(metadata.robots).toBeUndefined();
    expect(metadata.alternates?.canonical).toBe(site.PRODUCTION_URL);
  });

  it('explicit production URL is still production', async () => {
    const { site, metadata } = await loadWith('https://www.netashemesh.co.il');
    expect(site.IS_PRODUCTION_HOST).toBe(true);
    expect(metadata.robots).toBeUndefined();
  });

  it.each([
    'https://preview-abc123.vercel.app',
    'https://staging.example.test',
    'http://localhost:3000',
    'https://netashemesh.co.il', // apex without www is not the canonical production host
    'https://www.netashemesh.co.il/', // trailing slash is a different string: fail safe to noindex
  ])('non-production host %s gets noindex, nofollow', async (url) => {
    const { site, metadata } = await loadWith(url);
    expect(site.IS_PRODUCTION_HOST).toBe(false);
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('a staging host still self-canonicalises to its own URL (so noindex and canonical agree)', async () => {
    const { metadata } = await loadWith('https://preview.example.test');
    expect(metadata.alternates?.canonical).toBe('https://preview.example.test');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('robots.txt does not Disallow the site (crawlable + noindex is what de-indexes)', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const txt = readFileSync(resolve(__dirname, '../../public/robots.txt'), 'utf8');
    expect(txt).not.toMatch(/^\s*Disallow:\s*\/\s*$/m);
    expect(txt).toMatch(/^Sitemap:\s*https:\/\/www\.netashemesh\.co\.il\/sitemap\.xml/m);
  });
});
