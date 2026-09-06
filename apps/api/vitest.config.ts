import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // All test files run in a single forked process (one Mongoose registry),
    // not one-worker-per-file. The mongoose.models.X ?? mongoose.model(...)
    // guards in each model are required because of this: without them,
    // loading the same model module from two test files in this shared
    // process throws OverwriteModelError.
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
    // Run tests sequentially so the in-memory MongoDB instance is stable.
    sequence: { concurrent: false },
    testTimeout: 30_000, // mongodb-memory-server can be slow on first download
    // beforeAll hooks start a MongoMemoryServer, connect, run syncIndexes(),
    // and in the admin suites bcrypt-hash at cost 12 plus a login round
    // trip. That's 3.5-4s idle and can exceed the 10s Vitest default under
    // load, so give hooks the same budget as tests.
    hookTimeout: 30_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/scripts/**'],
    },
  },
});
