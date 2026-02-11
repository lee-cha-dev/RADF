import { normalizeAuthoringModel } from './authoringModel.js';
import {
  generateExternalApiProviderModule,
  generateExternalApiProvidersModule,
} from '../data/externalApiProvider.js';

/**
 * @typedef {Object} CompileInput
 * @property {Object} dashboard
 * @property {Object} authoringModel
 */

/**
 * @typedef {Object} CompiledModules
 * @property {string} dashboard
 * @property {string|null} dataset
 * @property {string|null} metrics
 * @property {string|null} dimensions
 * @property {string|null} dataProvider
 */

/**
 * @typedef {Object} CompileOutput
 * @property {Object} config
 * @property {CompiledModules} modules
 */

/**
 * De-duplicates a list of truthy values.
 *
 * @param {Array<unknown>} values
 * @returns {Array<unknown>} The unique values.
 */
const uniq = (values) => Array.from(new Set(values.filter(Boolean)));

/**
 * Derives a query definition from encodings.
 *
 * @param {Object} [encodings]
 * @param {Object} [options]
 * @param {string} vizType
 * @returns {{ measures: string[], dimensions: string[] }} The query definition.
 */
const buildQueryFromEncodings = (encodings = {}, options = {}, vizType) => {
  if (!encodings || typeof encodings !== 'object') {
    return { measures: [], dimensions: [] };
  }
  const seriesBy = options?.seriesBy;
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
  if (seriesBy) {
    dimensions.push(seriesBy);
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

const normalizeQueryArray = (value) =>
  Array.isArray(value) ? value.filter(Boolean) : [];

/**
 * Merge an explicit widget query with encodings-driven fields.
 *
 * @param {Object|null|undefined} query
 * @param {Object} encodings
 * @param {Object} options
 * @param {string} vizType
 * @returns {Object} The merged query definition.
 */
const mergeQueryWithEncodings = (
  query,
  encodings = {},
  options = {},
  vizType
) => {
  const derived = buildQueryFromEncodings(encodings, options, vizType);
  if (!query) {
    return derived;
  }
  const mergedMeasures = uniq([
    ...normalizeQueryArray(query.measures),
    ...derived.measures,
  ]);
  const mergedDimensions = uniq([
    ...normalizeQueryArray(query.dimensions),
    ...derived.dimensions,
  ]);
  return {
    ...derived,
    ...query,
    measures: mergedMeasures,
    dimensions: mergedDimensions,
  };
};

/**
 * Compiles a single widget into a dashboard panel config.
 *
 * @param {Object} widget
 * @param {string} datasetId
 * @returns {Object} The panel config.
 */
const compileWidget = (widget, datasetId) => {
  const layout = widget.layout || { x: 1, y: 1, w: 4, h: 2 };
  const panelType = widget.panelType || 'viz';
  const vizType = widget.vizType || widget.type || 'kpi';
  const query = mergeQueryWithEncodings(
    widget.query,
    widget.encodings,
    widget.options,
    vizType
  );
  const resolvedDatasourceId = widget.datasourceId || widget.datasetId || datasetId;
  const panel = {
    id: widget.id,
    panelType,
    title: widget.title,
    subtitle: widget.subtitle,
    layout,
    datasetId: resolvedDatasourceId,
    datasourceId: resolvedDatasourceId,
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

/**
 * Serializes a payload into a JS module string.
 *
 * @param {string} name
 * @param {Object} payload
 * @returns {string} The module source.
 */
const generateModule = (name, payload, options = {}) => {
  const serialized = JSON.stringify(payload, null, 2);
  const doc = options.doc ? `${options.doc}\n` : '';
  return `${doc}const ${name} = ${serialized};\n\nexport default ${name};\n`;
};

/**
 * Builds a dataset config module from the authoring model.
 *
 * @param {string} datasetId
 * @param {Object} datasource
 * @param {Object} model
 * @returns {string} The dataset module source.
 */
const generateDatasetModule = (datasetId, datasource, model) => {
  const dataset = {
    id: datasetId,
    label: datasource?.name || model.meta?.title || 'Dataset',
    description: model.meta?.description || '',
    dimensions: datasource?.semanticLayer?.dimensions || [],
    metrics: datasource?.semanticLayer?.metrics || [],
  };
  return generateModule('datasetConfig', dataset, {
    doc: `/**
 * Dataset config
 *
 * @typedef {Object} DatasetConfig
 * @property {string} id - The dataset id.
 * @property {string} label - The dataset label.
 * @property {string} description - The dataset description.
 * @property {Object[]} dimensions - The semantic layer dimensions.
 * @property {Object[]} metrics - The semantic layer metrics.
 *
 * @type {DatasetConfig}
 */`,
  });
};

/**
 * Builds a metrics module.
 *
 * @param {Object[]} metrics
 * @returns {string} The metrics module source.
 */
const generateMetricsModule = (metrics) =>
  generateModule('metrics', metrics || [], {
    doc: `/**
 * Metric definitions
 * @type {Object[]}
 */`,
  });

/**
 * Builds a dimensions module.
 *
 * @param {Object[]} dimensions
 * @returns {string} The dimensions module source.
 */
const generateDimensionsModule = (dimensions) =>
  generateModule('dimensions', dimensions || [], {
    doc: `/**
 * Dimension definitions
 * @type {Object[]}
 */`,
  });

/**
 * Compiles an authoring model into runtime dashboard configs and modules.
 *
 * @param {CompileInput} input
 * @returns {CompileOutput} The compiled config and modules.
 */
export const compileAuthoringModel = ({ dashboard, authoringModel }) => {
  const normalized = normalizeAuthoringModel(authoringModel, {
    title: dashboard?.name,
  });
  const datasources = normalized.datasources || [];
  const activeDatasourceId =
    normalized.activeDatasourceId || datasources[0]?.id || null;
  const datasetId =
    activeDatasourceId ||
    normalized.datasetBinding?.datasetId ||
    normalized.datasetBinding?.id ||
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
  const datasetsById = {};
  const metricsById = {};
  const dimensionsById = {};
  datasources.forEach((datasource) => {
    if (!datasource?.id) {
      return;
    }
    if (datasource.semanticLayer?.enabled) {
      datasetsById[datasource.id] = generateDatasetModule(
        datasource.id,
        datasource,
        normalized
      );
      metricsById[datasource.id] = generateMetricsModule(
        datasource.semanticLayer.metrics
      );
      dimensionsById[datasource.id] = generateDimensionsModule(
        datasource.semanticLayer.dimensions
      );
    }
  });
  const apiDatasources = datasources.filter(
    (datasource) => datasource?.datasetBinding?.source?.type === 'api'
  );
  const dataProviderModule =
    apiDatasources.length === 1
      ? generateExternalApiProviderModule(
          apiDatasources[0].datasetBinding.source
        )
      : apiDatasources.length > 1
        ? generateExternalApiProvidersModule(apiDatasources)
        : null;
  const fallbackDatasource =
    datasources.find((item) => item.id === datasetId) || datasources[0];
  const modules = {
    dashboard: generateModule('dashboardConfig', config, {
      doc: `/**
 * Dashboard config
 *
 * @typedef {Object} DashboardConfig
 * @property {string} id - The dashboard id.
 * @property {string} title - The dashboard title.
 * @property {string} subtitle - The dashboard subtitle.
 * @property {string} datasetId - The dataset id for panel queries.
 * @property {Object[]} panels - The dashboard panels.
 *
 * @type {DashboardConfig}
 */`,
    }),
    dataset:
      fallbackDatasource?.semanticLayer?.enabled
        ? generateDatasetModule(datasetId, fallbackDatasource, normalized)
        : null,
    metrics:
      fallbackDatasource?.semanticLayer?.enabled
        ? generateMetricsModule(fallbackDatasource.semanticLayer.metrics)
        : null,
    dimensions:
      fallbackDatasource?.semanticLayer?.enabled
        ? generateDimensionsModule(fallbackDatasource.semanticLayer.dimensions)
        : null,
    datasets: datasetsById,
    metricsById,
    dimensionsById,
    dataProvider: dataProviderModule,
  };
  return { config, modules };
};

export { buildQueryFromEncodings, mergeQueryWithEncodings };
