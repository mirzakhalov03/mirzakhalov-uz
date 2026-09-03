/**
 * Seed script — creates or updates the single admin user.
 * Run once after provisioning:
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=supersecret npm run seed:admin
 *
 * Safe to re-run: uses upsert, so the email is never duplicated.
 * Remove ADMIN_EMAIL / ADMIN_PASSWORD from .env after first run (Technical PRD §9).
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Import env AFTER dotenv/config so the file is populated.
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'Admin';

if (!MONGODB_URI) {
  console.error('[seed] MONGODB_URI is required');
  process.exit(1);
}
if (!ADMIN_EMAIL) {
  console.error('[seed] ADMIN_EMAIL is required');
  process.exit(1);
}
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  console.error('[seed] ADMIN_PASSWORD is required and must be at least 12 characters');
  process.exit(1);
}

// ─── bcrypt cost 12, per Technical PRD §6 ────────────────────────────────────
const BCRYPT_ROUNDS = 12;

async function seed(): Promise<void> {
  console.log('[seed] connecting to MongoDB …');
  await mongoose.connect(MONGODB_URI as string);

  // Define a minimal schema inline so the script is self-contained and doesn't
  // pull in the full app's model graph (which would require all env vars).
  const userSchema = new mongoose.Schema(
    {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      passwordHash: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, default: 'admin' },
      lastLoginAt: { type: Date, default: null },
    },
    { timestamps: true, strict: true },
  );

  // Use getModel so the script is idempotent if the model is already registered.
  const User =
    mongoose.models['User'] ??
    mongoose.model('User', userSchema);

  const email = (ADMIN_EMAIL as string).toLowerCase().trim();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD as string, BCRYPT_ROUNDS);

  const result = await (User as unknown as mongoose.Model<{ email: string; name: string; role: string; passwordHash: string }>).findOneAndUpdate(
    { email },
    { email, passwordHash, name: ADMIN_NAME, role: 'admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log(`[seed] admin upserted: ${result?.email ?? '?'}`);
  console.log('[seed] ⚠️  Remove ADMIN_EMAIL and ADMIN_PASSWORD from .env now.');

  await mongoose.connection.close();
  console.log('[seed] done');
}

seed().catch((err: unknown) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
