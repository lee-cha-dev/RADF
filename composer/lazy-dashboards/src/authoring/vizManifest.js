import { setNestedValue } from './optionUtils.js';

/**
 * @typedef {Object} VizManifest
 * @property {string} id
 * @property {string} label
 * @property {string} panelType
 * @property {string} supportLevel
 * @property {string} description
 * @property {Object} encodings
 * @property {Object} options
 */

const VIZ_MANIFEST_VERSION = 2;

/**
 * Builds default encoding values based on manifest definitions.
 *
 * @param {Object[]} [encodings]
 * @returns {Object} The encoding defaults.
 */
const createEncodingDefaults = (encodings = []) =>
  encodings.reduce((acc, encoding) => {
    acc[encoding.id] = encoding.multi ? [] : '';
    return acc;
  }, {});

/**
 * Builds default option values from option schemas.
 *
 * @param {Object} [options]
 * @returns {Object} The option defaults.
 */
const createOptionDefaults = (options = {}) =>
  Object.entries(options).reduce((acc, [key, schema]) => {
    if (schema.default !== undefined) {
      const path = schema.path || key;
      return setNestedValue(acc, path, schema.default);
    }
    return acc;
  }, {});

const LEGEND_OPTIONS = {
  legend: {
    type: 'boolean',
    label: 'Show legend',
    default: true,
    advanced: true,
  },
  legendMode: {
    type: 'enum',
    label: 'Legend mode',
    options: ['auto', 'series', 'category'],
    default: 'auto',
    advanced: true,
  },
  legendPosition: {
    type: 'enum',
    label: 'Legend position',
    options: ['bottom', 'top', 'right'],
    default: 'bottom',
    advanced: true,
  },
};

const SERIES_OPTIONS = {
  seriesKeys: {
    type: 'stringList',
    label: 'Series keys',
    help: 'Comma-separated list of series keys to render.',
    default: [],
    advanced: true,
  },
};

const VIZ_CAPABILITIES = {
  version: VIZ_MANIFEST_VERSION,
  viz: {
    kpi: {
      id: 'kpi',
      label: 'KPI',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Single value summary with optional comparison.',
      encodings: {
        required: [
          {
            id: 'value',
            label: 'Value',
            role: 'metric',
            help: 'Primary metric to display.',
          },
        ],
        optional: [
          {
            id: 'trend',
            label: 'Trend',
            role: 'metric',
            help: 'Secondary metric for a sparkline or delta.',
          },
          {
            id: 'comparison',
            label: 'Comparison',
            role: 'metric',
            help: 'Metric to compare against.',
          },
        ],
      },
      options: {
        format: {
          type: 'enum',
          label: 'Number format',
          options: ['number', 'currency', 'percent', 'integer'],
          default: 'number',
        },
        currency: {
          type: 'string',
          label: 'Currency',
          default: 'USD',
          advanced: true,
        },
        label: {
          type: 'string',
          label: 'Label override',
          default: '',
          advanced: true,
        },
        caption: {
          type: 'string',
          label: 'Caption',
          default: '',
          advanced: true,
        },
      },
    },
    bar: {
      id: 'bar',
      label: 'Bar',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Categorical comparison with optional grouping.',
      encodings: {
        required: [
          { id: 'x', label: 'X Axis', role: 'dimension' },
          { id: 'y', label: 'Y Axis', role: 'metric' },
        ],
        optional: [
          {
            id: 'category',
            label: 'Color',
            role: 'dimension',
            help: 'Color by a categorical field.',
          },
          {
            id: 'group',
            label: 'Group',
            role: 'dimension',
            help: 'Group by a secondary dimension.',
          },
        ],
      },
      options: {
        tooltip: {
          type: 'boolean',
          label: 'Show tooltip',
          default: true,
        },
        stacked: {
          type: 'boolean',
          label: 'Stacked',
          default: false,
        },
        stackedKeys: {
          type: 'stringList',
          label: 'Stacked series keys',
          help: 'Comma-separated list of series keys to stack.',
          default: [],
          advanced: true,
        },
        colorBy: {
          type: 'enum',
          label: 'Color by',
          options: ['series', 'category'],
          default: 'series',
          advanced: true,
        },
        diverging: {
          type: 'boolean',
          label: 'Diverging palette',
          default: false,
          advanced: true,
        },
        ...SERIES_OPTIONS,
        ...LEGEND_OPTIONS,
      },
    },
    line: {
      id: 'line',
      label: 'Line',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Time series or trend lines.',
      encodings: {
        required: [
          { id: 'x', label: 'X Axis', role: 'dimension' },
          { id: 'y', label: 'Y Axis', role: 'metric' },
        ],
        optional: [
          {
            id: 'group',
            label: 'Series',
            role: 'dimension',
            help: 'Split into multiple lines.',
          },
          {
            id: 'category',
            label: 'Color',
            role: 'dimension',
          },
        ],
      },
      options: {
        tooltip: {
          type: 'boolean',
          label: 'Show tooltip',
          default: true,
        },
        brushEnabled: {
          type: 'boolean',
          label: 'Enable brush',
          default: false,
          advanced: true,
          path: 'brush.enabled',
        },
        brushStartIndex: {
          type: 'number',
          label: 'Brush start index',
          min: 0,
          path: 'brush.startIndex',
          advanced: true,
          visibleWhen: { option: 'brush.enabled', equals: true },
        },
        brushEndIndex: {
          type: 'number',
          label: 'Brush end index',
          min: 0,
          path: 'brush.endIndex',
          advanced: true,
          visibleWhen: { option: 'brush.enabled', equals: true },
        },
        ...SERIES_OPTIONS,
        ...LEGEND_OPTIONS,
      },
    },
    area: {
      id: 'area',
      label: 'Area',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Filled trend lines for time series comparisons.',
      encodings: {
        required: [
          { id: 'x', label: 'X Axis', role: 'dimension' },
          { id: 'y', label: 'Y Axis', role: 'metric' },
        ],
        optional: [
          {
            id: 'group',
            label: 'Series',
            role: 'dimension',
            help: 'Split into multiple areas.',
          },
          {
            id: 'category',
            label: 'Color',
            role: 'dimension',
          },
        ],
      },
      options: {
        tooltip: {
          type: 'boolean',
          label: 'Show tooltip',
          default: true,
        },
        brushEnabled: {
          type: 'boolean',
          label: 'Enable brush',
          default: false,
          advanced: true,
          path: 'brush.enabled',
        },
        brushStartIndex: {
          type: 'number',
          label: 'Brush start index',
          min: 0,
          path: 'brush.startIndex',
          advanced: true,
          visibleWhen: { option: 'brush.enabled', equals: true },
        },
        brushEndIndex: {
          type: 'number',
          label: 'Brush end index',
          min: 0,
          path: 'brush.endIndex',
          advanced: true,
          visibleWhen: { option: 'brush.enabled', equals: true },
        },
        ...SERIES_OPTIONS,
        ...LEGEND_OPTIONS,
      },
    },
    pie: {
      id: 'pie',
      label: 'Pie',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Categorical proportions as slices (donut optional).',
      encodings: {
        required: [
          { id: 'category', label: 'Category', role: 'dimension' },
          { id: 'value', label: 'Value', role: 'metric' },
        ],
        optional: [],
      },
      options: {
        tooltip: {
          type: 'boolean',
          label: 'Show tooltip',
          default: true,
        },
        donut: {
          type: 'boolean',
          label: 'Donut mode',
          default: false,
        },
        labels: {
          type: 'boolean',
          label: 'Show labels',
          default: false,
          advanced: true,
        },
        ...LEGEND_OPTIONS,
      },
    },
    scatter: {
      id: 'scatter',
      label: 'Scatter',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Scatter plot for correlation and outliers.',
      encodings: {
        required: [
          { id: 'x', label: 'X Axis', role: 'dimension' },
          { id: 'y', label: 'Y Axis', role: 'metric' },
        ],
        optional: [
          {
            id: 'group',
            label: 'Series',
            role: 'dimension',
            help: 'Split points into series by category.',
          },
        ],
      },
      options: {
        tooltip: {
          type: 'boolean',
          label: 'Show tooltip',
          default: true,
        },
        pointSize: {
          type: 'number',
          label: 'Point size',
          min: 2,
          max: 16,
          default: 6,
        },
        ...LEGEND_OPTIONS,
      },
    },
    composed: {
      id: 'composed',
      label: 'Composed',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Combined bar + line chart for comparisons.',
      encodings: {
        required: [
          { id: 'x', label: 'X Axis', role: 'dimension' },
          { id: 'y', label: 'Y Axis', role: 'metric' },
        ],
        optional: [
          {
            id: 'group',
            label: 'Series',
            role: 'dimension',
            help: 'Split into multiple series if supported.',
          },
        ],
      },
      options: {
        tooltip: {
          type: 'boolean',
          label: 'Show tooltip',
          default: true,
        },
        barKeys: {
          type: 'stringList',
          label: 'Bar series keys',
          help: 'Comma-separated list of measure keys rendered as bars.',
          default: [],
          advanced: true,
        },
        lineKeys: {
          type: 'stringList',
          label: 'Line series keys',
          help: 'Comma-separated list of measure keys rendered as lines.',
          default: [],
          advanced: true,
        },
        ...SERIES_OPTIONS,
        ...LEGEND_OPTIONS,
      },
    },
    radar: {
      id: 'radar',
      label: 'Radar',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Multi-metric comparison across categories.',
      encodings: {
        required: [
          { id: 'x', label: 'Category', role: 'dimension' },
          { id: 'y', label: 'Value', role: 'metric' },
        ],
        optional: [
          {
            id: 'group',
            label: 'Series',
            role: 'dimension',
            help: 'Split into multiple radar series.',
          },
        ],
      },
      options: {
        tooltip: {
          type: 'boolean',
          label: 'Show tooltip',
          default: true,
        },
        fillOpacity: {
          type: 'number',
          label: 'Fill opacity',
          min: 0,
          max: 1,
          default: 0.2,
          advanced: true,
        },
        ...SERIES_OPTIONS,
        ...LEGEND_OPTIONS,
      },
    },
    treemap: {
      id: 'treemap',
      label: 'Treemap',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Hierarchical proportions shown as nested rectangles.',
      encodings: {
        required: [
          { id: 'category', label: 'Category', role: 'dimension' },
          { id: 'value', label: 'Value', role: 'metric' },
        ],
        optional: [],
      },
      options: {
        tooltip: {
          type: 'boolean',
          label: 'Show tooltip',
          default: true,
        },
        colorBy: {
          type: 'enum',
          label: 'Color by',
          options: ['category', 'depth'],
          default: 'category',
        },
        labels: {
          type: 'boolean',
          label: 'Show labels',
          default: false,
          advanced: true,
        },
        ...LEGEND_OPTIONS,
      },
    },
    funnel: {
      id: 'funnel',
      label: 'Funnel',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Stage drop-off visualization with ordered steps.',
      encodings: {
        required: [
          { id: 'category', label: 'Stage', role: 'dimension' },
          { id: 'value', label: 'Value', role: 'metric' },
        ],
        optional: [],
      },
      options: {
        tooltip: {
          type: 'boolean',
          label: 'Show tooltip',
          default: true,
        },
        labelMode: {
          type: 'enum',
          label: 'Label mode',
          options: ['name', 'value', 'percent', 'none'],
          default: 'name',
        },
        sort: {
          type: 'enum',
          label: 'Sort order',
          options: ['input', 'desc', 'asc'],
          default: 'input',
          advanced: true,
        },
        ...LEGEND_OPTIONS,
      },
    },
    sankey: {
      id: 'sankey',
      label: 'Sankey',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Flow diagram based on provided nodes and links.',
      encodings: {
        required: [],
        optional: [],
      },
      options: {
        tooltip: {
          type: 'boolean',
          label: 'Show tooltip',
          default: true,
        },
        colorBy: {
          type: 'enum',
          label: 'Color by',
          options: ['node', 'source', 'target'],
          default: 'node',
        },
        ...LEGEND_OPTIONS,
      },
    },
    radialBar: {
      id: 'radialBar',
      label: 'Radial Bar',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Radial bars for ranked category comparisons.',
      encodings: {
        required: [
          { id: 'category', label: 'Category', role: 'dimension' },
          { id: 'value', label: 'Value', role: 'metric' },
        ],
        optional: [
          {
            id: 'group',
            label: 'Series',
            role: 'dimension',
            help: 'Split into multiple radial bar series.',
          },
        ],
      },
      options: {
        tooltip: {
          type: 'boolean',
          label: 'Show tooltip',
          default: true,
        },
        innerRadius: {
          type: 'number',
          label: 'Inner radius',
          min: 0,
          default: 20,
          advanced: true,
        },
        outerRadius: {
          type: 'number',
          label: 'Outer radius',
          min: 0,
          default: 80,
          advanced: true,
        },
        labels: {
          type: 'boolean',
          label: 'Show labels',
          default: false,
          advanced: true,
        },
        ...SERIES_OPTIONS,
        ...LEGEND_OPTIONS,
      },
    },
    barWithConditionalColoring: {
      id: 'barWithConditionalColoring',
      label: 'Conditional Bar',
      panelType: 'viz',
      supportLevel: 'partial',
      description: 'Bar chart with conditional bar colors.',
      encodings: {
        required: [
          { id: 'x', label: 'X Axis', role: 'dimension' },
          { id: 'y', label: 'Y Axis', role: 'metric' },
        ],
        optional: [
          {
            id: 'color',
            label: 'Color flag',
            role: 'dimension',
            help: 'Boolean field to flip warning colors.',
          },
        ],
      },
      options: {
        tooltip: {
          type: 'boolean',
          label: 'Show tooltip',
          default: true,
        },
      },
    },
    table: {
      id: 'table',
      label: 'Table',
      panelType: 'viz',
      supportLevel: 'deferred',
      description: 'Tabular view of selected fields.',
      encodings: {
        required: [
          {
            id: 'columns',
            label: 'Columns',
            role: 'dimension',
            multi: true,
            help: 'Comma-separated list of columns.',
          },
        ],
        optional: [
          {
            id: 'group',
            label: 'Group',
            role: 'dimension',
            help: 'Group rows by a dimension.',
          },
          {
            id: 'sort',
            label: 'Sort',
            role: 'dimension',
            help: 'Column name to sort by.',
          },
        ],
      },
      options: {
        pageSize: {
          type: 'number',
          label: 'Page size',
          min: 5,
          max: 100,
          default: 10,
        },
        striped: {
          type: 'boolean',
          label: 'Striped rows',
          default: true,
        },
        dense: {
          type: 'boolean',
          label: 'Dense mode',
          default: false,
          advanced: true,
        },
        showTotals: {
          type: 'boolean',
          label: 'Show totals',
          default: false,
          advanced: true,
        },
      },
    },
    bulletChart: {
      id: 'bulletChart',
      label: 'Bullet',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Progress toward a target.',
      encodings: {
        required: [
          { id: 'x', label: 'Value', role: 'metric' },
          { id: 'y', label: 'Category', role: 'dimension' },
        ],
        optional: [
          {
            id: 'color',
            label: 'Color',
            role: 'dimension',
            help: 'Categorical field to color bars.',
          },
        ],
      },
      options: {
        orientation: {
          type: 'enum',
          label: 'Orientation',
          options: ['horizontal', 'vertical'],
          default: 'horizontal',
        },
        tooltip: {
          type: 'boolean',
          label: 'Show tooltip',
          default: true,
        },
        colorBy: {
          type: 'string',
          label: 'Color by field',
          help: 'Overrides the color encoding with a field name.',
          default: '',
          advanced: true,
          suggestFrom: 'fields',
        },
        leftAnnotationsEnabled: {
          type: 'boolean',
          label: 'Show left annotations',
          default: true,
          advanced: true,
          path: 'leftAnnotations.enabled',
        },
        leftAnnotationsType: {
          type: 'enum',
          label: 'Annotation type',
          options: ['dot', 'none'],
          default: 'dot',
          advanced: true,
          path: 'leftAnnotations.type',
          visibleWhen: { option: 'leftAnnotations.enabled', equals: true },
        },
        leftAnnotationsColorBy: {
          type: 'string',
          label: 'Annotation color by',
          default: '',
          advanced: true,
          path: 'leftAnnotations.colorBy',
          suggestFrom: 'fields',
          visibleWhen: { option: 'leftAnnotations.enabled', equals: true },
        },
        showPercentColumn: {
          type: 'boolean',
          label: 'Show percent column',
          default: true,
        },
        percentKey: {
          type: 'string',
          label: 'Percent field',
          default: '',
          advanced: true,
          suggestFrom: 'fields',
          visibleWhen: { option: 'showPercentColumn', equals: true },
        },
        thresholdMarkersEnabled: {
          type: 'boolean',
          label: 'Show threshold markers',
          default: true,
          advanced: true,
          path: 'thresholdMarkers.enabled',
        },
        thresholdMarkersValueKey: {
          type: 'string',
          label: 'Threshold value field',
          default: 'dept_threshold',
          advanced: true,
          path: 'thresholdMarkers.valueKey',
          suggestFrom: 'fields',
          visibleWhen: { option: 'thresholdMarkers.enabled', equals: true },
        },
        thresholdMarkersLabel: {
          type: 'string',
          label: 'Threshold label',
          default: 'Dept Threshold (μ + 1.5σ)',
          advanced: true,
          path: 'thresholdMarkers.label',
          visibleWhen: { option: 'thresholdMarkers.enabled', equals: true },
        },
        thresholdMarkersColor: {
          type: 'color',
          label: 'Threshold color',
          default: 'var(--radf-accent-warning)',
          advanced: true,
          path: 'thresholdMarkers.color',
          visibleWhen: { option: 'thresholdMarkers.enabled', equals: true },
        },
        outlierRuleValueKey: {
          type: 'string',
          label: 'Outlier value field',
          default: '',
          advanced: true,
          path: 'outlierRule.valueKey',
          suggestFrom: 'fields',
        },
        iqrValueKey: {
          type: 'string',
          label: 'IQR value field',
          default: '',
          advanced: true,
          path: 'iqrValueKey',
          suggestFrom: 'fields',
        },
        outlierValueKey: {
          type: 'string',
          label: 'Outlier value key',
          default: '',
          advanced: true,
          path: 'outlierValueKey',
          suggestFrom: 'fields',
        },
        averageKey: {
          type: 'string',
          label: 'Average value key',
          default: '',
          advanced: true,
          path: 'averageKey',
          suggestFrom: 'fields',
        },
        headerTitleX: {
          type: 'string',
          label: 'Header title (value)',
          default: '',
          advanced: true,
          path: 'headerTitles.xTitle',
        },
        headerTitleY: {
          type: 'string',
          label: 'Header title (category)',
          default: '',
          advanced: true,
          path: 'headerTitles.yTitle',
        },
        headerTitlePercent: {
          type: 'string',
          label: 'Header title (percent)',
          default: '',
          advanced: true,
          path: 'headerTitles.percentTitle',
        },
      },
    },
    filterBar: {
      id: 'filterBar',
      label: 'Filter Bar',
      panelType: 'viz',
      supportLevel: 'supported',
      description: 'Interactive filters for the dashboard.',
      encodings: {
        required: [
          {
            id: 'fields',
            label: 'Fields',
            role: 'dimension',
            multi: true,
            help: 'Comma-separated list of filter fields.',
          },
        ],
        optional: [],
      },
      options: {
        allowMultiSelect: {
          type: 'boolean',
          label: 'Allow multi-select',
          default: true,
        },
        showSearch: {
          type: 'boolean',
          label: 'Show search',
          default: true,
          advanced: true,
        },
        showClear: {
          type: 'boolean',
          label: 'Show clear button',
          default: true,
          advanced: true,
        },
        layout: {
          type: 'enum',
          label: 'Layout',
          options: ['inline', 'stacked'],
          default: 'inline',
        },
      },
    },
  },
};

/**
 * Lists all viz manifests.
 *
 * @returns {VizManifest[]} The available viz manifests.
 */
export const listVizManifests = () =>
  Object.values(VIZ_CAPABILITIES.viz);

/**
 * Gets a specific viz manifest by id.
 *
 * @param {string} vizType
 * @returns {VizManifest|null} The manifest, if available.
 */
export const getVizManifest = (vizType) =>
  VIZ_CAPABILITIES.viz[vizType] || null;

/**
 * Builds default encodings for a viz type.
 *
 * @param {string} vizType
 * @returns {Object} The encoding defaults.
 */
export const getVizEncodingDefaults = (vizType) => {
  const manifest = getVizManifest(vizType);
  if (!manifest?.encodings) {
    return {};
  }
  const { required = [], optional = [] } = manifest.encodings;
  return {
    ...createEncodingDefaults(required),
    ...createEncodingDefaults(optional),
  };
};

/**
 * Builds default options for a viz type.
 *
 * @param {string} vizType
 * @returns {Object} The option defaults.
 */
export const getVizOptionDefaults = (vizType) => {
  const manifest = getVizManifest(vizType);
  if (!manifest?.options) {
    return {};
  }
  return createOptionDefaults(manifest.options);
};

/**
 * Returns the manifest schema version.
 *
 * @returns {number} The manifest version.
 */
export const getVizManifestVersion = () => VIZ_CAPABILITIES.version;
