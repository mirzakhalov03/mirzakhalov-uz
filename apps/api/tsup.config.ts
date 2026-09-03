import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // @portfolio/shared ships TypeScript source, so it is bundled in rather than
  // resolved at runtime. Everything else stays external and comes from node_modules.
  noExternal: ['@portfolio/shared'],
});
