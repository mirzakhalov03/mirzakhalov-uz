import MarkdownIt from 'markdown-it';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import type { TocEntry } from '@portfolio/shared';

/**
 * Markdown is rendered and sanitised at WRITE time (Technical PRD §5.2), so the
 * stored `bodyHtml` is a guarantee rather than a per-request hope. If this
 * configuration ever loosens, only posts saved afterwards are affected — and
 * the stored HTML can be diffed to find them.
 *
 * `html: false` neutralises raw HTML in the source — it never becomes a live
 * element, so an event handler has nothing to attach to. markdown-it's own
 * `validateLink` separately rejects dangerous schemes (`javascript:`,
 * `vbscript:`, `data:`, …) in markdown link syntax before a `<a>` is ever
 * emitted. DOMPurify *is* reached by real input, though: eighteen adversarial
 * inputs run through the actual pipeline showed it modifying output on two of
 * them (stripping a `class` attribute markdown-it generated from a fence info
 * string containing markup, and rewriting entity-escaped text in an
 * image-alt breakout attempt). Neither was a live script — `html: false` and
 * `validateLink` had already neutralised the dangerous part upstream — so it
 * has simply never had to stop one. It stays as defence-in-depth against
 * config drift: a future `html: true`, or a plugin (footnotes, tables, attrs)
 * that emits markup the two guards above don't cover. That is the scenario
 * where it earns its keep. Technical PRD §5.2 requires sanitising regardless.
 */
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

const { window } = new JSDOM('');
const purify = createDOMPurify(window as unknown as Window & typeof globalThis);

/** External links open in a new tab and must not leak `window.opener`. */
purify.addHook('afterSanitizeAttributes', (node) => {
  if (!(node instanceof window.HTMLAnchorElement)) return;
  const href = node.getAttribute('href') ?? '';
  if (/^https?:\/\//i.test(href)) {
    node.setAttribute('rel', 'noopener noreferrer');
    node.setAttribute('target', '_blank');
  }
});

const WORDS_PER_MINUTE = 200;
const MIN_TOC_DEPTH = 2;
const MAX_TOC_DEPTH = 4;

/** Lowercase, hyphenated, punctuation-free. Unicode letters survive (Uzbek posts). */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Words in the prose, with code removed — a fenced block inflates a word count
 * without being read at prose speed.
 */
export function countWords(markdown: string): number {
  const prose = markdown.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');
  return prose.split(/\s+/).filter(Boolean).length;
}

export interface RenderedMarkdown {
  html: string;
  toc: TocEntry[];
  readingMinutes: number;
}

/**
 * One pass over the token stream produces both the heading anchors and the
 * table of contents — rendering first and re-parsing the HTML for a TOC would
 * do the same work twice.
 */
export function renderMarkdown(source: string): RenderedMarkdown {
  const env = {};
  const tokens = md.parse(source, env);
  const toc: TocEntry[] = [];
  const seen = new Map<string, number>();

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token?.type !== 'heading_open') continue;

    const depth = Number(token.tag.slice(1));
    if (depth < MIN_TOC_DEPTH || depth > MAX_TOC_DEPTH) continue;

    const text = tokens[i + 1]?.content ?? '';
    const base = slugifyHeading(text) || `section-${toc.length + 1}`;
    const used = seen.get(base) ?? 0;
    seen.set(base, used + 1);
    const id = used === 0 ? base : `${base}-${used}`;

    token.attrSet('id', id);
    toc.push({ id, text, depth });
  }

  const html = purify.sanitize(md.renderer.render(tokens, md.options, env));

  return {
    html,
    toc,
    readingMinutes: Math.max(1, Math.ceil(countWords(source) / WORDS_PER_MINUTE)),
  };
}
