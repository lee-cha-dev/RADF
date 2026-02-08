import optionCoverageMatrix from './optionCoverageMatrix.json';
import { listVizManifests } from './vizManifest.js';

const normalizeOptionPath = (path) =>
  typeof path === 'string' ? path.replace(/^options\./, '') : '';

const buildManifestOptionSet = (manifest) =>
  new Set(
    Object.entries(manifest?.options || {}).map(
      ([key, schema]) => schema.path || key
    )
  );

export const validateManifestCoverage = () => {
  const manifestById = new Map(
    listVizManifests().map((manifest) => [manifest.id, manifest])
  );
  const entries = optionCoverageMatrix.options || [];
  const errors = [];
  entries.forEach((entry) => {
    if (entry.status !== 'supported') {
      return;
    }
    const manifest = manifestById.get(entry.vizType);
    if (!manifest || manifest.supportLevel !== 'supported') {
      return;
    }
    const supportedPaths = buildManifestOptionSet(manifest);
    const normalized = normalizeOptionPath(entry.optionPath);
    if (normalized && !supportedPaths.has(normalized)) {
      errors.push(
        `Missing option "${entry.optionPath}" in ${entry.vizType} manifest.`
      );
    }
  });
  return {
    isValid: errors.length === 0,
    errors,
  };
};
