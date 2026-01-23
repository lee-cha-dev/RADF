import { getSeriesVar } from './paletteRegistry';

const DEFAULT_SERIES_COUNT = 12;

const normalizeKeys = (keys) => {
  if (!Array.isArray(keys)) {
    return [];
  }
  const seen = new Set();
  const ordered = [];
  keys.forEach((key) => {
    if (key == null) {
      return;
    }
    const normalized = String(key);
    if (seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    ordered.push(normalized);
  });
  return ordered;
};

export const getSeriesColor = (index, seriesCount = DEFAULT_SERIES_COUNT) =>
  getSeriesVar(index, seriesCount);

export const getSeriesColorsForKeys = (keys) => {
  const orderedKeys = normalizeKeys(keys);
  return orderedKeys.reduce((acc, key, index) => {
    acc[key] = getSeriesColor(index, DEFAULT_SERIES_COUNT);
    return acc;
  }, {});
};
