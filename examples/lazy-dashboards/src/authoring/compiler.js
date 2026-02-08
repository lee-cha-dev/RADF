import { normalizeAuthoringModel } from './authoringModel.js';

const uniq = (values) => Array.from(new Set(values.filter(Boolean)));

const buildQueryFromEncodings = (encodings = {}, vizType) => {
  if (!encodings || typeof encodings !== 'object') {
    return { measures: [], dimensions: [] };
  }
  const measures = [];
  const dimensions = [];
  if (encodings.value) {
    measures.push(encodings.value);
  }
  if (encodings.y) {
    measures.push(encodings.y);
  }
  if (encodings.x) {
    dimensions.push(encodings.x);
  }
  if (encodings.category) {
    dimensions.push(encodings.category);
  }
  if (encodings.group) {
    dimensions.push(encodings.group);
  }
  if (vizType === 'table' && encodings.columns) {
    const columns = Array.isArray(encodings.columns)
      ? encodings.columns
      : [encodings.columns];
    dimensions.push(...columns);
  }
  return {
    measures: uniq(measures),
    dimensions: uniq(dimensions),
  };
};

const compileWidget = (widget, datasetId) => {
  const layout = widget.layout || { x: 1, y: 1, w: 4, h: 2 };
  const panelType = widget.panelType || 'viz';
  const vizType = widget.vizType || widget.type || 'kpi';
  const query = widget.query || buildQueryFromEncodings(widget.encodings, vizType);
  const panel = {
    id: widget.id,
    panelType,
    title: widget.title,
    subtitle: widget.subtitle,
    layout,
    datasetId: widget.datasetId || datasetId,
    query,
  };
  if (panelType === 'viz') {
    panel.vizType = vizType;
    panel.encodings = widget.encodings || {};
    panel.options = widget.options || {};
    if (widget.interactions) {
      panel.interactions = widget.interactions;
    }
  }
  return panel;
};

const generateModule = (name, payload) => {
  const serialized = JSON.stringify(payload, null, 2);
  return `const ${name} = ${serialized};\n\nexport default ${name};\n`;
};

const generateDatasetModule = (datasetId, model) => {
  const dataset = {
    id: datasetId,
    title: model.meta?.title || 'Dataset',
    description: model.meta?.description || '',
    dimensions: model.semanticLayer?.dimensions || [],
    metrics: model.semanticLayer?.metrics || [],
  };
  return generateModule('datasetConfig', dataset);
};

const generateMetricsModule = (metrics) =>
  generateModule('metrics', metrics || []);

const generateDimensionsModule = (dimensions) =>
  generateModule('dimensions', dimensions || []);

export const compileAuthoringModel = ({ dashboard, authoringModel }) => {
  const normalized = normalizeAuthoringModel(authoringModel, {
    title: dashboard?.name,
  });
  const datasetId =
    normalized.datasetBinding?.datasetId ||
    `${dashboard?.id || 'dashboard'}_dataset`;
  const config = {
    id: dashboard?.id || 'dashboard',
    title: dashboard?.name || normalized.meta?.title || 'Untitled Dashboard',
    subtitle: normalized.meta?.description || '',
    datasetId,
    panels: normalized.widgets.map((widget) =>
      compileWidget(widget, datasetId)
    ),
  };
  const modules = {
    dashboard: generateModule('dashboardConfig', config),
    dataset: normalized.semanticLayer?.enabled
      ? generateDatasetModule(datasetId, normalized)
      : null,
    metrics: normalized.semanticLayer?.enabled
      ? generateMetricsModule(normalized.semanticLayer.metrics)
      : null,
    dimensions: normalized.semanticLayer?.enabled
      ? generateDimensionsModule(normalized.semanticLayer.dimensions)
      : null,
  };
  return { config, modules };
};
