import type { ProjectHighlight, ProjectTag } from '@portfolio/shared';

export type { ProjectHighlight, ProjectTag };

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
  /** The card line, where `summary` is the paragraph. See the shared schema. */
  tagline?: Bilingual;
  /** Max three, one per kind — what a ProjectCard leads with. */
  highlights?: ProjectHighlight[];
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

export type MediaLink = { label: string; url: string };

/**
 * Press, an interview, a talk — coverage from somewhere else, linked out to.
 * One mention can have been shared in more than one place (a LinkedIn post
 * and a Telegram post about the same piece), so it carries a list rather
 * than a single url — MediaMentionCard renders one destination differently
 * from several.
 */
export type MediaMention = {
  slug: string;
  title: string;
  /** Who published it — the account or org the post/photo lives under. */
  by: string;
  excerpt: string;
  links: MediaLink[];
  /** Unset renders a placeholder — filled in once a real image exists. */
  thumbnail?: { url: string; alt: string };
};

/** One entry in the portrait grid. `featured` takes the large cell. */
export type Photo = {
  /** Unset renders a placeholder — filled in once a real image exists. */
  image?: { url: string; alt: string };
  featured?: boolean;
};

export type Social = { label: string; handle: string; url: string };
export type Language = { name: string; level: string; note?: string };
export type StackItem = { name: string; group: 'core' | 'ai' };

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
  /** Unset renders a placeholder — filled in once a real image exists. */
  image?: { url: string; alt: string };
};

/**
 * A certificate, or a score. Present `score` and it renders as a stat tile
 * instead of a feature card.
 */
export type Certificate = {
  name: string;
  issuer?: string;
  /** ISO 'YYYY' or 'YYYY-MM'. */
  issuedAt?: string;
  score?: CertificateScore;
  /** The issuer's own page for this certificate, if there is one to link to. */
  url?: string;
  /** Unset renders a placeholder — filled in once a real image exists. */
  image?: { url: string; alt: string };
  /** A short line under the name on a badge card (no `issuer` of its own). */
  detail?: string;
};

export type ExperienceEntry = {
  org: string;
  role: string;
  from: string;
  to: string | null;
  detail?: string;
  /** A short aside next to the org name, e.g. 'startup'. */
  note?: string;
  /** Unset renders a placeholder — filled in once a real logo exists. */
  image?: { url: string; alt: string };
};
