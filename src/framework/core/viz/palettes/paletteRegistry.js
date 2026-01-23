const DEFAULT_PALETTE_ID = 'analytics';
const DEFAULT_SERIES_COUNT = 12;
const SEQUENTIAL_STEPS = 9;
const DIVERGING_STEPS = 4;

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

export const getPaletteClass = (id = DEFAULT_PALETTE_ID) =>
  `radf-palette-${id}`;

const clampStep = (step, min, max) => {
  if (!Number.isFinite(step)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.trunc(step)));
};

export const getSeriesVar = (index, seriesCount = DEFAULT_SERIES_COUNT) => {
  const safeIndex = Number.isInteger(index) ? index : 0;
  const count =
    Number.isInteger(seriesCount) && seriesCount > 0
      ? seriesCount
      : DEFAULT_SERIES_COUNT;
  const normalizedIndex = ((safeIndex % count) + count) % count;
  return `var(--radf-series-${normalizedIndex + 1})`;
};

export const getSequentialVar = (step) => {
  const normalizedStep = clampStep(step, 1, SEQUENTIAL_STEPS);
  return `var(--radf-seq-${normalizedStep})`;
};

export const getDivergingVar = (side, step) => {
  if (side === 'zero') {
    return 'var(--radf-div-zero)';
  }
  const normalizedStep = clampStep(step, 1, DIVERGING_STEPS);
  const prefix = side === 'neg' ? 'neg' : 'pos';
  return `var(--radf-div-${prefix}-${normalizedStep})`;
};

export const DEFAULT_PALETTE = DEFAULT_PALETTE_ID;
