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
export type Language = { name: string; level: string; note?: string };
export type StackItem = { name: string; frequency: 'daily' | 'often' };

/** A value against a stated scale — 1330 means nothing without 400–1600 (§3.6). */
export type CertificateScore = {
  value: number;
  scaleMin: number;
  scaleMax: number;
  display: string;
};

export type EducationEntry = {
  org: string;
  qualification?: string;
  /** ISO 'YYYY' or 'YYYY-MM'. */
  from: string;
  /** null means ongoing. */
  to: string | null;
  detail?: string;
  /** The one entry that takes the full-width lead card. */
  lead?: boolean;
};

/**
 * A certificate, or a score. Present `score` and the row is drawn as a
 * DimensionRow against its scale rather than as a card — §2 principle 8: a
 * score means more with a date and a scale.
 */
export type Certificate = {
  name: string;
  issuer?: string;
  /** ISO 'YYYY' or 'YYYY-MM'. */
  issuedAt?: string;
  score?: CertificateScore;
};

export type ExperienceEntry = {
  org: string;
  role: string;
  from: string;
  to: string | null;
  detail?: string;
};
