/**
 * @module core/viz/palettes/colorAssignment
 * @description Build palette-aware color assignments for charts and legends.
 */
import { getDivergingVar, getSequentialVar, getSeriesVar } from './paletteRegistry';

const TEXT_VIZ_TYPES = new Set(['kpi', 'kpiVariant', 'text', 'metric', 'number', 'markdown']);
const LINE_VIZ_TYPES = new Set(['line', 'area', 'composed', 'time-series', 'timeseries']);
const GROUPABLE_LINE_VIZ_TYPES = new Set(['line', 'area', 'time-series', 'timeseries']);
const BAR_VIZ_TYPES = new Set(['bar', 'column', 'histogram']);
const PIE_VIZ_TYPES = new Set(['pie', 'donut']);
const SCATTER_VIZ_TYPES = new Set(['scatter']);
const RADAR_VIZ_TYPES = new Set(['radar']);
const TREEMAP_VIZ_TYPES = new Set(['treemap']);
const FUNNEL_VIZ_TYPES = new Set(['funnel']);
const SANKEY_VIZ_TYPES = new Set(['sankey']);
const RADIAL_BAR_VIZ_TYPES = new Set(['radialBar']);
const SEQUENTIAL_VIZ_TYPES = new Set(['heatmap', 'choropleth', 'density']);

/**
 * Normalize a key to a stable string form.
 * @param {*} key - Raw key value.
 * @returns {string|null} Normalized key.
 */
const normalizeKey = (key) => {
  if (key == null) {
    return null;
  }
  return String(key);
};

/**
 * Normalize a list of keys and preserve order uniqueness.
 * @param {Array<*>} keys - Raw keys list.
 * @returns {string[]} Normalized keys.
 */
const normalizeKeys = (keys) => {
  if (!Array.isArray(keys)) {
    return [];
  }
  const seen = new Set();
  const ordered = [];
  keys.forEach((key) => {
    const normalized = normalizeKey(key);
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    ordered.push(normalized);
  });
  return ordered;
};

/**
 * Build a category assignment from an ordered key list.
 * @param {Array<*>} keys - Raw key list.
 * @returns {Object|null} Category assignment or null.
 */
const buildCategoryAssignmentFromKeys = (keys) => {
  const seriesKeys = normalizeKeys(keys);
  if (!seriesKeys.length) {
    return null;
  }
  return {
    mode: 'category',
    ...buildSeriesAssignment({ seriesKeys, seriesDefinitions: [] }),
  };
};

/**
 * Collect top-level treemap keys from hierarchical data.
 * @param {Array<Object>|Object} data - Treemap data.
 * @returns {Array<*>} Key list.
 */
const collectTreemapKeys = (data, nameKey = 'name') => {
  if (Array.isArray(data)) {
    const hasChildren = data.some((item) => Array.isArray(item?.children));
    if (hasChildren) {
      return data.map((item) => item?.name ?? item?.[nameKey]);
    }
    return data.map((item) => item?.[nameKey] ?? item?.name);
  }
  if (Array.isArray(data?.children)) {
    return data.children.map((item) => item?.name);
  }
  return [];
};

/**
 * Collect funnel stage keys from data.
 * @param {Array<Object>} data - Funnel data rows.
 * @param {string} nameKey - Field for stage names.
 * @returns {Array<*>} Key list.
 */
const collectFunnelKeys = (data, nameKey) => {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((row) => row?.[nameKey] ?? row?.name);
};

/**
 * Collect sankey node keys from data.
 * @param {Object} data - Sankey data.
 * @returns {Array<*>} Key list.
 */
const collectSankeyKeys = (data) => {
  if (!data?.nodes) {
    return [];
  }
  return data.nodes.map((node) => node?.name ?? node?.id);
};

/**
 * Resolve series definitions defined on panel config.
 * @param {Object} panelConfig - Panel configuration.
 * @returns {Array<{key: string, label: string}>} Series definitions.
 */
const resolveSeriesDefinitions = (panelConfig) => {
  if (!Array.isArray(panelConfig?.series)) {
    return [];
  }
  return panelConfig.series
    .map((entry) => ({
      key: normalizeKey(entry?.key),
      label: entry?.label ?? normalizeKey(entry?.key),
    }))
    .filter((entry) => entry.key);
};

/**
 * Resolve series keys for a chart from config, options, or data.
 * @param {Object} args - Resolution inputs.
 * @param {Object} args.encodings - Encoding map for the visualization.
 * @param {Object} args.options - Viz options.
 * @param {Object} args.panelConfig - Panel config.
 * @param {Array<Object>} args.data - Data rows.
 * @returns {string[]} Series keys.
 */
const resolveSeriesKeys = ({ encodings, options, panelConfig, data }) => {
  const seriesDefinitions = resolveSeriesDefinitions(panelConfig);
  if (seriesDefinitions.length) {
    return seriesDefinitions.map((entry) => entry.key);
  }
  if (Array.isArray(options?.seriesKeys) && options.seriesKeys.length) {
    return normalizeKeys(options.seriesKeys);
  }
  if (Array.isArray(options?.stackedKeys) && options.stackedKeys.length) {
    return normalizeKeys(options.stackedKeys);
  }
  if (Array.isArray(encodings?.y)) {
    return normalizeKeys(encodings.y);
  }
  if (encodings?.y) {
    return normalizeKeys([encodings.y]);
  }
  if (Array.isArray(data) && data.length > 0) {
    const sample = data[0] || {};
    return normalizeKeys(Object.keys(sample).filter((key) => key !== encodings?.x));
  }
  return [];
};

/**
 * Resolve the value key for sequential/diverging palettes.
 * @param {Object} encodings - Encoding map.
 * @returns {string|null} Value key.
 */
const resolveValueKey = (encodings) => {
  if (Array.isArray(encodings?.y)) {
    return encodings.y[0];
  }
  return encodings?.y ?? null;
};

/**
 * Resolve palette intent for a visualization.
 * @param {Object} args - Intent inputs.
 * @param {Object} args.panelConfig - Panel configuration.
 * @param {string} args.vizType - Visualization type.
 * @param {Object} args.options - Visualization options.
 * @returns {string} Palette intent.
 */
const resolveIntent = ({ panelConfig, vizType, options }) => {
  if (panelConfig?.paletteIntent) {
    return panelConfig.paletteIntent;
  }
  if (options?.diverging === true) {
    return 'diverging';
  }
  if (SEQUENTIAL_VIZ_TYPES.has(vizType)) {
    return 'sequential';
  }
  return 'categorical';
};

/**
 * Build assignment for series palettes.
 * @param {Object} args - Assignment inputs.
 * @param {string[]} args.seriesKeys - Series keys.
 * @param {Array<{key: string, label: string}>} args.seriesDefinitions - Series definitions.
 * @returns {Object} Series assignment helper.
 */
const buildSeriesAssignment = ({ seriesKeys, seriesDefinitions }) => {
  const labelMap = new Map(seriesDefinitions.map((entry) => [entry.key, entry.label]));
  const items = seriesKeys.map((key, index) => ({
    key,
    label: labelMap.get(key) ?? key,
    colorVar: getSeriesVar(index),
  }));
  const colorMap = new Map(items.map((item) => [item.key, item.colorVar]));
  return {
    items,
    getColor: (key) => colorMap.get(normalizeKey(key)) ?? getSeriesVar(0),
    getLabel: (key) => labelMap.get(normalizeKey(key)) ?? normalizeKey(key),
  };
};

/**
 * Build assignment for category palettes.
 * @param {Object} args - Assignment inputs.
 * @param {Array<Object>} args.data - Data rows.
 * @param {string} args.xKey - Category key.
 * @returns {Object} Category assignment helper.
 */
const buildCategoryAssignment = ({ data, xKey }) => {
  const values = Array.isArray(data)
    ? data.map((row) => row?.[xKey]).filter((value) => value != null)
    : [];
  const uniqueValues = Array.from(new Set(values));
  const isNumeric = uniqueValues.every((value) => typeof value === 'number');
  uniqueValues.sort((a, b) => {
    if (isNumeric) {
      return a - b;
    }
    return String(a).localeCompare(String(b), undefined, { numeric: true });
  });
  const items = uniqueValues.map((value, index) => {
    const key = normalizeKey(value);
    return {
      key,
      label: key,
      colorVar: getSeriesVar(index),
    };
  });
  const colorMap = new Map(items.map((item) => [item.key, item.colorVar]));
  return {
    items,
    getColor: (key) => colorMap.get(normalizeKey(key)) ?? getSeriesVar(0),
    getLabel: (key) => normalizeKey(key),
  };
};

/**
 * Build assignment for diverging palettes.
 * @param {Object} args - Assignment inputs.
 * @param {Array<Object>} args.data - Data rows.
 * @param {string} args.valueKey - Value key.
 * @returns {Object} Diverging assignment helper.
 */
const buildDivergingAssignment = ({ data, valueKey }) => {
  const values = Array.isArray(data)
    ? data
        .map((row) => row?.[valueKey])
        .filter((value) => typeof value === 'number' && Number.isFinite(value))
    : [];
  let min = 0;
  let max = 0;
  values.forEach((value) => {
    min = Math.min(min, value);
    max = Math.max(max, value);
  });
  const maxMagnitude = Math.max(Math.abs(min), Math.abs(max));
  const hasDivergingRange = min < 0 && max > 0;
  const items = [
    { key: 'neg', label: 'Negative', colorVar: getDivergingVar('neg', 3) },
    { key: 'zero', label: 'Neutral', colorVar: getDivergingVar('zero') },
    { key: 'pos', label: 'Positive', colorVar: getDivergingVar('pos', 3) },
  ];
  const getColor = (value) => {
    if (!hasDivergingRange || !Number.isFinite(value)) {
      return getSeriesVar(0);
    }
    if (value === 0) {
      return getDivergingVar('zero');
    }
    if (maxMagnitude === 0) {
      return getDivergingVar(value < 0 ? 'neg' : 'pos', 1);
    }
    const ratio = Math.min(1, Math.abs(value) / maxMagnitude);
    const step = Math.max(1, Math.ceil(ratio * 4));
    return getDivergingVar(value < 0 ? 'neg' : 'pos', step);
  };
  return {
    items,
    getColor,
    getLabel: (key) => {
      if (key === 'neg') return 'Negative';
      if (key === 'pos') return 'Positive';
      if (key === 'zero') return 'Neutral';
      return null;
    },
  };
};

/**
 * Build assignment for sequential palettes.
 * @param {Object} args - Assignment inputs.
 * @param {Array<Object>} args.data - Data rows.
 * @param {string} args.valueKey - Value key.
 * @returns {Object} Sequential assignment helper.
 */
const buildSequentialAssignment = ({ data, valueKey }) => {
  const values = Array.isArray(data)
    ? data
        .map((row) => row?.[valueKey])
        .filter((value) => typeof value === 'number' && Number.isFinite(value))
    : [];
  let min = 0;
  let max = 0;
  values.forEach((value) => {
    min = Math.min(min, value);
    max = Math.max(max, value);
  });
  const range = max - min;
  const getColor = (value) => {
    if (!Number.isFinite(value)) {
      return getSequentialVar(1);
    }
    if (range === 0) {
      return getSequentialVar(5);
    }
    const ratio = (value - min) / range;
    const step = Math.max(1, Math.min(9, Math.ceil(ratio * 9)));
    return getSequentialVar(step);
  };
  return {
    items: [],
    getColor,
    getLabel: () => null,
  };
};

/**
 * @typedef {Object} ColorAssignment
 * @property {string} mode - Assignment mode (series, single, category, diverging, sequential).
 * @property {Array<{key: string, label: string, colorVar: string}>} items - Legend items.
 * @property {(key: string) => string} getColor - Resolve a color for a key/value.
 * @property {(key: string) => (string|null)} getLabel - Resolve a label for a key.
 */

/**
 * Build the palette assignment for a given viz configuration.
 * @param {Object} args - Inputs for palette assignment.
 * @param {Object} args.panelConfig - Panel configuration.
 * @param {string} args.vizType - Visualization type key.
 * @param {Object} args.encodings - Encoding map.
 * @param {Object} args.options - Viz options.
 * @param {Array<Object>} args.data - Data rows.
 * @returns {ColorAssignment|null} Palette assignment or null when not applicable.
 */
export const buildColorAssignment = ({
  panelConfig,
  vizType,
  encodings,
  options,
  data,
}) => {
  if (panelConfig?.panelType !== 'viz') {
    return null;
  }
  if (TEXT_VIZ_TYPES.has(vizType)) {
    return null;
  }
  const intent = resolveIntent({ panelConfig, vizType, options });
  if (intent === 'none') {
    return null;
  }

  const seriesDefinitions = resolveSeriesDefinitions(panelConfig);
  const seriesKeys = resolveSeriesKeys({ encodings, options, panelConfig, data });
  const isMultiSeries =
    seriesDefinitions.length > 0 ||
    Array.isArray(encodings?.y) ||
    (Array.isArray(options?.seriesKeys) && options.seriesKeys.length > 1) ||
    (Array.isArray(options?.stackedKeys) && options.stackedKeys.length > 0);

  if (intent === 'diverging' && options?.diverging === true) {
    const valueKey = resolveValueKey(encodings);
    return {
      mode: 'diverging',
      ...buildDivergingAssignment({ data, valueKey }),
    };
  }

  if (intent === 'sequential') {
    const valueKey = resolveValueKey(encodings);
    return {
      mode: 'sequential',
      ...buildSequentialAssignment({ data, valueKey }),
    };
  }

  if (LINE_VIZ_TYPES.has(vizType)) {
    const groupKey = encodings?.group || options?.seriesBy;
    if (
      GROUPABLE_LINE_VIZ_TYPES.has(vizType) &&
      groupKey &&
      !Array.isArray(encodings?.y)
    ) {
      return {
        mode: 'category',
        ...buildCategoryAssignment({ data, xKey: groupKey }),
      };
    }
    if (isMultiSeries) {
      return {
        mode: 'series',
        ...buildSeriesAssignment({ seriesKeys, seriesDefinitions }),
      };
    }
    const single = buildSeriesAssignment({
      seriesKeys: seriesKeys.slice(0, 1),
      seriesDefinitions,
    });
    return { mode: 'single', ...single };
  }

  if (BAR_VIZ_TYPES.has(vizType)) {
    if (isMultiSeries) {
      return {
        mode: 'series',
        ...buildSeriesAssignment({ seriesKeys, seriesDefinitions }),
      };
    }
    const shouldColorByCategory =
      options?.colorBy === 'category' ||
      options?.legendMode === 'category' ||
      options?.legend === true;
    if (shouldColorByCategory) {
      return {
        mode: 'category',
        ...buildCategoryAssignment({ data, xKey: encodings?.x }),
      };
    }
    const single = buildSeriesAssignment({
      seriesKeys: seriesKeys.slice(0, 1),
      seriesDefinitions,
    });
    return { mode: 'single', ...single };
  }

  if (PIE_VIZ_TYPES.has(vizType)) {
    return {
      mode: 'category',
      ...buildCategoryAssignment({ data, xKey: encodings?.category ?? encodings?.x }),
    };
  }

  if (SCATTER_VIZ_TYPES.has(vizType)) {
    if (encodings?.group) {
      return {
        mode: 'category',
        ...buildCategoryAssignment({ data, xKey: encodings.group }),
      };
    }
    const fallbackKey = encodings?.y ?? 'value';
    return {
      mode: 'single',
      ...buildSeriesAssignment({
        seriesKeys: [fallbackKey],
        seriesDefinitions,
      }),
    };
  }

  if (RADAR_VIZ_TYPES.has(vizType)) {
    if (seriesKeys.length > 1) {
      return {
        mode: 'series',
        ...buildSeriesAssignment({ seriesKeys, seriesDefinitions }),
      };
    }
    const single = buildSeriesAssignment({
      seriesKeys: seriesKeys.slice(0, 1),
      seriesDefinitions,
    });
    return { mode: 'single', ...single };
  }

  if (TREEMAP_VIZ_TYPES.has(vizType)) {
    const nameKey = encodings?.category || encodings?.x || 'name';
    return buildCategoryAssignmentFromKeys(collectTreemapKeys(data, nameKey));
  }

  if (FUNNEL_VIZ_TYPES.has(vizType)) {
    const nameKey = encodings?.category || encodings?.x || 'name';
    return buildCategoryAssignmentFromKeys(collectFunnelKeys(data, nameKey));
  }

  if (SANKEY_VIZ_TYPES.has(vizType)) {
    return buildCategoryAssignmentFromKeys(collectSankeyKeys(data));
  }

  if (RADIAL_BAR_VIZ_TYPES.has(vizType)) {
    if (isMultiSeries) {
      return {
        mode: 'series',
        ...buildSeriesAssignment({ seriesKeys, seriesDefinitions }),
      };
    }
    return {
      mode: 'category',
      ...buildCategoryAssignment({
        data,
        xKey: encodings?.category || encodings?.x,
      }),
    };
  }

  if (seriesKeys.length > 1) {
    return {
      mode: 'series',
      ...buildSeriesAssignment({ seriesKeys, seriesDefinitions }),
    };
  }

  const single = buildSeriesAssignment({
    seriesKeys: seriesKeys.slice(0, 1),
    seriesDefinitions,
  });
  return { mode: 'single', ...single };
};
