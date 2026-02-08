import { getVizEncodingDefaults, getVizOptionDefaults } from './vizManifest.js';

const DEFAULT_SCHEMA_VERSION = 1;

const DEFAULT_SEMANTIC_LAYER = {
  enabled: false,
  metrics: [],
  dimensions: [],
};

const createWidgetId = () =>
  `widget-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const DEFAULT_LAYOUTS_BY_TYPE = {
  kpi: { w: 4, h: 1 },
  bar: { w: 6, h: 2 },
  line: { w: 6, h: 2 },
  table: { w: 6, h: 3 },
  bulletChart: { w: 12, h: 2 },
  filterBar: { w: 12, h: 1 },
};

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

export const normalizeAuthoringModel = (model = {}, { title, description } = {}) => {
  const meta = model.meta || {};
  const widgets = Array.isArray(model.widgets) ? model.widgets : [];
  const normalizedWidgets = widgets.map((widget) => {
    const vizType = widget.vizType || widget.type || 'kpi';
    const encodingDefaults = getVizEncodingDefaults(vizType);
    const optionDefaults = getVizOptionDefaults(vizType);
    return {
      ...widget,
      id: widget.id || createWidgetId(),
      panelType: widget.panelType || 'viz',
      vizType,
      title: widget.title || 'Untitled Panel',
      subtitle: widget.subtitle || '',
      encodings: { ...encodingDefaults, ...(widget.encodings || {}) },
      options: { ...optionDefaults, ...(widget.options || {}) },
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
        : { ...widget.options, ...patch.options };
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

export const removeWidgetFromModel = (model, widgetId) => ({
  ...model,
  widgets: (model.widgets || []).filter((widget) => widget.id !== widgetId),
  layout: (model.layout || []).filter((entry) => entry.id !== widgetId),
});

export { DEFAULT_SCHEMA_VERSION };
