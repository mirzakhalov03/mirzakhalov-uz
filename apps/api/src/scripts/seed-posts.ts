/**
 * Sample posts so the frontend has something to render before real content
 * exists. Idempotent: re-running replaces the same three slugs and leaves
 * anything else alone.
 *
 *   npm run seed:posts -w @portfolio/api
 */
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { Post } from '../models/post.model.js';

const SAMPLES = [
  {
    slug: 'why-this-site-was-rebuilt',
    title: 'Why this site was rebuilt',
    lang: 'en' as const,
    excerpt: 'The old portfolio was a single HTML file with a bot token in it.',
    tags: ['craft', 'process'],
    status: 'published' as const,
    publishedAt: new Date('2026-08-14T09:00:00.000Z'),
    body: `## The problem

Publishing anything meant editing HTML and pushing a commit. So nothing got published.

## What changed

Content now lives in MongoDB behind a small Express API, and the site reads from it.

### Uploads

Images and PDFs go through an upload endpoint instead of being committed to the repository.

### Writing

This post is markdown in a database. Rendering happens on the server, once, at save time.
`,
  },
  {
    slug: 'notes-on-typography',
    title: 'Notes on typography',
    lang: 'en' as const,
    excerpt: 'A measure of 66 characters, and why the default line height is wrong.',
    tags: ['craft'],
    status: 'published' as const,
    publishedAt: new Date('2026-08-28T09:00:00.000Z'),
    body: `## Measure

Somewhere near 66 characters per line is comfortable. Wider than that and the eye
loses the return sweep.

## Rhythm

Line height is a function of measure, not a constant.
`,
  },
  {
    slug: 'ish-jarayoni-haqida',
    title: 'Ish jarayoni haqida',
    lang: 'uz' as const,
    excerpt: 'Loyihalarni qanday boshlayman va nima uchun.',
    tags: ['process'],
    status: 'draft' as const,
    publishedAt: null,
    body: `## Boshlanishi

Har bir loyiha savol bilan boshlanadi.

## Jarayon

Keyin esa yozish va qayta yozish.
`,
  },
];

async function main(): Promise<void> {
  await connectDatabase();

  for (const sample of SAMPLES) {
    await Post.deleteOne({ slug: sample.slug });
    await Post.create(sample);
    console.log(`[seed] ${sample.status.padEnd(9)} ${sample.slug}`);
  }

  console.log(`[seed] ${SAMPLES.length} posts written`);
  await disconnectDatabase();
}

main().catch((err: unknown) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
