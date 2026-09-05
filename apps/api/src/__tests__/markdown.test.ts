/**
 * Unit tests for the render pipeline. No database, no HTTP — renderMarkdown is
 * a pure function and is tested as one.
 */
import { describe, expect, it } from 'vitest';

process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-jwt-secret-must-be-at-least-32-chars!!';
process.env['MONGODB_URI'] = 'mongodb://127.0.0.1:27017/unused';
process.env['CORS_ORIGIN'] = 'http://localhost:5173';
process.env['UPLOAD_DIR'] = '/tmp/test-uploads';

const { renderMarkdown, slugifyHeading, countWords } = await import(
  '../services/markdown.service.js'
);

describe('renderMarkdown', () => {
  it('renders markdown to html', () => {
    expect(renderMarkdown('A *note*.').html).toContain('<em>note</em>');
  });

  it('escapes raw html in the source rather than parsing it', () => {
    const { html } = renderMarkdown('<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('renders raw html as inert text, so an event handler never becomes a live attribute', () => {
    const { html } = renderMarkdown('<img src=x onerror="alert(1)">');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });

  it('neutralises a javascript: URL in markdown link syntax before it can become a live href', () => {
    const { html } = renderMarkdown('[click](javascript:alert(1))');
    expect(html).not.toMatch(/href=["']javascript:/i);
  });

  it('adds rel="noopener noreferrer" to external links', () => {
    const { html } = renderMarkdown('[out](https://example.com)');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('leaves relative links without a target', () => {
    const { html } = renderMarkdown('[in](/writing/hello)');
    expect(html).not.toContain('target="_blank"');
  });

  it('collects h2–h4 into a table of contents and injects matching ids', () => {
    const { html, toc } = renderMarkdown('## First\n\n### Second\n\n# Title\n');
    expect(toc).toEqual([
      { id: 'first', text: 'First', depth: 2 },
      { id: 'second', text: 'Second', depth: 3 },
    ]);
    expect(html).toContain('id="first"');
    expect(html).toContain('id="second"');
  });

  it('disambiguates duplicate heading slugs', () => {
    const { toc } = renderMarkdown('## Setup\n\n## Setup\n\n## Setup\n');
    expect(toc.map((t) => t.id)).toEqual(['setup', 'setup-1', 'setup-2']);
  });

  it('falls back to a positional id for a heading that slugifies to nothing', () => {
    const { toc } = renderMarkdown('## ???\n');
    expect(toc[0]?.id).toBe('section-1');
  });

  it('reports at least one reading minute for any post', () => {
    expect(renderMarkdown('Hi.').readingMinutes).toBe(1);
  });

  it('counts roughly 200 words per minute', () => {
    const source = Array.from({ length: 600 }, () => 'word').join(' ');
    expect(renderMarkdown(source).readingMinutes).toBe(3);
  });

  it('excludes fenced code from the reading time', () => {
    const code = ['```ts', ...Array.from({ length: 600 }, () => 'const x = 1;'), '```'].join('\n');
    expect(renderMarkdown(`Short intro.\n\n${code}`).readingMinutes).toBe(1);
  });

  it('emits a language class on fenced code so the client can highlight it', () => {
    expect(renderMarkdown('```ts\nconst a = 1;\n```').html).toContain('language-ts');
  });
});

describe('slugifyHeading', () => {
  it('lowercases and hyphenates', () => {
    expect(slugifyHeading('Hello There World')).toBe('hello-there-world');
  });

  it('drops punctuation but keeps non-latin letters', () => {
    expect(slugifyHeading('Salom, dunyo!')).toBe('salom-dunyo');
  });

  it('returns an empty string when nothing survives', () => {
    expect(slugifyHeading('!!!')).toBe('');
  });
});

describe('countWords', () => {
  it('ignores inline code spans', () => {
    expect(countWords('one `two three` four')).toBe(2);
  });
});
