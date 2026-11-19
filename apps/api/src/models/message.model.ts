import mongoose, { type Document, type Model, Schema, type Types } from 'mongoose';

/**
 * Technical PRD §3.7. Telegram is the primary delivery; this is the backup, so
 * a Telegram outage never silently loses a message. `relayed` records which
 * ones still need reading from here.
 *
 * `ipHash`, never the raw IP — enough to spot one sender flooding the inbox,
 * not enough to identify anyone.
 */
export interface IMessage extends Document {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  message: string;
  ipHash: string;
  userAgent: string;
  relayed: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const messageModelSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, trim: true, maxlength: 254 },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    ipHash: { type: String, required: true },
    userAgent: { type: String, default: '', maxlength: 500 },
    relayed: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true, strict: true },
);

messageModelSchema.index({ createdAt: -1, _id: -1 });

// Idempotent registration — see asset.model.ts.
export const Message =
  (mongoose.models['Message'] as Model<IMessage> | undefined) ??
  mongoose.model<IMessage>('Message', messageModelSchema);
