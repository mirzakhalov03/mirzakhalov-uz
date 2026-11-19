import { Fragment } from 'react';
import { Data } from '../../primitives/Data.js';
import { Plate } from '../../primitives/Plate.js';
import { ImagePlaceholder } from '../ui/ImagePlaceholder.js';
import type { MediaLink, MediaMention } from '../../content/types.js';

/**
 * One destination reads "Read more on X" — the old single-link phrasing.
 * More than one has no single "the" link to be, so each named source gets
 * its own anchor instead, comma-separated after a plain "Read more —".
 */
function ReadMoreLinks({ links }: { links: MediaLink[] }) {
  if (links.length === 0) return null;

  if (links.length === 1) {
    const link = links[0];
    if (!link) return null;
    return (
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="w-fit">
        <Data tone="accent">Read more on {link.label} ↗</Data>
      </a>
    );
  }

  return (
    <Data tone="accent">
      Read more —{' '}
      {links.map((link, i) => (
        <Fragment key={link.label}>
          {i > 0 ? ', ' : ''}
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {link.label}
          </a>
        </Fragment>
      ))}
    </Data>
  );
}

/**
 * A horizontal link card out to coverage published elsewhere. The card
 * itself isn't a link any more — with more than one destination there's no
 * single "the" link for a whole-card click to mean, so each named source
 * (LinkedIn, Telegram, ...) is its own anchor. Title and description sit at
 * the top; the links row is pushed to the bottom of the card via
 * `justify-between` regardless of how many lines the excerpt takes, rather
 * than trailing right after it.
 */
export function MediaMentionCard({ mention }: { mention: MediaMention }) {
  return (
    <Plate
      as="article"
      marks={false}
      className="flex flex-col gap-2.5 rounded-frame p-2.5 sm:flex-row sm:items-start"
    >
      <div className="aspect-square w-full shrink-0 overflow-hidden rounded-frame border border-line bg-well sm:w-20">
        {mention.thumbnail ? (
          <img
            src={mention.thumbnail.url}
            alt={mention.thumbnail.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <ImagePlaceholder label="" className="h-full w-full" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
        <div className="flex flex-col gap-1">
          <h3 className="t-h4 text-fg">{mention.title}</h3>
          <Data>{mention.by}</Data>
          <p className="prose-measure line-clamp-2 text-caption text-fg-muted">{mention.excerpt}</p>
        </div>

        <ReadMoreLinks links={mention.links} />
      </div>
    </Plate>
  );
}
