import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'finance-smoke.spec.js',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4174',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4174',
    cwd: './examples/finance-app',
    port: 4174,
    reuseExistingServer: true,
  },
});
