import { fireEvent, render, screen } from '@testing-library/react';
import Link from 'next/link';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '@/app/page';
import { GoogleAnalytics } from '@/components/site/GoogleAnalytics';
import { HomeSectionAnalytics } from '@/components/site/HomeSectionAnalytics';
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

  describe('GA4 homepage screen tracking', () => {
    class Observer {
      static latest: Observer;
      observed = new Set<Element>();

      constructor(private callback: IntersectionObserverCallback, readonly options: IntersectionObserverInit) {
        Observer.latest = this;
      }

      observe(target: Element) { this.observed.add(target); }
      unobserve(target: Element) { this.observed.delete(target); }
      disconnect() { this.observed.clear(); }

      report(target: Element, isIntersecting: boolean) {
        this.callback([{ target, isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
      }
    }

    beforeEach(() => {
      vi.stubGlobal('IntersectionObserver', Observer);
      vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(800);
      vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it('tracks all rendered home screens once and gives no credit to skipped screens', () => {
      const { unmount } = render(<StrictMode><Home /><HomeSectionAnalytics /></StrictMode>);
      const observer = Observer.latest;
      const screens = [...observer.observed];
      expect(screens.map((element) => element.id || element.tagName)).toEqual([
        'hero', 'about-me-section', 'SECTION', 'faq-section',
        'about-credentials', 'services', 'contact-office', 'FOOTER',
      ]);
      expect(observer.options.rootMargin).toBe('-400px 0px -399px 0px');

      observer.report(screens[0], true);
      observer.report(screens[1], false);
      observer.report(screens[2], true);
      observer.report(screens[0], true);
      observer.report(screens[7], true);
      expect(gtag.mock.calls).toEqual(['hero', 'expertise', 'footer'].map((section_id) => [
        'event', 'home_section_view', { send_to: SITE.ga4MeasurementId, page_path: '/', section_id },
      ]));

      unmount();
      expect(observer.observed.size).toBe(0);
      observer.report(screens[1], true);
      expect(gtag).toHaveBeenCalledTimes(3);
    });

    it('does not count hidden tabs and resumes for uncounted screens only', () => {
      const visibility = vi.mocked(Object.getOwnPropertyDescriptor(document, 'visibilityState')!.get!);
      render(<><main id="main"><section id="hero" /><section id="about-me-section" /></main><HomeSectionAnalytics /></>);
      const original = Observer.latest;
      const [hero, about] = [...original.observed];
      original.report(hero, true);

      visibility.mockReturnValue('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      original.report(about, true);
      expect(gtag).toHaveBeenCalledTimes(1);

      visibility.mockReturnValue('visible');
      document.dispatchEvent(new Event('visibilitychange'));
      expect([...Observer.latest.observed]).toEqual([about]);
      Observer.latest.report(about, true);
      expect(gtag).toHaveBeenCalledTimes(2);
    });
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
