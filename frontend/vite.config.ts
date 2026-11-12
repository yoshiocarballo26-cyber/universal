import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const frontendDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // GitHub Pages project URL: https://yoshiocarballo26-cyber.github.io/universal/
  base: '/universal/',
  define: {
    // Placeholder only. Never place a real API key in frontend code.
    'process.env.API_KEY': JSON.stringify('api-key-not-used'),
  },
  server: {
    proxy: {
      '/api-proxy': 'http://localhost:5000',
      '/ws-proxy': { target: 'ws://localhost:5000', ws: true },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(frontendDir, '.'),
    },
  },
});
