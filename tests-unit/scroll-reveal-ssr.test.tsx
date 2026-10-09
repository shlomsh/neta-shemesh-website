/**
 * NS-13: ScrollReveal is a server component whose HTML hides nothing and is identical on the server and
 * the client (8fcd901: a render branch gave the server a different `style` than the client, and React does
 * not patch `style` on hydration).
 */
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act } from 'react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Footer } from '@/components/site/footer/Footer';

afterEach(() => cleanup());

const tree = (delay?: number) => (
  <ScrollReveal delay={delay} className="x y">
    <p>hi</p>
  </ScrollReveal>
);

describe('ScrollReveal SSR markup', () => {
  it('has no inline opacity or transform, with or without a delay', () => {
    for (const html of [renderToString(tree()), renderToString(tree(0.24)), renderToString(<Footer />)]) {
      expect(html).not.toMatch(/opacity/i);
      expect(html).not.toMatch(/transform/i);
      expect(html).not.toMatch(/translate\(/i);
    }
  });

  it('carries the delay only as the --reveal-delay custom property', () => {
    expect(renderToStaticMarkup(tree(0.24))).toBe(
      '<div data-reveal="io" class="x y" style="--reveal-delay:0.24s"><p>hi</p></div>',
    );
    expect(renderToStaticMarkup(tree())).toBe('<div data-reveal="io" class="x y"><p>hi</p></div>');
  });

  it('renders the same markup on the server and on the client', () => {
    for (const delay of [undefined, 0.36]) {
      // react-dom/server writes `style="--a:1s"`, the client DOM serialises `style="--a: 1s;"`: same style.
      const norm = (html: string) => html.replace(/style="([^"]*)"/g, (_, v: string) => `style="${v.replace(/\s|;$/g, '')}"`);
      const server = norm(renderToString(tree(delay)));
      const client = norm(render(tree(delay)).container.innerHTML);
      cleanup();
      expect(client).toBe(server);
    }
  });

  it('hydrates the server HTML without a mismatch warning', async () => {
    const errors: unknown[] = [];
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree(0.12));
    document.body.appendChild(container);
    await act(async () => {
      hydrateRoot(container, tree(0.12), { onRecoverableError: (e) => errors.push(e) });
    });
    expect(errors).toEqual([]);
    container.remove();
  });
});
