import {
  getVizEncodingDefaults,
  getVizOptionDefaults,
} from '../authoring/vizManifest.js';
import { normalizeAuthoringModel } from '../authoring/authoringModel.js';

/**
 * @typedef {Object} TemplatePreviewBlock
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {string} type
 */

/**
 * @typedef {Object} DashboardTemplateSummary
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string[]} tags
 * @property {boolean} supportsFilterBar
 */

/**
 * @typedef {Object} DashboardTemplateDefinition
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string[]} tags
 * @property {boolean} supportsFilterBar
 * @property {TemplatePreviewBlock[]} preview
 * @property {Object} authoringModel
 */

/**
 * @typedef {Object} DatasetColumn
 * @property {string} id
 * @property {string} [label]
 * @property {string} [type]
 * @property {string} [inferredType]
 * @property {string} [role]
 * @property {string} [inferredRole]
 * @property {Object} [stats]
 */

const TEMPLATE_SCHEMA_VERSION = 1;

const DEFAULT_SEMANTIC_LAYER = {
  enabled: false,
  metrics: [],
  dimensions: [],
};

const cloneValue = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const buildWidget = ({
  id,
  vizType,
  title,
  subtitle,
  layout,
  encodings,
  options,
}) => ({
  id,
  panelType: 'viz',
  vizType,
  title: title || 'Widget',
  subtitle: subtitle || '',
  encodings: {
    ...getVizEncodingDefaults(vizType),
    ...(encodings || {}),
  },
  options: {
    ...getVizOptionDefaults(vizType),
    ...(options || {}),
  },
  layout: { ...layout },
});

const buildLayout = (widgets = []) =>
  widgets.map((widget) => ({
    id: widget.id,
    ...widget.layout,
  }));

const createTemplateModel = ({ title, description, widgets }) => ({
  schemaVersion: TEMPLATE_SCHEMA_VERSION,
  meta: {
    title,
    description: description || '',
  },
  datasetBinding: null,
  semanticLayer: { ...DEFAULT_SEMANTIC_LAYER },
  widgets,
  layout: buildLayout(widgets),
});

const PLACEHOLDERS = {
  metric: 'metric_1',
  metricAlt: 'metric_2',
  metricCompare: 'metric_3',
  category: 'category',
  date: 'date',
};

const TEMPLATE_DEFINITIONS = [
  {
    id: 'kpi-overview',
    name: 'KPI Overview',
    description: 'Basic KPI + bar + table layout for rapid pulse checks.',
    tags: ['kpi', 'bar', 'table'],
    supportsFilterBar: true,
    preview: [
      { x: 1, y: 1, w: 3, h: 1, type: 'kpi' },
      { x: 4, y: 1, w: 3, h: 1, type: 'kpi' },
      { x: 7, y: 1, w: 3, h: 1, type: 'kpi' },
      { x: 10, y: 1, w: 3, h: 1, type: 'kpi' },
      { x: 1, y: 2, w: 7, h: 3, type: 'chart' },
      { x: 8, y: 2, w: 5, h: 3, type: 'table' },
    ],
    authoringModel: createTemplateModel({
      title: 'KPI Overview',
      description: 'Headline KPIs with a comparison bar and detail table.',
      widgets: [
        buildWidget({
          id: 'kpi-total',
          vizType: 'kpi',
          title: 'Total',
          subtitle: 'All regions',
          layout: { x: 1, y: 1, w: 3, h: 1 },
          encodings: {
            value: PLACEHOLDERS.metric,
            trend: PLACEHOLDERS.metricAlt,
          },
        }),
        buildWidget({
          id: 'kpi-growth',
          vizType: 'kpi',
          title: 'Growth',
          subtitle: 'Week over week',
          layout: { x: 4, y: 1, w: 3, h: 1 },
          encodings: {
            value: PLACEHOLDERS.metricAlt,
            comparison: PLACEHOLDERS.metricCompare,
          },
        }),
        buildWidget({
          id: 'kpi-efficiency',
          vizType: 'kpi',
          title: 'Efficiency',
          subtitle: 'Output per hour',
          layout: { x: 7, y: 1, w: 3, h: 1 },
          encodings: {
            value: PLACEHOLDERS.metricCompare,
          },
        }),
        buildWidget({
          id: 'kpi-satisfaction',
          vizType: 'kpi',
          title: 'Satisfaction',
          subtitle: 'Customer signal',
          layout: { x: 10, y: 1, w: 3, h: 1 },
          encodings: {
            value: PLACEHOLDERS.metric,
          },
          options: {
            format: 'percent',
          },
        }),
        buildWidget({
          id: 'bar-performance',
          vizType: 'bar',
          title: 'Performance by category',
          subtitle: 'Compare top segments',
          layout: { x: 1, y: 2, w: 7, h: 3 },
          encodings: {
            x: PLACEHOLDERS.category,
            y: PLACEHOLDERS.metric,
            group: PLACEHOLDERS.category,
          },
        }),
        buildWidget({
          id: 'table-detail',
          vizType: 'table',
          title: 'Operational detail',
          subtitle: 'Track recent records',
          layout: { x: 8, y: 2, w: 5, h: 3 },
          encodings: {
            columns: [
              PLACEHOLDERS.category,
              PLACEHOLDERS.metric,
              PLACEHOLDERS.metricAlt,
            ],
          },
        }),
      ],
    }),
  },
  {
    id: 'trend-comparison',
    name: 'Trend + Comparison',
    description: 'Long-form trend line with side-by-side KPI context.',
    tags: ['trend', 'line', 'comparison'],
    supportsFilterBar: true,
    preview: [
      { x: 1, y: 1, w: 12, h: 3, type: 'chart' },
      { x: 1, y: 4, w: 7, h: 3, type: 'chart' },
      { x: 8, y: 4, w: 5, h: 2, type: 'kpi' },
      { x: 8, y: 6, w: 5, h: 2, type: 'kpi' },
    ],
    authoringModel: createTemplateModel({
      title: 'Trend + Comparison',
      description: 'Trend narrative with comparison KPIs.',
      widgets: [
        buildWidget({
          id: 'line-trend',
          vizType: 'line',
          title: 'Trend over time',
          subtitle: 'Primary metric',
          layout: { x: 1, y: 1, w: 12, h: 3 },
          encodings: {
            x: PLACEHOLDERS.date,
            y: PLACEHOLDERS.metric,
            group: PLACEHOLDERS.category,
          },
        }),
        buildWidget({
          id: 'bar-comparison',
          vizType: 'bar',
          title: 'Comparison by segment',
          subtitle: 'Grouped snapshot',
          layout: { x: 1, y: 4, w: 7, h: 3 },
          encodings: {
            x: PLACEHOLDERS.category,
            y: PLACEHOLDERS.metricAlt,
            group: PLACEHOLDERS.category,
          },
        }),
        buildWidget({
          id: 'kpi-primary',
          vizType: 'kpi',
          title: 'Primary KPI',
          subtitle: 'Current period',
          layout: { x: 8, y: 4, w: 5, h: 2 },
          encodings: {
            value: PLACEHOLDERS.metric,
            trend: PLACEHOLDERS.metricAlt,
          },
        }),
        buildWidget({
          id: 'kpi-secondary',
          vizType: 'kpi',
          title: 'Secondary KPI',
          subtitle: 'YoY change',
          layout: { x: 8, y: 6, w: 5, h: 2 },
          encodings: {
            value: PLACEHOLDERS.metricCompare,
            comparison: PLACEHOLDERS.metric,
          },
        }),
      ],
    }),
  },
  {
    id: 'ops-table',
    name: 'Operational Table',
    description: 'Table-first monitoring with KPIs and a bullet rundown.',
    tags: ['ops', 'table', 'bullet'],
    supportsFilterBar: true,
    preview: [
      { x: 1, y: 1, w: 4, h: 1, type: 'kpi' },
      { x: 5, y: 1, w: 4, h: 1, type: 'kpi' },
      { x: 9, y: 1, w: 4, h: 1, type: 'kpi' },
      { x: 1, y: 2, w: 12, h: 3, type: 'table' },
      { x: 1, y: 5, w: 12, h: 2, type: 'bullet' },
    ],
    authoringModel: createTemplateModel({
      title: 'Operational Table',
      description: 'Alert-friendly table with bullet progress.',
      widgets: [
        buildWidget({
          id: 'kpi-throughput',
          vizType: 'kpi',
          title: 'Throughput',
          subtitle: 'Units processed',
          layout: { x: 1, y: 1, w: 4, h: 1 },
          encodings: {
            value: PLACEHOLDERS.metric,
          },
        }),
        buildWidget({
          id: 'kpi-quality',
          vizType: 'kpi',
          title: 'Quality',
          subtitle: 'Defect rate',
          layout: { x: 5, y: 1, w: 4, h: 1 },
          encodings: {
            value: PLACEHOLDERS.metricAlt,
          },
          options: {
            format: 'percent',
          },
        }),
        buildWidget({
          id: 'kpi-uptime',
          vizType: 'kpi',
          title: 'Uptime',
          subtitle: 'Daily availability',
          layout: { x: 9, y: 1, w: 4, h: 1 },
          encodings: {
            value: PLACEHOLDERS.metricCompare,
          },
          options: {
            format: 'percent',
          },
        }),
        buildWidget({
          id: 'ops-table-main',
          vizType: 'table',
          title: 'Operational log',
          subtitle: 'Most recent activity',
          layout: { x: 1, y: 2, w: 12, h: 3 },
          encodings: {
            columns: [
              PLACEHOLDERS.category,
              PLACEHOLDERS.metric,
              PLACEHOLDERS.metricAlt,
              PLACEHOLDERS.metricCompare,
            ],
          },
        }),
        buildWidget({
          id: 'ops-bullet',
          vizType: 'bulletChart',
          title: 'Target tracking',
          subtitle: 'Goal progress by team',
          layout: { x: 1, y: 5, w: 12, h: 2 },
          encodings: {
            x: PLACEHOLDERS.metric,
            y: PLACEHOLDERS.category,
          },
        }),
      ],
    }),
  },
  {
    id: 'empty-grid',
    name: 'Empty Grid',
    description: 'Start from a clean slate with an empty layout.',
    tags: ['blank'],
    supportsFilterBar: false,
    preview: [],
    authoringModel: createTemplateModel({
      title: 'Empty Grid',
      description: 'A blank canvas ready for widgets.',
      widgets: [],
    }),
  },
];

const buildFilterBarWidget = () =>
  buildWidget({
    id: 'filter-bar',
    vizType: 'filterBar',
    title: 'Filters',
    subtitle: 'Refine the dataset',
    layout: { x: 1, y: 1, w: 12, h: 1 },
    encodings: {
      fields: [PLACEHOLDERS.category],
    },
    options: {
      layout: 'inline',
      showSearch: false,
    },
  });

const applyFilterBarVariant = (model) => {
  const nextModel = cloneValue(model);
  const filterWidget = buildFilterBarWidget();
  const shiftedWidgets = nextModel.widgets.map((widget) => ({
    ...widget,
    layout: {
      ...widget.layout,
      y: (widget.layout?.y || 1) + 1,
    },
  }));
  nextModel.widgets = [filterWidget, ...shiftedWidgets];
  nextModel.layout = buildLayout(nextModel.widgets);
  return nextModel;
};

const getColumnRole = (column) => column?.role || column?.inferredRole;
const getColumnType = (column) => column?.type || column?.inferredType;

const isMetricColumn = (column) => {
  const role = getColumnRole(column);
  if (role === 'metric') {
    return true;
  }
  if (role === 'dimension') {
    return false;
  }
  return getColumnType(column) === 'number';
};

const isDateColumn = (column) => getColumnType(column) === 'date';

const isDimensionColumn = (column) => {
  const role = getColumnRole(column);
  if (role === 'dimension') {
    return true;
  }
  if (role === 'metric') {
    return false;
  }
  return getColumnType(column) !== 'number';
};

const isCategoricalColumn = (column) =>
  isDimensionColumn(column) && !isDateColumn(column);

const pickByScore = (columns, scoreFn) => {
  if (!columns.length) {
    return null;
  }
  const scored = columns
    .map((column) => ({
      column,
      score: scoreFn(column),
    }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.column || null;
};

const scoreCategory = (column) => {
  const distinct = column?.stats?.distinctCount ?? 0;
  if (distinct >= 2 && distinct <= 12) {
    return 3;
  }
  if (distinct >= 2 && distinct <= 40) {
    return 2;
  }
  if (distinct >= 2 && distinct <= 200) {
    return 1;
  }
  return 0;
};

const buildAutoBindings = (columns = []) => {
  const available = columns.filter((column) => column?.id);
  if (!available.length) {
    return null;
  }
  const metrics = available.filter(isMetricColumn);
  const dimensions = available.filter(isDimensionColumn);
  const dates = available.filter(isDateColumn);
  const categories = available.filter(isCategoricalColumn);
  const topCategory =
    pickByScore(categories, scoreCategory) || categories[0] || dimensions[0];
  const fallback = available[0];
  const metric = metrics[0] || fallback;
  const metricAlt = metrics[1] || metrics[0] || fallback;
  const metricCompare = metrics[2] || metrics[1] || metrics[0] || fallback;
  const date = dates[0] || dimensions[0] || fallback;
  const group =
    categories.find((column) => column.id !== topCategory?.id) ||
    dimensions.find((column) => column.id !== topCategory?.id) ||
    topCategory ||
    fallback;
  const tableColumns = [
    ...dimensions.map((column) => column.id),
    ...metrics.map((column) => column.id),
  ];
  const uniqueTableColumns = Array.from(new Set(tableColumns)).slice(0, 5);
  const filterFields = dimensions.map((column) => column.id).slice(0, 3);

  return {
    metric: metric?.id || '',
    metricAlt: metricAlt?.id || '',
    metricCompare: metricCompare?.id || '',
    date: date?.id || '',
    category: topCategory?.id || '',
    group: group?.id || '',
    tableColumns: uniqueTableColumns.length
      ? uniqueTableColumns
      : fallback?.id
        ? [fallback.id]
        : [],
    filterFields: filterFields.length
      ? filterFields
      : fallback?.id
        ? [fallback.id]
        : [],
  };
};

const applyBindingsToWidget = (widget, bindings) => {
  if (!bindings) {
    return widget;
  }
  const nextEncodings = { ...(widget.encodings || {}) };
  switch (widget.vizType) {
    case 'kpi':
      nextEncodings.value = bindings.metric || nextEncodings.value;
      nextEncodings.trend = bindings.metricAlt || nextEncodings.trend;
      nextEncodings.comparison =
        bindings.metricCompare || nextEncodings.comparison;
      break;
    case 'bar':
      nextEncodings.x = bindings.category || bindings.date || nextEncodings.x;
      nextEncodings.y = bindings.metric || nextEncodings.y;
      nextEncodings.group = bindings.group || nextEncodings.group;
      break;
    case 'line':
      nextEncodings.x = bindings.date || bindings.category || nextEncodings.x;
      nextEncodings.y = bindings.metric || nextEncodings.y;
      nextEncodings.group = bindings.group || nextEncodings.group;
      break;
    case 'table':
      nextEncodings.columns =
        bindings.tableColumns.length > 0
          ? bindings.tableColumns
          : nextEncodings.columns;
      break;
    case 'bulletChart':
      nextEncodings.x = bindings.metric || nextEncodings.x;
      nextEncodings.y = bindings.category || nextEncodings.y;
      break;
    case 'filterBar':
      nextEncodings.fields =
        bindings.filterFields.length > 0
          ? bindings.filterFields
          : nextEncodings.fields;
      break;
    default:
      break;
  }
  return {
    ...widget,
    encodings: nextEncodings,
  };
};

/**
 * Lists template metadata for selection UIs.
 *
 * @returns {DashboardTemplateSummary[]} The template summaries.
 */
export const listDashboardTemplates = () =>
  TEMPLATE_DEFINITIONS.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    tags: template.tags,
    supportsFilterBar: template.supportsFilterBar,
  }));

/**
 * Gets a template definition by id.
 *
 * @param {string} templateId
 * @returns {DashboardTemplateDefinition|null} The template definition.
 */
export const getDashboardTemplate = (templateId) =>
  TEMPLATE_DEFINITIONS.find((template) => template.id === templateId) || null;

/**
 * Gets a layout preview for a template.
 *
 * @param {string} templateId
 * @param {boolean} [includeFilterBar=false]
 * @returns {TemplatePreviewBlock[]} The preview blocks.
 */
export const getTemplatePreview = (templateId, includeFilterBar = false) => {
  const template = getDashboardTemplate(templateId);
  if (!template) {
    return [];
  }
  const basePreview = template.preview || [];
  if (!includeFilterBar || !template.supportsFilterBar) {
    return basePreview;
  }
  const shifted = basePreview.map((block) => ({
    ...block,
    y: block.y + 1,
  }));
  return [
    { x: 1, y: 1, w: 12, h: 1, type: 'filter' },
    ...shifted,
  ];
};

/**
 * Builds an authoring model from a template.
 *
 * @param {string} templateId
 * @param {{ includeFilterBar?: boolean }} [options]
 * @returns {Object|null} The normalized authoring model.
 */
export const buildTemplateAuthoringModel = (
  templateId,
  { includeFilterBar = false } = {}
) => {
  const template = getDashboardTemplate(templateId);
  if (!template) {
    return null;
  }
  let model = cloneValue(template.authoringModel);
  if (includeFilterBar && template.supportsFilterBar) {
    model = applyFilterBarVariant(model);
  }
  return normalizeAuthoringModel(model, {
    title: template.name,
    description: template.description,
  });
};

/**
 * Applies auto-bindings to a template using inferred dataset columns.
 *
 * @param {Object} model
 * @param {DatasetColumn[]} [datasetColumns]
 * @returns {Object} The updated model.
 */
export const applyTemplateBindings = (model, datasetColumns = []) => {
  if (!model) {
    return model;
  }
  const bindings = buildAutoBindings(datasetColumns);
  if (!bindings) {
    return model;
  }
  const nextWidgets = (model.widgets || []).map((widget) =>
    applyBindingsToWidget(widget, bindings)
  );
  return {
    ...model,
    widgets: nextWidgets,
    layout: buildLayout(nextWidgets),
  };
};
