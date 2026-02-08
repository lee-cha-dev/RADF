const VIZ_MANIFEST_VERSION = 1;

const createEncodingDefaults = (encodings = []) =>
  encodings.reduce((acc, encoding) => {
    acc[encoding.id] = encoding.multi ? [] : '';
    return acc;
  }, {});

const createOptionDefaults = (options = {}) =>
  Object.entries(options).reduce((acc, [key, schema]) => {
    if (schema.default !== undefined) {
      acc[key] = schema.default;
    }
    return acc;
  }, {});

const VIZ_CAPABILITIES = {
  version: VIZ_MANIFEST_VERSION,
  viz: {
    kpi: {
      id: 'kpi',
      label: 'KPI',
      panelType: 'viz',
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
        numberFormat: {
          type: 'enum',
          label: 'Number format',
          options: ['number', 'currency', 'percent'],
          default: 'number',
        },
        precision: {
          type: 'number',
          label: 'Precision',
          min: 0,
          max: 6,
          default: 2,
          advanced: true,
        },
        showDelta: {
          type: 'boolean',
          label: 'Show delta',
          default: true,
        },
        showTrend: {
          type: 'boolean',
          label: 'Show trend',
          default: false,
          advanced: true,
        },
      },
    },
    bar: {
      id: 'bar',
      label: 'Bar',
      panelType: 'viz',
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
        orientation: {
          type: 'enum',
          label: 'Orientation',
          options: ['vertical', 'horizontal'],
          default: 'vertical',
        },
        stacked: {
          type: 'boolean',
          label: 'Stacked',
          default: false,
        },
        showLegend: {
          type: 'boolean',
          label: 'Show legend',
          default: true,
          advanced: true,
        },
        xLabel: {
          type: 'string',
          label: 'X axis label',
          default: '',
          advanced: true,
        },
        yLabel: {
          type: 'string',
          label: 'Y axis label',
          default: '',
          advanced: true,
        },
      },
    },
    line: {
      id: 'line',
      label: 'Line',
      panelType: 'viz',
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
        smooth: {
          type: 'boolean',
          label: 'Smooth line',
          default: false,
        },
        showPoints: {
          type: 'boolean',
          label: 'Show points',
          default: true,
          advanced: true,
        },
        showArea: {
          type: 'boolean',
          label: 'Fill area',
          default: false,
          advanced: true,
        },
        showLegend: {
          type: 'boolean',
          label: 'Show legend',
          default: true,
          advanced: true,
        },
      },
    },
    table: {
      id: 'table',
      label: 'Table',
      panelType: 'viz',
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
      description: 'Progress toward a target.',
      encodings: {
        required: [
          { id: 'x', label: 'Category', role: 'dimension' },
          { id: 'y', label: 'Value', role: 'metric' },
        ],
        optional: [
          {
            id: 'target',
            label: 'Target',
            role: 'metric',
            help: 'Target value for comparison.',
          },
          {
            id: 'range',
            label: 'Range',
            role: 'metric',
            help: 'Range marker for qualitative bands.',
          },
        ],
      },
      options: {
        showTarget: {
          type: 'boolean',
          label: 'Show target',
          default: true,
        },
        showRange: {
          type: 'boolean',
          label: 'Show range',
          default: false,
          advanced: true,
        },
        orientation: {
          type: 'enum',
          label: 'Orientation',
          options: ['horizontal', 'vertical'],
          default: 'horizontal',
        },
      },
    },
    filterBar: {
      id: 'filterBar',
      label: 'Filter Bar',
      panelType: 'viz',
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
