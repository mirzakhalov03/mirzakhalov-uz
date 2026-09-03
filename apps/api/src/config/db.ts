import mongoose from 'mongoose';
import { env, isDevelopment } from './env.js';

/**
 * Unknown fields must never persist (Technical PRD §11.3). `strict: 'throw'`
 * turns a silent drop into a visible error, which is what you want while the
 * schemas are still moving.
 */
mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);
if (isDevelopment) mongoose.set('debug', false);

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });

  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error', err);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
}

/** 1 = connected. Used by GET /health. */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
