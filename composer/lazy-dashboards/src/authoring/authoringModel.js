import { getVizEncodingDefaults, getVizOptionDefaults } from './vizManifest.js';
import { mergeDeep } from './optionUtils.js';

/**
 * @typedef {Object} DashboardMeta
 * @property {string} title
 * @property {string} description
 */

/**
 * @typedef {Object} SemanticLayer
 * @property {boolean} enabled
 * @property {Object[]} metrics
 * @property {Object[]} dimensions
 */

/**
 * @typedef {Object} WidgetLayout
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 */

/**
 * @typedef {Object} WidgetModel
 * @property {string} id
 * @property {string} panelType
 * @property {string} vizType
 * @property {string} title
 * @property {string} subtitle
 * @property {Object} [encodings]
 * @property {Object} [options]
 * @property {WidgetLayout} [layout]
 * @property {boolean} [draft]
 * @property {Object} [query]
 * @property {string} [type]
 */

/**
 * @typedef {Object} AuthoringModel
 * @property {number} schemaVersion
 * @property {DashboardMeta} meta
 * @property {Object|null} datasetBinding
 * @property {SemanticLayer} semanticLayer
 * @property {WidgetModel[]} widgets
 * @property {WidgetLayout[]} layout
 */

/**
 * @typedef {Object} WidgetPatch
 * @property {Object} [encodings]
 * @property {Object} [options]
 * @property {Object} [layout]
 * @property {boolean} [replaceEncodings]
 * @property {boolean} [replaceOptions]
 */

const DEFAULT_SCHEMA_VERSION = 1;

const DEFAULT_SEMANTIC_LAYER = {
  enabled: false,
  metrics: [],
  dimensions: [],
};

/**
 * Creates a mostly-unique widget id for drafts and new panels.
 *
 * @returns {string} The generated widget id.
 */
const createWidgetId = () =>
  `widget-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const DEFAULT_LAYOUTS_BY_TYPE = {
  kpi: { w: 4, h: 1 },
  bar: { w: 6, h: 2 },
  barWithConditionalColoring: { w: 6, h: 2 },
  line: { w: 6, h: 2 },
  area: { w: 6, h: 2 },
  pie: { w: 4, h: 2 },
  scatter: { w: 6, h: 2 },
  composed: { w: 8, h: 3 },
  radar: { w: 6, h: 3 },
  treemap: { w: 6, h: 3 },
  funnel: { w: 6, h: 3 },
  sankey: { w: 8, h: 3 },
  radialBar: { w: 6, h: 3 },
  table: { w: 6, h: 3 },
  bulletChart: { w: 12, h: 2 },
  filterBar: { w: 12, h: 1 },
};

/**
 * Finds the next available layout slot for a widget.
 *
 * @param {WidgetModel[]} widgets
 * @param {string} vizType
 * @returns {WidgetLayout} The suggested layout placement.
 */
const getWidgetLayout = (widgets, vizType) => {
  const maxY = widgets.reduce((acc, widget) => {
    const layout = widget.layout || {};
    const bottom = (layout.y || 1) + (layout.h || 1);
    return Math.max(acc, bottom);
  }, 0);
  const size = DEFAULT_LAYOUTS_BY_TYPE[vizType] || { w: 4, h: 2 };
  return {
    x: 1,
    y: maxY ? maxY + 1 : 1,
    w: size.w,
    h: size.h,
  };
};

/**
 * Creates a blank authoring model with safe defaults.
 *
 * @param {Object} [meta]
 * @param {string} [meta.title]
 * @param {string} [meta.description]
 * @returns {AuthoringModel} The initialized model.
 */
export const createAuthoringModel = ({ title, description } = {}) => ({
  schemaVersion: DEFAULT_SCHEMA_VERSION,
  meta: {
    title: title || 'Untitled Dashboard',
    description: description || '',
  },
  datasetBinding: null,
  semanticLayer: { ...DEFAULT_SEMANTIC_LAYER },
  widgets: [],
  layout: [],
});

/**
 * Normalizes a stored model into the current schema with defaults applied.
 *
 * @param {Object} [model]
 * @param {Object} [metaOverrides]
 * @param {string} [metaOverrides.title]
 * @param {string} [metaOverrides.description]
 * @returns {AuthoringModel} The normalized model.
 */
export const normalizeAuthoringModel = (model = {}, { title, description } = {}) => {
  const meta = model.meta || {};
  const widgets = Array.isArray(model.widgets) ? model.widgets : [];
  const normalizedWidgets = widgets.map((widget) => {
    const vizType = widget.vizType || widget.type || 'kpi';
    const encodingDefaults = getVizEncodingDefaults(vizType);
    const optionDefaults = getVizOptionDefaults(vizType);
    const normalizedOptions = mergeDeep(optionDefaults, widget.options || {});
    if (
      vizType === 'kpi' &&
      widget.options?.numberFormat &&
      normalizedOptions.format == null
    ) {
      normalizedOptions.format = widget.options.numberFormat;
    }
    return {
      ...widget,
      id: widget.id || createWidgetId(),
      panelType: widget.panelType || 'viz',
      vizType,
      title: widget.title || 'Untitled Panel',
      subtitle: widget.subtitle || '',
      encodings: { ...encodingDefaults, ...(widget.encodings || {}) },
      options: normalizedOptions,
      layout: widget.layout || getWidgetLayout(widgets, vizType),
    };
  });
  return {
    schemaVersion:
      typeof model.schemaVersion === 'number'
        ? model.schemaVersion
        : DEFAULT_SCHEMA_VERSION,
    meta: {
      title: meta.title || title || 'Untitled Dashboard',
      description: meta.description || description || '',
    },
    datasetBinding:
      model.datasetBinding === undefined ? null : model.datasetBinding,
    semanticLayer: {
      ...DEFAULT_SEMANTIC_LAYER,
      ...(model.semanticLayer || {}),
    },
    widgets: normalizedWidgets,
    layout: Array.isArray(model.layout) ? model.layout : [],
  };
};

/**
 * Creates a new widget draft based on current model defaults.
 *
 * @param {AuthoringModel} model
 * @param {Object} [options]
 * @param {string} [options.vizType]
 * @param {string} [options.panelType]
 * @returns {WidgetModel} The draft widget.
 */
export const createWidgetDraft = (model, { vizType, panelType } = {}) => {
  const resolvedVizType = vizType || 'kpi';
  const widgets = Array.isArray(model?.widgets) ? model.widgets : [];
  const layout = getWidgetLayout(widgets, resolvedVizType);
  const encodingDefaults = getVizEncodingDefaults(resolvedVizType);
  const optionDefaults = getVizOptionDefaults(resolvedVizType);
  return {
    id: createWidgetId(),
    panelType: panelType || 'viz',
    vizType: resolvedVizType,
    title: 'New Widget',
    subtitle: '',
    encodings: encodingDefaults,
    options: optionDefaults,
    layout,
    draft: true,
  };
};

/**
 * Adds a widget to the model and appends its layout entry.
 *
 * @param {AuthoringModel} model
 * @param {WidgetModel} widget
 * @returns {AuthoringModel} The updated model.
 */
export const addWidgetToModel = (model, widget) => {
  const widgets = [...(model.widgets || []), widget];
  const layout = [
    ...(model.layout || []),
    { id: widget.id, ...widget.layout },
  ];
  return {
    ...model,
    widgets,
    layout,
  };
};

/**
 * Updates a widget and keeps the layout list in sync.
 *
 * @param {AuthoringModel} model
 * @param {string} widgetId
 * @param {WidgetPatch} changes
 * @returns {AuthoringModel} The updated model.
 */
export const updateWidgetInModel = (model, widgetId, changes) => {
  const { replaceEncodings, replaceOptions, ...patch } = changes || {};
  const widgets = (model.widgets || []).map((widget) => {
    if (widget.id !== widgetId) {
      return widget;
    }
    const next = {
      ...widget,
      ...patch,
    };
    if (patch.encodings) {
      next.encodings = replaceEncodings
        ? patch.encodings
        : { ...widget.encodings, ...patch.encodings };
    }
    if (patch.options) {
      next.options = replaceOptions
        ? patch.options
        : mergeDeep(widget.options || {}, patch.options);
    }
    if (patch.layout) {
      next.layout = { ...widget.layout, ...patch.layout };
    }
    return next;
  });
  const layout = (model.layout || []).map((entry) =>
    entry.id === widgetId ? { ...entry, ...(patch.layout || {}) } : entry
  );
  return {
    ...model,
    widgets,
    layout,
  };
};

/**
 * Removes a widget and its layout entry from the model.
 *
 * @param {AuthoringModel} model
 * @param {string} widgetId
 * @returns {AuthoringModel} The updated model.
 */
export const removeWidgetFromModel = (model, widgetId) => ({
  ...model,
  widgets: (model.widgets || []).filter((widget) => widget.id !== widgetId),
  layout: (model.layout || []).filter((entry) => entry.id !== widgetId),
});

/**
 * The current authoring schema version.
 *
 * @type {number}
 */
export { DEFAULT_SCHEMA_VERSION };
