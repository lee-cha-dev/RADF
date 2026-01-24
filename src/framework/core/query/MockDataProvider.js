/**
 * @module core/query/MockDataProvider
 * @description Deterministic mock data provider for local development and demos.
 */

import { createDataProvider } from './DataProvider';

/**
 * @typedef {import('../docs/jsdocTypes').DataProvider} DataProvider
 */

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timeout = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeout);
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true }
      );
    }
  });

const mulberry32 = (seed) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const seedFromQuery = (querySpec) => {
  const base = JSON.stringify({
    datasetId: querySpec.datasetId,
    measures: querySpec.measures,
    dimensions: querySpec.dimensions,
    filters: querySpec.filters,
    grain: querySpec.grain,
    timeRange: querySpec.timeRange,
  });
  let hash = 2166136261;
  for (let i = 0; i < base.length; i += 1) {
    hash ^= base.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const normalizeTimeRange = (range) => {
  if (!range) {
    return null;
  }
  if (Array.isArray(range)) {
    return { start: range[0], end: range[1] };
  }
  if (range.start || range.end) {
    return { start: range.start ?? null, end: range.end ?? null };
  }
  return null;
};

const parseDate = (value) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const formatDate = (date) => date.toISOString().slice(0, 10);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const resolveTimeRangeFromFilters = (filters) => {
  const list = ensureArray(filters);
  const betweenFilter = list.find(
    (filter) =>
      filter &&
      filter.op === 'BETWEEN' &&
      Array.isArray(filter.values) &&
      filter.values.length >= 2 &&
      (filter.field?.includes('date') || filter.field?.includes('day'))
  );
  if (!betweenFilter) {
    return null;
  }
  const [start, end] = betweenFilter.values;
  if (!start && !end) {
    return null;
  }
  return { start: start ?? null, end: end ?? null };
};

const dimensionDefaults = {
  category: ['Alpha', 'Beta', 'Gamma', 'Delta'],
  region: ['North', 'South', 'East', 'West'],
  segment: ['Consumer', 'SMB', 'Enterprise'],
};

const getDimensionValues = (dimensionId) => {
  if (dimensionDefaults[dimensionId]) {
    return dimensionDefaults[dimensionId];
  }
  if (dimensionId?.includes('region')) {
    return dimensionDefaults.region;
  }
  if (dimensionId?.includes('segment')) {
    return dimensionDefaults.segment;
  }
  if (dimensionId?.includes('category')) {
    return dimensionDefaults.category;
  }
  const base = ['A', 'B', 'C', 'D'];
  return base.map((value, index) => `${dimensionId || 'dim'}-${value}${index + 1}`);
};

const generateRows = ({ measures, dimensions, timeRange, random }) => {
  const dimensionList = ensureArray(dimensions);
  if (!dimensionList.length) {
    return [
      measures.reduce((acc, measureId, index) => {
        acc[measureId] = Math.round(500 + random() * 500 + index * 40);
        return acc;
      }, {}),
    ];
  }

  const rows = [];
  const dimensionValues = dimensionList.map((dimensionId) => {
    if (dimensionId?.includes('date') || dimensionId?.includes('day')) {
      const normalized = normalizeTimeRange(timeRange);
      const start = parseDate(normalized?.start) ?? new Date(Date.now() - 6 * 86400000);
      const end = parseDate(normalized?.end) ?? new Date();
      const diff = clamp(Math.ceil((end - start) / 86400000) + 1, 2, 14);
      return Array.from({ length: diff }, (_, idx) => {
        const date = new Date(start);
        date.setDate(date.getDate() + idx);
        return formatDate(date);
      });
    }
    return getDimensionValues(dimensionId);
  });

  const buildRow = (depth, base) => {
    if (depth >= dimensionList.length) {
      const row = { ...base };
      measures.forEach((measureId, index) => {
        const noise = random() * 0.3 + 0.85;
        row[measureId] = Math.round(200 * noise + index * 50 + random() * 120);
      });
      rows.push(row);
      return;
    }
    const dimensionId = dimensionList[depth];
    dimensionValues[depth].forEach((value, idx) => {
      buildRow(depth + 1, {
        ...base,
        [dimensionId]: value,
        [`${dimensionId}_order`]: idx,
      });
    });
  };

  buildRow(0, {});
  return rows;
};

const mockExecute = async (querySpec, { signal } = {}) => {
  const seed = seedFromQuery(querySpec);
  const random = mulberry32(seed);
  const latency = 180 + Math.floor(random() * 220);
  await wait(latency, signal);

  const measures = ensureArray(querySpec.measures);
  const dimensions = ensureArray(querySpec.dimensions);
  const timeRange =
    normalizeTimeRange(querySpec.timeRange) ??
    resolveTimeRangeFromFilters(querySpec.filters);
  const rows = generateRows({
    measures,
    dimensions,
    timeRange,
    random,
  });

  const total = rows.reduce((acc, row) => {
    measures.forEach((measureId) => {
      acc[measureId] = (acc[measureId] || 0) + (row[measureId] || 0);
    });
    return acc;
  }, {});

  return {
    rows,
    meta: {
      total,
      rowCount: rows.length,
      generatedAt: new Date().toISOString(),
    },
  };
};

/**
 * Mock provider that generates deterministic, pseudo-random rows based on the
 * query spec. Useful for demos and layout testing when a backend is missing.
 *
 * @type {DataProvider}
 */
export const MockDataProvider = createDataProvider(mockExecute);
