/**
 * Class-list and text-node utilities for DOM assertions (no rule of its own). Used by every rendered-page test.
 */

export function classTokens(el: Element | null | undefined): string[] {
  return (el?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
}

export function hasClass(el: Element | null | undefined, token: string): boolean {
  return classTokens(el).includes(token);
}

/** The `.type-*` scale tokens on this element (and only this element). */
export function typeClassesOf(el: Element | null | undefined): string[] {
  return classTokens(el).filter((t) => /^type-[a-z-]+$/.test(t));
}

/** All text nodes with visible text under root (skips whitespace-only nodes). */
export function textNodes(root: Element): Text[] {
  const out: Text[] = [];
  const walker = root.ownerDocument.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  let node = walker.nextNode();
  while (node) {
    if ((node.textContent ?? '').trim()) out.push(node as Text);
    node = walker.nextNode();
  }
  return out;
}
