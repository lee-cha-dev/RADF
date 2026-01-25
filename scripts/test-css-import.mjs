import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const consumerDir = join(root, 'examples', 'consumer-app');
const consumerPkgPath = join(consumerDir, 'package.json');

const run = (command, options = {}) =>
  execSync(command, { stdio: 'inherit', ...options });

run('npm run build:lib', { cwd: root });

const packResult = execSync('npm pack', { cwd: root, encoding: 'utf-8' }).trim();
const tarballName = packResult.split('\n').pop();
const tarballPath = join(root, tarballName);

if (!existsSync(tarballPath)) {
  throw new Error(`Expected tarball at ${tarballPath}`);
}

const originalPackageJson = readFileSync(consumerPkgPath, 'utf-8');
const consumerPackage = JSON.parse(originalPackageJson);
const relativeTarball = relative(consumerDir, tarballPath);

consumerPackage.dependencies = {
  ...consumerPackage.dependencies,
  radf: `file:${relativeTarball}`,
};

writeFileSync(consumerPkgPath, `${JSON.stringify(consumerPackage, null, 2)}\n`);

try {
  run('npm install', { cwd: consumerDir });
  run('npx @playwright/test test tests/css-import.spec.js', { cwd: root });
} finally {
  writeFileSync(consumerPkgPath, originalPackageJson);
}
