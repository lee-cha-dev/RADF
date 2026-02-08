import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
    globals: true,
    css: true,
    exclude: ['tests/**'],
    include: [
      'src/framework/__tests__/**/*.test.js',
      'examples/lazy-dashboards/src/**/__tests__/**/*.test.js',
    ],
  },
});
