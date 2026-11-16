import { StrictMode } from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BlogAnalytics } from '@/components/blog/BlogAnalytics';
import { SITE } from '@/content/site';

const gtag = vi.fn();
let visibility: DocumentVisibilityState;

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
function setVisibility(value: DocumentVisibilityState) {
  visibility = value;
  fireEvent(document, new Event('visibilitychange'));
}
const events = () => gtag.mock.calls.map((call) => [call[1], call[2].article_id]);

beforeEach(() => {
  vi.useFakeTimers();
  gtag.mockClear();
  window.gtag = gtag;
  visibility = 'visible';
  vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility);
});

afterEach(() => {
  delete window.gtag;
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('GA4 article tracking', () => {
  it('sends one view and exactly one read at the 10-second boundary, even under StrictMode', () => {
    render(<StrictMode><BlogAnalytics slug="first-post" /></StrictMode>);
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'blog_view', {
      send_to: SITE.ga4MeasurementId, page_path: '/', article_id: 'first-post',
    });
    advance(9_999);
    expect(events()).toEqual([['blog_view', 'first-post']]);
    advance(1);
    expect(events()).toEqual([['blog_view', 'first-post'], ['blog_read_10s', 'first-post']]);
    advance(30_000);
    setVisibility('hidden');
    setVisibility('visible');
    advance(10_000);
    expect(gtag).toHaveBeenCalledTimes(2);
  });

  it('accumulates only visible time and never starts a hidden tab timer', () => {
    visibility = 'hidden';
    render(<BlogAnalytics slug="first-post" />);
    advance(20_000);
    expect(events()).toEqual([['blog_view', 'first-post']]);
    setVisibility('visible');
    advance(4_000);
    setVisibility('hidden');
    advance(60_000);
    expect(gtag).toHaveBeenCalledTimes(1);
    setVisibility('visible');
    advance(5_999);
    expect(gtag).toHaveBeenCalledTimes(1);
    advance(1);
    expect(events().at(-1)).toEqual(['blog_read_10s', 'first-post']);
  });

  it('starts fresh per route visit and cancels the previous article timer', () => {
    const { rerender, unmount } = render(<BlogAnalytics slug="first-post" />);
    advance(6_000);
    rerender(<BlogAnalytics slug="second-post" />);
    advance(4_000);
    expect(events()).toEqual([['blog_view', 'first-post'], ['blog_view', 'second-post']]);
    advance(6_000);
    rerender(<BlogAnalytics slug="first-post" />);
    advance(9_999);
    expect(events()).toEqual([
      ['blog_view', 'first-post'], ['blog_view', 'second-post'],
      ['blog_read_10s', 'second-post'], ['blog_view', 'first-post'],
    ]);
    unmount();
    advance(30_000);
    expect(gtag).toHaveBeenCalledTimes(4);
  });

  it('excludes time in the back-forward cache and resumes on pageshow', () => {
    render(<BlogAnalytics slug="first-post" />);
    advance(4_000);
    fireEvent(window, new Event('pagehide'));
    advance(60_000);
    expect(gtag).toHaveBeenCalledTimes(1);
    fireEvent(window, new Event('pageshow'));
    advance(6_000);
    expect(events()).toEqual([['blog_view', 'first-post'], ['blog_read_10s', 'first-post']]);
  });
});
