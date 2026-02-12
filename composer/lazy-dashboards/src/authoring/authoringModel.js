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
 * @property {boolean} exportDatasetConfig
 * @property {Object[]} metrics
 * @property {Object[]} dimensions
 */

/**
 * @typedef {Object} DatasourceModel
 * @property {string} id
 * @property {string} name
 * @property {Object|null} datasetBinding
 * @property {SemanticLayer} semanticLayer
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
 * @property {string} [datasourceId]
 */

/**
 * @typedef {Object} AuthoringModel
 * @property {number} schemaVersion
 * @property {DashboardMeta} meta
 * @property {DatasourceModel[]} datasources
 * @property {string|null} activeDatasourceId
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
const DEFAULT_DATASOURCE_NAME = 'Primary datasource';

const DEFAULT_SEMANTIC_LAYER = {
  enabled: false,
  exportDatasetConfig: false,
  metrics: [],
  dimensions: [],
};

const slugifyId = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const ensureUniqueId = (baseId, usedIds) => {
  if (!usedIds.has(baseId)) {
    usedIds.add(baseId);
    return baseId;
  }
  let counter = 2;
  let nextId = `${baseId}-${counter}`;
  while (usedIds.has(nextId)) {
    counter += 1;
    nextId = `${baseId}-${counter}`;
  }
  usedIds.add(nextId);
  return nextId;
};

/**
 * Generates a datasource id from a display name.
 *
 * @param {string} name
 * @param {Set<string>} [usedIds]
 * @returns {string} The generated datasource id.
 */
export const createDatasourceId = (name, usedIds = new Set()) => {
  const base = slugifyId(name) || 'datasource';
  return ensureUniqueId(base, usedIds);
};

const normalizeDatasourceName = (name) =>
  name?.trim() || DEFAULT_DATASOURCE_NAME;

const normalizeSemanticLayer = (semanticLayer) => ({
  ...DEFAULT_SEMANTIC_LAYER,
  ...(semanticLayer || {}),
});

const normalizeDatasourceEntry = (entry, usedIds) => {
  const name = normalizeDatasourceName(entry?.name);
  const baseId = entry?.id?.trim() || slugifyId(name) || 'datasource';
  const id = ensureUniqueId(baseId, usedIds);
  return {
    id,
    name,
    datasetBinding: entry?.datasetBinding ?? null,
    semanticLayer: normalizeSemanticLayer(entry?.semanticLayer),
  };
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
  kpiVariant: { w: 4, h: 1 },
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
export const createAuthoringModel = ({ title, description } = {}) => {
  const usedIds = new Set();
  const datasource = normalizeDatasourceEntry(
    { name: DEFAULT_DATASOURCE_NAME },
    usedIds
  );
  return {
    schemaVersion: DEFAULT_SCHEMA_VERSION,
    meta: {
      title: title || 'Untitled Dashboard',
      description: description || '',
    },
    datasources: [datasource],
    activeDatasourceId: datasource.id,
    datasetBinding: null,
    semanticLayer: { ...DEFAULT_SEMANTIC_LAYER },
    widgets: [],
    layout: [],
  };
};

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
  const usedIds = new Set();
  const legacyDatasource = model.datasetBinding || model.semanticLayer
    ? normalizeDatasourceEntry({
        id: model.datasetBinding?.id,
        name: meta.title || DEFAULT_DATASOURCE_NAME,
        datasetBinding:
          model.datasetBinding === undefined ? null : model.datasetBinding,
        semanticLayer: model.semanticLayer,
      }, usedIds)
    : null;
  const datasources = Array.isArray(model.datasources) && model.datasources.length > 0
    ? model.datasources.map((entry) => normalizeDatasourceEntry(entry, usedIds))
    : legacyDatasource
      ? [legacyDatasource]
      : [normalizeDatasourceEntry({ name: DEFAULT_DATASOURCE_NAME }, usedIds)];
  const activeDatasourceId =
    datasources.find((item) => item.id === model.activeDatasourceId)?.id ||
    datasources[0]?.id ||
    null;
  const widgets = Array.isArray(model.widgets) ? model.widgets : [];
  const normalizedWidgets = widgets.map((widget) => {
    const vizType = widget.vizType || widget.type || 'kpi';
    const encodingDefaults = getVizEncodingDefaults(vizType);
    const optionDefaults = getVizOptionDefaults(vizType);
    const normalizedOptions = mergeDeep(optionDefaults, widget.options || {});
    return {
      ...widget,
      id: widget.id || createWidgetId(),
      datasourceId:
        widget.datasourceId ||
        widget.datasetId ||
        activeDatasourceId,
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
    datasources,
    activeDatasourceId,
    datasetBinding:
      model.datasetBinding === undefined ? null : model.datasetBinding,
    semanticLayer: normalizeSemanticLayer(model.semanticLayer),
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
export const createWidgetDraft = (
  model,
  { vizType, panelType, datasourceId } = {}
) => {
  const resolvedVizType = vizType || 'kpi';
  const widgets = Array.isArray(model?.widgets) ? model.widgets : [];
  const defaultDatasourceId =
    datasourceId ||
    model?.activeDatasourceId ||
    model?.datasources?.[0]?.id ||
    null;
  const layout = getWidgetLayout(widgets, resolvedVizType);
  const encodingDefaults = getVizEncodingDefaults(resolvedVizType);
  const optionDefaults = getVizOptionDefaults(resolvedVizType);
  return {
    id: createWidgetId(),
    datasourceId: defaultDatasourceId,
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
