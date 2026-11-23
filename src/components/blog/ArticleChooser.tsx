'use client';

import { useState } from 'react';
import { Card } from '@/components/primitives/layout/Card';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { Photo } from '@/components/primitives/ui/Photo';
import { BLOG_PREVIEW } from '@/content/home/blog-preview';
import { cx } from '@/lib/cx';

export function ArticleChooser() {
  const { choices, recommendation } = BLOG_PREVIEW.chooser;
  const [selected, setSelected] = useState<(typeof choices)[number]>(choices[0]);

  return (
    <div className="mt-region flex flex-col gap-panel">
      <div className="flex flex-wrap justify-center gap-3" role="group" aria-label={BLOG_PREVIEW.chooser.title}>
        {choices.map((choice) => (
          <button
            key={choice.post.slug}
            type="button"
            aria-pressed={selected === choice}
            onClick={() => setSelected(choice)}
            className={cx(
              'type-lead min-h-12 rounded-full border border-plum px-6 py-3 font-bold focus-ring focus-visible:ring-plum focus-visible:ring-offset-2',
              selected === choice ? 'bg-plum text-cream' : 'bg-cream text-plum hover:bg-blush',
            )}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <Card surface="cream" pad="lg" className="grid gap-panel border border-plum/20 lg:grid-cols-2">
        <Photo src={selected.post.coverImage} alt={selected.post.coverAlt} radius="tile" ratio="100/58" sizes="(min-width: 1024px) 40vw, 85vw" />
        <div aria-live="polite" aria-atomic="true" className="flex flex-col items-start justify-center gap-stack">
          <span className="type-eyebrow">{recommendation}</span>
          <h3 className="type-card-title font-bold">{selected.post.title}</h3>
          <p className="type-lead max-w-prose">{selected.post.excerpt}</p>
          <span className="type-small">{selected.post.readTime}</span>
          <ButtonLink size="sm" href={`/blog/${selected.post.slug}`}>{BLOG_PREVIEW.read}</ButtonLink>
        </div>
      </Card>
    </div>
  );
}
