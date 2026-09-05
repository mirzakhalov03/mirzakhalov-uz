import mongoose, { type Document, Schema, type Types } from 'mongoose';
import { locale, publishStatus, type Locale, type PublishStatus, type TocEntry } from '@portfolio/shared';
import { renderMarkdown } from '../services/markdown.service.js';

/** Technical PRD §3.3. `bodyHtml`, `toc`, `readingMinutes` and `searchLang` are derived. */
export interface IPost extends Document {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  lang: Locale;
  excerpt: string;
  body: string;
  bodyHtml: string;
  toc: TocEntry[];
  readingMinutes: number;
  searchLang: 'english' | 'none';
  tags: string[];
  cover: Types.ObjectId | null;
  status: PublishStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const tocEntrySubSchema = new Schema<TocEntry>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    depth: { type: Number, required: true, min: 2, max: 4 },
  },
  { _id: false },
);

const postSchema = new Schema<IPost>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    lang: { type: String, enum: locale.options, required: true, default: 'en' },
    excerpt: { type: String, required: true, trim: true, maxlength: 400 },
    body: { type: String, required: true, maxlength: 100_000 },

    // Derived — see the pre-validate hook below. Never written by a client.
    bodyHtml: { type: String, default: '' },
    toc: { type: [tocEntrySubSchema], default: [] },
    readingMinutes: { type: Number, default: 1, min: 1 },
    searchLang: { type: String, enum: ['english', 'none'], default: 'none' },

    tags: { type: [String], default: [] },
    cover: { type: Schema.Types.ObjectId, ref: 'Asset', default: null },
    status: { type: String, enum: publishStatus.options, default: 'draft' },
    publishedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    // Unknown fields must never persist (Technical PRD §11.3).
    strict: true,
  },
);

/**
 * Every derived field is produced here, from one renderMarkdown() call, so
 * there is exactly one place where stored HTML can come from.
 */
postSchema.pre('validate', function (next) {
  if (this.isNew || this.isModified('body')) {
    const { html, toc, readingMinutes } = renderMarkdown(this.body);
    this.bodyHtml = html;
    this.toc = toc;
    this.readingMinutes = readingMinutes;
  }

  // MongoDB ships no Uzbek stemmer, so Uzbek posts opt out of stemming rather
  // than being stemmed by English rules (see the text index below).
  if (this.isNew || this.isModified('lang')) {
    this.searchLang = this.lang === 'en' ? 'english' : 'none';
  }

  // First publish stamps the date; an explicit value always wins, which is what
  // lets a post be backdated or scheduled. Unpublishing preserves it so
  // re-publishing does not silently jump the post to the top of the feed.
  if (this.status === 'published' && this.publishedAt === null) {
    this.publishedAt = new Date();
  }

  next();
});

// Technical PRD §3.3. Below a few hundred documents Mongo will scan faster than
// it will seek; these are declared because adding indexes to a populated
// production collection is the painful direction to travel.
postSchema.index({ status: 1, publishedAt: -1, _id: -1 });
postSchema.index({ status: 1, lang: 1, publishedAt: -1, _id: -1 });
postSchema.index({ status: 1, tags: 1, publishedAt: -1 });
postSchema.index({ updatedAt: -1, _id: -1 });
postSchema.index(
  { title: 'text', excerpt: 'text', body: 'text' },
  {
    name: 'post_text',
    weights: { title: 10, excerpt: 5, body: 1 },
    // Per-document stemming. This cannot be changed later without a full index
    // rebuild, which is why it is decided up front.
    language_override: 'searchLang',
    default_language: 'none',
  },
);

export const Post = mongoose.model<IPost>('Post', postSchema);
