import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const run = (command, options = {}) =>
  execSync(command, { stdio: 'pipe', encoding: 'utf-8', ...options });

const root = process.cwd();

const packOutput = run('npm pack --dry-run', { cwd: root });
const hasIndex = packOutput.includes('dist/index.js');
const hasStyles = packOutput.includes('dist/styles.css');

if (!hasIndex || !hasStyles) {
  throw new Error(
    `npm pack missing expected files: dist/index.js=${hasIndex} dist/styles.css=${hasStyles}`
  );
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
if (pkg.name !== 'radf') {
  throw new Error(`package name must be radf (found ${pkg.name})`);
}

console.log('smoke-consumer: pack output includes dist assets');
