import mongoose, { type Document, type Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * The single admin user. Created via `npm run seed:admin`; there is no
 * registration endpoint (Technical PRD §3.1 and §6).
 */
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin';
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  /** Returns true when `plain` matches the stored hash. */
  comparePassword(plain: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  /** Look up by email. Returns null, not a throw, on miss. */
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin'], default: 'admin' as const },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    // Unknown fields must never persist (Technical PRD §11.3).
    strict: true,
  },
);

/**
 * Verify a plain-text password against the stored hash.
 * bcrypt cost 12, per Technical PRD §6.
 */
userSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash as string);
};

userSchema.statics.findByEmail = function (email: string): Promise<IUser | null> {
  return this.findOne({ email: email.toLowerCase().trim() }).exec();
};

// Never let passwordHash travel over the wire accidentally.
userSchema.set('toJSON', {
  transform(_doc, ret) {
    (ret as unknown as Record<string, unknown>)['passwordHash'] = undefined;
    return ret;
  },
});

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
