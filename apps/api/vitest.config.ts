import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Each test file gets its own isolated worker to prevent cross-test
    // Mongoose model registration conflicts.
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
    // Run tests sequentially so the in-memory MongoDB instance is stable.
    sequence: { concurrent: false },
    testTimeout: 30_000, // mongodb-memory-server can be slow on first download
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/scripts/**'],
    },
  },
});
