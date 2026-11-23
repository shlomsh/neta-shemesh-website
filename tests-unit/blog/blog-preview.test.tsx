import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BlogPreviewPage from '@/app/preview/blog/[option]/page';
import { ArticleChooser } from '@/components/blog/ArticleChooser';
import { HeroArticlePreview } from '@/components/blog/BlogSpotlight';
import { BLOG_PREVIEW } from '@/content/home/blog-preview';
import { ID, PREVIEW_ID } from '@/content/ids';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('local blog comparisons', () => {
  it('updates the recommended article and destination for every topic, including switching back', () => {
    render(<ArticleChooser />);
    const choices = BLOG_PREVIEW.chooser.choices;
    for (const choice of [choices[1], choices[2], choices[0]]) {
      fireEvent.click(screen.getByRole('button', { name: choice.label }));
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(choice.post.title);
      expect(screen.getByRole('link', { name: BLOG_PREVIEW.read })).toHaveAttribute('href', `/blog/${choice.post.slug}`);
      for (const button of choices) {
        expect(screen.getByRole('button', { name: button.label })).toHaveAttribute('aria-pressed', String(button === choice));
      }
    }
  });

  it('keeps the hero teaser in the first section and the contextual teaser after expertise', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const hero = render(await BlogPreviewPage({ params: Promise.resolve({ option: 'hero' }) }));
    const firstSection = hero.container.querySelector<HTMLElement>('main > section');
    expect(firstSection).not.toBeNull();
    const [first] = BLOG_PREVIEW.hero.slides;
    const heroContent = within(firstSection!);
    const carousel = heroContent.getByRole('region', { name: BLOG_PREVIEW.eyebrow });
    expect(heroContent.getByTestId('hero-art').compareDocumentPosition(carousel)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(within(carousel).getByRole('link', { name: first.hook })).toHaveAttribute('href', `/blog/${first.post.slug}`);
    hero.unmount();

    const quote = render(await BlogPreviewPage({ params: Promise.resolve({ option: 'quote' }) }));
    const sections = [...quote.container.querySelectorAll('main > section')];
    const spotlightIndex = sections.findIndex((section) => section.id === PREVIEW_ID.blogSpotlight);
    expect(spotlightIndex).toBe(3);
    expect(sections[spotlightIndex - 1].querySelector(`#${ID.expertiseTitle}`)).toBeInTheDocument();
  });

  it('rejects unknown preview names instead of silently choosing an option', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    await expect(BlogPreviewPage({ params: Promise.resolve({ option: 'unknown' }) })).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
  });

  it('does not expose previews in a production deployment', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    await expect(BlogPreviewPage({ params: Promise.resolve({ option: 'hero' }) })).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
  });

  it('exposes only the hero comparison on Vercel Preview', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'preview');
    render(await BlogPreviewPage({ params: Promise.resolve({ option: 'hero' }) }));
    expect(screen.getByRole('region', { name: BLOG_PREVIEW.eyebrow })).toBeInTheDocument();
    await expect(BlogPreviewPage({ params: Promise.resolve({ option: 'editorial' }) })).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
  });
});

describe('homepage article rotation', () => {
  const { slides, all, previous, next, pause, play } = BLOG_PREVIEW.hero;

  it('advances at five seconds and loops back after the last article', () => {
    vi.useFakeTimers();
    render(<HeroArticlePreview />);
    act(() => vi.advanceTimersByTime(4_999));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(slides[0].hook);
    expect(screen.getByRole('img', { name: slides[0].post.coverAlt })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    for (const slide of [...slides.slice(1), slides[0]]) {
      expect(screen.getByRole('link', { name: slide.hook })).toHaveAttribute('href', `/blog/${slide.post.slug}`);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(slide.hook);
      expect(screen.getByRole('img', { name: slide.post.coverAlt })).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(5_000));
    }
  });

  it('wraps with both arrows, keeps one all-articles link, and can be paused', () => {
    vi.useFakeTimers();
    render(<HeroArticlePreview />);
    fireEvent.click(screen.getByRole('button', { name: previous }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(slides[4].hook);
    fireEvent.click(screen.getByRole('button', { name: next }));
    expect(screen.getByRole('link', { name: all })).toHaveAttribute('href', '/blog');
    fireEvent.click(screen.getByRole('button', { name: pause }));
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(slides[0].hook);
    fireEvent.click(screen.getByRole('button', { name: play }));
    act(() => vi.advanceTimersByTime(5_000));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(slides[1].hook);
  });

  it('keeps manual navigation when reduced motion disables autoplay', () => {
    vi.useFakeTimers();
    const matchMedia = window.matchMedia;
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({ ...matchMedia(query), matches: true }));
    render(<HeroArticlePreview />);
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(slides[0].hook);
    fireEvent.click(screen.getByRole('button', { name: next }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(slides[1].hook);
  });
});
