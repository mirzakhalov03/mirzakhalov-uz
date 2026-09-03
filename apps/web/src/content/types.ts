import type { ProjectTag } from '@portfolio/shared';

export type { ProjectTag };

export type Bilingual = { en: string; uz?: string };

/**
 * A project as the *public* API returns it — that is, `projectInputSchema`
 * with `cover` already populated from an ObjectId into its asset. Mock content
 * is typed to this shape deliberately: when the API lands, `projects.ts`
 * changes from a constant to a query and no component notices.
 */
export type Project = {
  slug: string;
  title: string;
  year: number;
  summary: Bilingual;
  stack: string[];
  tags: ProjectTag[];
  links: { demo?: string; source?: string };
  cover: { url: string; alt: string } | null;
  featured: boolean;
  hasCaseStudy: boolean;
};

export type Note = {
  slug: string;
  title: string;
  lang: 'en' | 'uz';
  excerpt: string;
  publishedAt: string;
  readingMinutes: number;
};

export type Social = { label: string; handle: string; url: string };
export type Score = {
  label: string;
  value: number;
  scaleMin: number;
  scaleMax: number;
  display: string;
};
export type Language = { name: string; level: string; note?: string };
export type StackItem = { name: string; frequency: 'daily' | 'often' };
