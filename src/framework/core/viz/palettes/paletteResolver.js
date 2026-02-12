/**
 * @module core/viz/palettes/paletteResolver
 * @description Resolve palette selection and class names for charts.
 */
import { getPaletteClass } from './paletteRegistry';

const TEXT_VIZ_TYPES = new Set(['kpi', 'kpiVariant', 'text', 'metric', 'number', 'markdown']);
const SEQUENTIAL_VIZ_TYPES = new Set(['heatmap', 'choropleth', 'density']);

/**
 * Determine if a viz is treated as text-only.
 * @param {Object} args - Resolution inputs.
 * @param {Object} args.panelConfig - Panel configuration.
 * @param {string} args.vizType - Visualization type.
 * @returns {boolean} True when the viz uses text-only rendering.
 */
const isTextViz = ({ panelConfig, vizType }) =>
  panelConfig?.vizRole === 'text' || TEXT_VIZ_TYPES.has(vizType);

/**
 * Resolve palette intent for a visualization.
 * @param {Object} args - Resolution inputs.
 * @param {Object} args.panelConfig - Panel config.
 * @param {string} args.vizType - Visualization type.
 * @param {Object} args.options - Viz options.
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
 * Resolve the default palette id for a given intent.
 * @param {string} intent - Palette intent.
 * @returns {string} Palette id.
 */
const resolveDefaultPaletteId = (intent) => {
  if (intent === 'diverging') {
    return 'rdylgn';
  }
  if (intent === 'sequential') {
    return 'viridis';
  }
  return 'analytics';
};

/**
 * Resolve palette id, class name, and intent for a visualization.
 * @param {Object} args - Resolution inputs.
 * @param {Object} args.panelConfig - Panel configuration.
 * @param {string} args.vizType - Visualization type.
 * @param {Object} args.encodings - Encoding map.
 * @param {Object} args.options - Viz options.
 * @param {Array<Object>} args.data - Data rows.
 * @returns {{paletteId: string, paletteClass: string, intent: string}|null} Palette resolution.
 */
export const resolvePalette = ({ panelConfig, vizType, encodings, options, data }) => {
  if (panelConfig?.panelType !== 'viz') {
    return null;
  }
  if (isTextViz({ panelConfig, vizType })) {
    return null;
  }
  if (panelConfig?.paletteIntent === 'none') {
    return null;
  }
  if (panelConfig?.paletteId) {
    return {
      paletteId: panelConfig.paletteId,
      paletteClass: getPaletteClass(panelConfig.paletteId),
      intent: resolveIntent({ panelConfig, vizType, options, encodings, data }),
    };
  }
  const intent = resolveIntent({ panelConfig, vizType, options, encodings, data });
  if (intent === 'none') {
    return null;
  }
  const paletteId = resolveDefaultPaletteId(intent);
  return {
    paletteId,
    paletteClass: getPaletteClass(paletteId),
    intent,
  };
};

/**
 * Resolve only the palette id.
 * @param {Object} args - Resolution inputs (same as resolvePalette).
 * @returns {string|null} Palette id.
 */
export const resolvePaletteId = (args) => resolvePalette(args)?.paletteId ?? null;

/**
 * Resolve only the palette CSS class.
 * @param {Object} args - Resolution inputs (same as resolvePalette).
 * @returns {string|null} Palette class.
 */
export const resolvePaletteClass = (args) =>
  resolvePalette(args)?.paletteClass ?? null;
