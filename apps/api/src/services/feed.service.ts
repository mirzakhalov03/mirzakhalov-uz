import type { IPost } from '../models/post.model.js';

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ENTITIES[char] ?? char);
}

/**
 * Atom 1.0, hand-built — the whole format is five elements and a dependency
 * would not earn its place.
 *
 * A client-rendered SPA is effectively invisible to crawlers (Technical PRD
 * §13.4). A feed is the cheapest available mitigation.
 */
export function buildAtomFeed(
  posts: IPost[],
  options: { siteUrl: string; feedUrl: string; title?: string },
): string {
  const site = options.siteUrl.replace(/\/$/, '');
  const updated = posts[0]?.updatedAt ?? new Date();

  const entries = posts
    .map((post) => {
      const url = `${site}/writing/${post.slug}`;
      const published = (post.publishedAt ?? post.createdAt).toISOString();
      return `  <entry>
    <title>${escapeXml(post.title)}</title>
    <id>${escapeXml(url)}</id>
    <link rel="alternate" type="text/html" href="${escapeXml(url)}"/>
    <published>${published}</published>
    <updated>${post.updatedAt.toISOString()}</updated>
    <summary type="text">${escapeXml(post.excerpt)}</summary>
    <content type="html">${escapeXml(post.bodyHtml)}</content>
  </entry>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(options.title ?? 'Writing')}</title>
  <id>${escapeXml(options.feedUrl)}</id>
  <link rel="self" type="application/atom+xml" href="${escapeXml(options.feedUrl)}"/>
  <link rel="alternate" type="text/html" href="${escapeXml(`${site}/writing`)}"/>
  <updated>${updated.toISOString()}</updated>
${entries}
</feed>
`;
}
