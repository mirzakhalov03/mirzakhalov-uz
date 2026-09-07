import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: {
    port: 5173,
    // Fail loudly instead of silently drifting to 5174 — the API's CORS
    // allowlist is pinned to 5173, so a shifted port breaks every request.
    strictPort: true,
  },
  build: {
    // Surfaces regressions against the design doc's performance budget early.
    chunkSizeWarningLimit: 300,
  },
});
