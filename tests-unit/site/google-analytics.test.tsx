import { fireEvent, render, screen } from '@testing-library/react';
import Link from 'next/link';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GoogleAnalytics } from '@/components/site/GoogleAnalytics';
import { ContactFAB } from '@/components/site/ContactFAB';
import { SITE, telHref, waHref } from '@/content/site';

vi.mock('next/script', () => ({ default: () => null }));

const gtag = vi.fn();
const blockNavigation = (event: Event) => event.preventDefault();

beforeEach(() => {
  gtag.mockClear();
  window.gtag = gtag;
  document.addEventListener('click', blockNavigation, true);
  document.addEventListener('auxclick', blockNavigation, true);
});

afterEach(() => {
  delete window.gtag;
  document.removeEventListener('click', blockNavigation, true);
  document.removeEventListener('auxclick', blockNavigation, true);
});

describe('GA4 contact tracking', () => {
  it('tracks nested content in both real FAB links once, without sending contact details', () => {
    render(<><GoogleAnalytics /><ContactFAB /></>);
    fireEvent.click(screen.getByTestId('fab-phone').querySelector('span')!);
    fireEvent.click(screen.getByTestId('fab-whatsapp').querySelector('svg')!);

    expect(gtag.mock.calls).toEqual([
      ['event', 'phone_click', { send_to: SITE.ga4MeasurementId, page_path: '/' }],
      ['event', 'whatsapp_click', { send_to: SITE.ga4MeasurementId, page_path: '/' }],
    ]);
  });

  it('covers links added after mount and capture survives propagation being stopped', () => {
    const { rerender } = render(<GoogleAnalytics />);
    rerender(
      <>
        <GoogleAnalytics />
        <a href={telHref()} onClick={(event) => event.stopPropagation()}>call</a>
        <a href={waHref()}>message</a>
        <Link href="/blog">blog</Link>
        <a href="https://example.test/?next=wa.me">unrelated</a>
      </>,
    );
    fireEvent.click(screen.getByText('call'));
    fireEvent.click(screen.getByText('message'));
    fireEvent.click(screen.getByText('blog'));
    fireEvent.click(screen.getByText('unrelated'));
    expect(gtag.mock.calls.map((call) => call[1])).toEqual(['phone_click', 'whatsapp_click']);
  });

  it('supports middle-click without counting right-click or changing native navigation', () => {
    render(<><GoogleAnalytics /><a href={waHref()} target="_blank" rel="noopener noreferrer">message</a></>);
    const link = screen.getByText('message');
    const middleClick = new MouseEvent('auxclick', { bubbles: true, cancelable: true, button: 1 });
    document.removeEventListener('auxclick', blockNavigation, true);
    link.dispatchEvent(middleClick);
    expect(middleClick.defaultPrevented).toBe(false);
    fireEvent(link, new MouseEvent('auxclick', { bubbles: true, button: 2 }));
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(link.getAttribute('href')).toBe(waHref());
  });

  it('removes its delegated listeners on unmount', () => {
    const { unmount } = render(<GoogleAnalytics />);
    unmount();
    const link = document.createElement('a');
    link.href = telHref();
    document.body.append(link);
    fireEvent.click(link);
    expect(gtag).not.toHaveBeenCalled();
    link.remove();
  });
});
