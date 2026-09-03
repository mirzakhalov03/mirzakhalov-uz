import { Data } from '../../primitives/Data.js';
import { Chip } from '../ui/Chip.js';
import type { Note } from '../../content/types.js';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export function NoteRow({ note }: { note: Note }) {
  return (
    <article className="group border-b border-line py-3 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <Data tone="muted">
          <time dateTime={note.publishedAt}>{formatDate(note.publishedAt)}</time>
        </Data>
        <Data tone="muted">{note.readingMinutes} min</Data>
        <Chip tone={note.lang === 'uz' ? 'accent' : 'quiet'}>
          {note.lang === 'uz' ? 'Oʻzbekcha' : 'English'}
        </Chip>
      </div>

      <h3 className="t-h4 mt-1 text-fg transition-colors duration-[160ms] group-hover:text-accent-text">
        {note.title}
      </h3>
      <p className="prose-measure mt-1 text-body text-fg-muted">{note.excerpt}</p>
    </article>
  );
}
