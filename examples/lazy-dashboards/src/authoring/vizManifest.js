import { setNestedValue } from './optionUtils.js';

const VIZ_MANIFEST_VERSION = 2;

const createEncodingDefaults = (encodings = []) =>
  encodings.reduce((acc, encoding) => {
    acc[encoding.id] = encoding.multi ? [] : '';
    return acc;
  }, {});

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
        markerLinesEnabled: {
          type: 'boolean',
          label: 'Show marker lines',
          default: true,
          advanced: true,
          path: 'markerLines.enabled',
        },
        markerLinesValueKey: {
          type: 'string',
          label: 'Marker value field',
          default: 'dept_average',
          advanced: true,
          path: 'markerLines.valueKey',
          suggestFrom: 'fields',
          visibleWhen: { option: 'markerLines.enabled', equals: true },
        },
        markerLinesLabel: {
          type: 'string',
          label: 'Marker label',
          default: 'Dept average',
          advanced: true,
          path: 'markerLines.label',
          visibleWhen: { option: 'markerLines.enabled', equals: true },
        },
        markerLinesColor: {
          type: 'color',
          label: 'Marker color',
          default: '#E0E000',
          advanced: true,
          path: 'markerLines.color',
          visibleWhen: { option: 'markerLines.enabled', equals: true },
        },
        outlierRuleValueKey: {
          type: 'string',
          label: 'Outlier value field',
          default: 'dept_threshold',
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

export const listVizManifests = () =>
  Object.values(VIZ_CAPABILITIES.viz);

export const getVizManifest = (vizType) =>
  VIZ_CAPABILITIES.viz[vizType] || null;

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

export const getVizOptionDefaults = (vizType) => {
  const manifest = getVizManifest(vizType);
  if (!manifest?.options) {
    return {};
  }
  return createOptionDefaults(manifest.options);
};

export const getVizManifestVersion = () => VIZ_CAPABILITIES.version;
