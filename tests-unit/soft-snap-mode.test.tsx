/**
 * The `?snap=off|v1|v2` toggle (NS-36): read once on mount from the query, remembered in
 * sessionStorage (so client navigation keeps it), default v1, `off` loads no engine. The engine is
 * replaced by a recorder here; its behaviour is covered by sanity/soft-snap.test.tsx and the pure
 * decision tests in soft-snap.test.ts.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { SoftSnap } from '@/components/motion/SoftSnap';

const seen = vi.hoisted(() => ({ modes: [] as Array<string | undefined> }));
vi.mock('@/components/motion/SoftSnapEngine', () => ({
  SoftSnapEngine: ({ mode }: { mode?: string }) => {
    seen.modes.push(mode);
    return null;
  },
}));

const KEY = 'snap-mode';

function desktop(matches = true) {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? false : matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })));
}

async function mountAt(search: string) {
  window.history.replaceState({}, '', `/${search}`);
  render(<SoftSnap />);
  await act(async () => {
    for (let i = 0; i < 10; i++) {
      await vi.dynamicImportSettled();
      await Promise.resolve();
    }
  });
}

describe('SoftSnap mode toggle', () => {
  beforeEach(() => {
    seen.modes = [];
    window.sessionStorage.clear();
    desktop();
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.history.replaceState({}, '', '/');
  });

  it('defaults to v1 with no param and nothing stored (production behaviour unchanged)', async () => {
    await mountAt('');
    expect(new Set(seen.modes)).toEqual(new Set(['v1']));
    expect(window.sessionStorage.getItem(KEY)).toBeNull();
  });

  it.each(['v1', 'v2'])('?snap=%s mounts the engine in that mode and remembers it', async (mode) => {
    await mountAt(`?snap=${mode}`);
    expect(new Set(seen.modes)).toEqual(new Set([mode]));
    expect(window.sessionStorage.getItem(KEY)).toBe(mode);
  });

  it('?snap=off mounts no engine and remembers off', async () => {
    await mountAt('?snap=off');
    expect(seen.modes).toEqual([]);
    expect(window.sessionStorage.getItem(KEY)).toBe('off');
  });

  it('keeps the remembered mode when the query is gone (client navigation back to the page)', async () => {
    window.sessionStorage.setItem(KEY, 'v2');
    await mountAt('');
    expect(new Set(seen.modes)).toEqual(new Set(['v2']));
  });

  it('a stored off survives navigation too', async () => {
    window.sessionStorage.setItem(KEY, 'off');
    await mountAt('');
    expect(seen.modes).toEqual([]);
  });

  it('the query beats what is stored', async () => {
    window.sessionStorage.setItem(KEY, 'off');
    await mountAt('?snap=v2');
    expect(new Set(seen.modes)).toEqual(new Set(['v2']));
    expect(window.sessionStorage.getItem(KEY)).toBe('v2');
  });

  it('an invalid query value is ignored (stored mode, else default) and not stored', async () => {
    await mountAt('?snap=bogus');
    expect(new Set(seen.modes)).toEqual(new Set(['v1']));
    expect(window.sessionStorage.getItem(KEY)).toBeNull();

    cleanup();
    seen.modes = [];
    window.sessionStorage.setItem(KEY, 'v2');
    await mountAt('?snap=V3');
    expect(new Set(seen.modes)).toEqual(new Set(['v2']));
  });

  it('works when sessionStorage throws: the query applies, otherwise the default', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    await mountAt('?snap=v2');
    expect(new Set(seen.modes)).toEqual(new Set(['v2']));

    cleanup();
    seen.modes = [];
    await mountAt('');
    expect(new Set(seen.modes)).toEqual(new Set(['v1']));
  });

  it('on a touch device (media does not match) no mode mounts an engine', async () => {
    desktop(false);
    for (const q of ['?snap=v1', '?snap=v2', '']) {
      cleanup();
      await mountAt(q);
    }
    expect(seen.modes).toEqual([]);
  });
});
