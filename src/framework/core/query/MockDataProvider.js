/**
 * @module core/query/MockDataProvider
 * @description Deterministic mock data provider for local development and demos.
 */

import { createDataProvider } from './DataProvider';

/**
 * @typedef {import('../docs/jsdocTypes').DataProvider} DataProvider
 * @typedef {import('../docs/jsdocTypes').QuerySpec} QuerySpec
 */

/**
 * Delay helper with abort support.
 *
 * @param {number} ms - The delay in milliseconds.
 * @param {AbortSignal} [signal] - Abort signal for canceling the delay.
 * @returns {Promise<void>} Resolves after the delay or rejects on abort.
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

/**
 * Create a deterministic PRNG from a seed.
 *
 * @param {number} seed - Seed integer.
 * @returns {function(): number} Random generator that returns a float in [0, 1).
 */
const mulberry32 = (seed) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Build a stable numeric seed from a query spec.
 *
 * @param {QuerySpec} querySpec - Query spec to hash.
 * @returns {number} Unsigned 32-bit seed.
 */
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

/**
 * Coerce a value to an array or return an empty array.
 *
 * @param {unknown} value - Candidate value.
 * @returns {Array} Array value or empty array.
 */
const ensureArray = (value) => (Array.isArray(value) ? value : []);

/**
 * Normalize time range input to a {start, end} object.
 *
 * @param {Array<string|Date>|{start?: string|Date, end?: string|Date}|null} range
 * @returns {{start: string|Date|null, end: string|Date|null}|null}
 */
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

/**
 * Parse a date-like value into a Date object.
 *
 * @param {string|Date|null} value - Date-like value.
 * @returns {Date|null} Parsed date or null when invalid.
 */
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

/**
 * Format a Date as YYYY-MM-DD.
 *
 * @param {Date} date - Date to format.
 * @returns {string} ISO date string without time.
 */
const formatDate = (date) => date.toISOString().slice(0, 10);

/**
 * Clamp a number between min and max.
 *
 * @param {number} value - Input value.
 * @param {number} min - Minimum allowed.
 * @param {number} max - Maximum allowed.
 * @returns {number} Clamped value.
 */
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Extract a date range from BETWEEN filters.
 *
 * @param {Array<Object>} filters - Filter list.
 * @returns {{start: string|null, end: string|null}|null} Range or null.
 */
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

/**
 * Resolve mock category values for a dimension id.
 *
 * @param {string} dimensionId - Dimension id.
 * @returns {string[]} Distinct dimension values.
 */
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

/**
 * Generate deterministic mock rows for a query spec.
 *
 * @param {Object} options
 * @param {string[]} options.measures - Measure ids to populate.
 * @param {string[]} options.dimensions - Dimension ids to include.
 * @param {{start: string|Date|null, end: string|Date|null}|null} options.timeRange - Optional date range.
 * @param {function(): number} options.random - Seeded random generator.
 * @returns {Array<Object>} Row list for mock results.
 */
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

/**
 * Execute the mock provider for a query spec.
 *
 * @param {QuerySpec} querySpec - Query spec to resolve.
 * @param {{signal?: AbortSignal}} [options] - Execution options.
 * @returns {Promise<{rows: Array<Object>, meta: Record<string, unknown>}>} Mock result.
 */
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
