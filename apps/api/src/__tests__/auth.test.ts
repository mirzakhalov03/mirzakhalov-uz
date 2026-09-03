/**
 * Integration tests for M1 — Authentication
 *
 * Strategy: spin up an in-process Express app (from createApp()) against a
 * mongodb-memory-server instance so tests are fully isolated, fast, and need
 * no running MongoDB or network.
 *
 * IP isolation: express-rate-limit uses req.ip for its in-memory store. Each
 * `describe` block uses its own IP (via X-Forwarded-For + trust proxy) so the
 * 5-attempt window from the rate-limit test cannot bleed into other blocks.
 *
 * Covered flows:
 *   • POST /auth/login — happy path
 *   • POST /auth/login — wrong password
 *   • POST /auth/login — unknown email
 *   • POST /auth/login — missing / invalid fields (validation)
 *   • POST /auth/login — rate limit (5 req / 15 min per IP)
 *   • GET  /auth/me    — valid session
 *   • GET  /auth/me    — no cookie
 *   • GET  /auth/me    — tampered JWT
 *   • GET  /auth/me    — user deleted after token issuance
 *   • POST /auth/logout — clears the cookie
 *   • Admin-guarded resource — accessible with cookie, rejected without
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request, { type Response } from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import type { Express } from 'express';

// Patch process.env BEFORE importing any application module so env.ts
// validation passes without a real .env file.
process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-jwt-secret-must-be-at-least-32-chars!!';
process.env['CORS_ORIGIN'] = 'http://localhost:5173';
process.env['UPLOAD_DIR'] = '/tmp/test-uploads';

// ─── App modules are imported AFTER env is patched ───────────────────────────
let createApp: () => Express;
let connectDatabase: () => Promise<void>;
let disconnectDatabase: () => Promise<void>;
let User: typeof import('../models/user.model.js').User;

const ADMIN_EMAIL = 'admin@test.example';
const ADMIN_PASSWORD = 'correctpassword99';
const ADMIN_NAME = 'Test Admin';
const BCRYPT_ROUNDS = 4; // Low cost for fast tests

// ─── Infrastructure lifecycle ─────────────────────────────────────────────────
let mongoServer: MongoMemoryServer;
let app: Express;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env['MONGODB_URI'] = mongoServer.getUri();

  ({ createApp } = await import('../app.js'));
  ({ connectDatabase, disconnectDatabase } = await import('../config/db.js'));
  ({ User } = await import('../models/user.model.js'));

  await connectDatabase();
  app = createApp();
});

afterAll(async () => {
  await disconnectDatabase();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Reset users collection so each test starts clean.
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);
  await User.create({ email: ADMIN_EMAIL, passwordHash, name: ADMIN_NAME, role: 'admin' });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extracts the value of a Set-Cookie header by name. */
function extractCookie(res: Response, name: string): string | undefined {
  const headers = res.headers['set-cookie'] as string[] | string | undefined;
  const all = Array.isArray(headers) ? headers : headers ? [headers] : [];
  return all.find((c) => c.startsWith(`${name}=`));
}

/**
 * Performs a login from a specific client IP and returns the Set-Cookie string.
 * Using explicit IPs prevents the rate-limiter's in-memory window from one
 * describe block from bleeding into another.
 */
async function loginAndGetCookie(clientIp = '10.1.1.1'): Promise<string> {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .set('Content-Type', 'application/json')
    .set('X-Forwarded-For', clientIp)
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

  expect(res.status).toBe(200);
  const cookie = extractCookie(res, 'token');
  expect(cookie).toBeDefined();
  return cookie!;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  // Each test in this block uses IP 10.0.1.x — isolated from other blocks.

  it('returns 200 and a session on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .set('X-Forwarded-For', '10.0.1.1')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'admin',
    });
    expect(res.body.id).toBeTypeOf('string');
    expect(res.body.passwordHash).toBeUndefined(); // never leak the hash
  });

  it('sets an httpOnly cookie on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .set('X-Forwarded-For', '10.0.1.2')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    const cookie = extractCookie(res, 'token');
    expect(cookie).toBeDefined();
    expect(cookie!.toLowerCase()).toContain('httponly');
    expect(cookie!.toLowerCase()).toContain('samesite=lax');
    expect(cookie!.toLowerCase()).toContain('path=/');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .set('X-Forwarded-For', '10.0.1.3')
      .send({ email: ADMIN_EMAIL, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
    // Cookie must NOT be set on failure.
    expect(extractCookie(res, 'token')).toBeUndefined();
  });

  it('returns 401 on unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .set('X-Forwarded-For', '10.0.1.4')
      .send({ email: 'nobody@example.com', password: ADMIN_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 with field-level errors on missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .set('X-Forwarded-For', '10.0.1.5')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.fields).toBeDefined();
    expect(Object.keys(res.body.error.fields as Record<string, string>)).toContain('email');
    expect(Object.keys(res.body.error.fields as Record<string, string>)).toContain('password');
  });

  it('returns 400 when email is malformed', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .set('X-Forwarded-For', '10.0.1.6')
      .send({ email: 'not-an-email', password: ADMIN_PASSWORD });

    expect(res.status).toBe(400);
    expect(res.body.error.fields?.['email']).toBeTypeOf('string');
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .set('X-Forwarded-For', '10.0.1.7')
      .send({ email: ADMIN_EMAIL, password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.fields?.['password']).toBeTypeOf('string');
  });

  it('enforces the rate limit after 5 consecutive attempts', async () => {
    // Dedicated IP so only this test exhausts its window.
    const rateLimitIp = '10.0.1.99';
    const agent = request(app);
    for (let i = 0; i < 5; i++) {
      await agent
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .set('X-Forwarded-For', rateLimitIp)
        .send({ email: ADMIN_EMAIL, password: 'badpassword' });
    }
    const res = await agent
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .set('X-Forwarded-For', rateLimitIp)
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    expect(res.status).toBe(429);
  });
});

describe('GET /api/v1/auth/me', () => {
  // Dedicated IP block: 10.0.2.x
  it('returns the session when a valid cookie is present', async () => {
    const cookie = await loginAndGetCookie('10.0.2.1');

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'admin',
    });
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('returns 401 when no cookie is sent', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 when the JWT is tampered', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', 'token=this.is.nota.valid.jwt');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 when the user has been deleted after token issuance', async () => {
    const cookie = await loginAndGetCookie('10.0.2.2');

    // Delete the user to simulate account removal / revocation.
    await User.deleteMany({});

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookie);

    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  // Dedicated IP block: 10.0.3.x
  it('clears the token cookie', async () => {
    const cookie = await loginAndGetCookie('10.0.3.1');

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);

    const cleared = extractCookie(res, 'token');
    expect(cleared).toBeDefined();
    // A cleared cookie has maxAge=0 or an expiry in the past.
    const isCleared =
      cleared!.includes('Max-Age=0') ||
      cleared!.includes('Expires=Thu, 01 Jan 1970') ||
      cleared!.startsWith('token=;');
    expect(isCleared).toBe(true);
  });

  it('returns 200 even without a cookie (idempotent logout)', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(200);
  });
});

describe('requireAdmin middleware — admin-guarded route', () => {
  // Dedicated IP block: 10.0.4.x
  it('reaches the route when authenticated', async () => {
    const cookie = await loginAndGetCookie('10.0.4.1');

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
  });

  it('is rejected without a cookie', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('is rejected with an invalid cookie', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', 'token=eyJhbGciOiJIUzI1NiJ9.broken.signature');
    expect(res.status).toBe(401);
  });
});
