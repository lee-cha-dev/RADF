import { getPaletteClass } from './paletteRegistry';

const TEXT_VIZ_TYPES = new Set(['kpi', 'text', 'metric', 'number', 'markdown']);
const LINE_VIZ_TYPES = new Set(['line', 'area', 'composed', 'time-series', 'timeseries']);
const BAR_VIZ_TYPES = new Set(['bar', 'column', 'histogram']);
const SEQUENTIAL_VIZ_TYPES = new Set(['heatmap', 'choropleth', 'intensity']);

const resolveYKey = (encodings) => {
  if (Array.isArray(encodings?.y)) {
    return encodings.y[0];
  }
  return encodings?.y ?? null;
};

const hasDivergingRange = (data, encodings) => {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }
  const yKey = resolveYKey(encodings);
  if (!yKey) {
    return false;
  }
  let min = Infinity;
  let max = -Infinity;
  data.forEach((row) => {
    const value = row?.[yKey];
    if (typeof value === 'number' && Number.isFinite(value)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  });
  return min < 0 && max > 0;
};

const isTextViz = ({ panelConfig, vizType }) =>
  panelConfig?.vizRole === 'text' || TEXT_VIZ_TYPES.has(vizType);

const isSequentialViz = ({ vizType, options, panelConfig }) =>
  panelConfig?.options?.paletteRole === 'sequential' ||
  options?.paletteRole === 'sequential' ||
  SEQUENTIAL_VIZ_TYPES.has(vizType);

const isDivergingViz = ({ panelConfig, options, encodings, data }) => {
  if (panelConfig?.options?.paletteRole === 'diverging') {
    return true;
  }
  if (options?.paletteRole === 'diverging') {
    return true;
  }
  if (options?.diverging === true) {
    return true;
  }
  return hasDivergingRange(data, encodings);
};

const isMultiSeries = ({ encodings }) =>
  Array.isArray(encodings?.y) && encodings.y.length > 1;

const resolveInferredPalette = ({ vizType, encodings, options, panelConfig, data }) => {
  if (isSequentialViz({ vizType, options, panelConfig })) {
    return 'viridis';
  }
  if (isDivergingViz({ panelConfig, options, encodings, data })) {
    return 'rdylgn';
  }
  if (BAR_VIZ_TYPES.has(vizType)) {
    if (options?.stacked || isMultiSeries({ encodings })) {
      return 'dark2';
    }
    return 'analytics';
  }
  if (LINE_VIZ_TYPES.has(vizType)) {
    return 'tableau10';
  }
  return 'analytics';
};

export const resolvePaletteId = ({
  panelConfig,
  vizType,
  encodings,
  options,
  dashboardConfig,
  dashboardState,
  data,
}) => {
  if (panelConfig?.panelType !== 'viz') {
    return null;
  }
  if (isTextViz({ panelConfig, vizType })) {
    return null;
  }
  if (panelConfig?.paletteId) {
    return panelConfig.paletteId;
  }
  if (dashboardConfig?.defaultPaletteId) {
    return dashboardConfig.defaultPaletteId;
  }
  return resolveInferredPalette({
    vizType,
    encodings,
    options,
    panelConfig,
    data,
    dashboardState,
  });
};

export const resolvePaletteClass = (args) => {
  const paletteId = resolvePaletteId(args);
  if (!paletteId) {
    return null;
  }
  return getPaletteClass(paletteId);
};
