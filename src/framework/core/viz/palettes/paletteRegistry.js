/**
 * @module core/viz/palettes/paletteRegistry
 * @description Palette metadata and CSS variable helpers for chart coloring.
 */
const DEFAULT_PALETTE_ID = 'analytics';
const DEFAULT_SERIES_COUNT = 12;
const SEQUENTIAL_STEPS = 9;
const DIVERGING_STEPS = 4;

/**
 * Palette catalog metadata.
 * @type {Array<{id: string, label: string, seriesCount: number, hasSequential: boolean, hasDiverging: boolean}>}
 */
export const PALETTES = [
  {
    id: 'analytics',
    label: 'Default Analytics',
    seriesCount: DEFAULT_SERIES_COUNT,
    hasSequential: true,
    hasDiverging: true,
  },
  {
    id: 'tableau10',
    label: 'Tableau 10',
    seriesCount: DEFAULT_SERIES_COUNT,
    hasSequential: true,
    hasDiverging: true,
  },
  {
    id: 'set2',
    label: 'ColorBrewer Set2',
    seriesCount: DEFAULT_SERIES_COUNT,
    hasSequential: true,
    hasDiverging: true,
  },
  {
    id: 'dark2',
    label: 'ColorBrewer Dark2',
    seriesCount: DEFAULT_SERIES_COUNT,
    hasSequential: true,
    hasDiverging: true,
  },
  {
    id: 'okabe-ito',
    label: 'Okabe-Ito',
    seriesCount: DEFAULT_SERIES_COUNT,
    hasSequential: true,
    hasDiverging: true,
  },
  {
    id: 'viridis',
    label: 'Viridis',
    seriesCount: DEFAULT_SERIES_COUNT,
    hasSequential: true,
    hasDiverging: true,
  },
  {
    id: 'rdylgn',
    label: 'RdYlGn',
    seriesCount: DEFAULT_SERIES_COUNT,
    hasSequential: true,
    hasDiverging: true,
  },
];

/**
 * Resolve the CSS class for a palette id.
 * @param {string} [id] - Palette id.
 * @returns {string} CSS class name.
 */
export const getPaletteClass = (id = DEFAULT_PALETTE_ID) =>
  `radf-palette-${id}`;

/**
 * Clamp a palette step to a range.
 * @param {number} step - Desired step.
 * @param {number} min - Minimum step.
 * @param {number} max - Maximum step.
 * @returns {number} Clamped step.
 */
const clampStep = (step, min, max) => {
  if (!Number.isFinite(step)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.trunc(step)));
};

/**
 * Resolve a series CSS variable for a given index.
 * @param {number} index - Series index.
 * @param {number} [seriesCount] - Total number of series colors.
 * @returns {string} CSS variable reference.
 */
export const getSeriesVar = (index, seriesCount = DEFAULT_SERIES_COUNT) => {
  const safeIndex = Number.isInteger(index) ? index : 0;
  const count =
    Number.isInteger(seriesCount) && seriesCount > 0
      ? seriesCount
      : DEFAULT_SERIES_COUNT;
  const normalizedIndex = ((safeIndex % count) + count) % count;
  return `var(--radf-series-${normalizedIndex + 1})`;
};

/**
 * Resolve a sequential CSS variable for a step.
 * @param {number} step - Sequential step.
 * @returns {string} CSS variable reference.
 */
export const getSequentialVar = (step) => {
  const normalizedStep = clampStep(step, 1, SEQUENTIAL_STEPS);
  return `var(--radf-seq-${normalizedStep})`;
};

/**
 * Resolve a diverging CSS variable.
 * @param {('neg'|'pos'|'zero')} side - Diverging side.
 * @param {number} step - Diverging step.
 * @returns {string} CSS variable reference.
 */
export const getDivergingVar = (side, step) => {
  if (side === 'zero') {
    return 'var(--radf-div-zero)';
  }
  const normalizedStep = clampStep(step, 1, DIVERGING_STEPS);
  const prefix = side === 'neg' ? 'neg' : 'pos';
  return `var(--radf-div-${prefix}-${normalizedStep})`;
};

/**
 * Default palette id.
 * @type {string}
 */
export const DEFAULT_PALETTE = DEFAULT_PALETTE_ID;
