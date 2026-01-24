import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');
const entryFile = path.join(distDir, 'index.js');

if (!existsSync(entryFile)) {
  throw new Error(
    'Missing dist/index.js. Run `npm run build:lib` before the consumer smoke test.'
  );
}

const radf = await import(pathToFileURL(entryFile));

const requiredExports = [
  'DashboardProvider',
  'useDashboardActions',
  'useDashboardState',
  'dashboardSelectors',
  'buildQuerySpec',
  'DataProvider',
  'registerCharts',
  'registerInsights',
  'GridLayout',
  'Panel',
  'VizRenderer',
  'createDataset',
  'createDimension',
  'createMetric',
];

const missingExports = requiredExports.filter((key) => !(key in radf));
if (missingExports.length > 0) {
  throw new Error(
    `Missing exports from dist build: ${missingExports.join(', ')}`
  );
}

const collectCssFiles = async (dir) => {
  const results = [];
  if (!existsSync(dir)) {
    return results;
  }
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectCssFiles(fullPath);
      results.push(...nested);
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      results.push(fullPath);
    }
  }
  return results;
};

const cssFiles = await collectCssFiles(distDir);
if (cssFiles.length === 0) {
  throw new Error('No CSS assets emitted in dist/. Styles are not bundled.');
}

console.log('Consumer smoke test passed.');
console.log(`Found ${cssFiles.length} CSS asset(s).`);
