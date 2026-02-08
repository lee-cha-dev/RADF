import { describe, expect, it } from 'vitest';
import { compileAuthoringModel } from '../authoring/compiler.js';

const baseDashboard = {
  id: 'dash-1',
  name: 'Sales Board',
};

const baseModel = {
  schemaVersion: 1,
  meta: {
    title: 'Sales Board',
    description: 'Q1 overview',
  },
  datasetBinding: {
    id: 'dataset-1',
    source: {
      type: 'api',
      baseUrl: 'https://example.com',
      method: 'GET',
      headers: [],
      queryParams: [],
      responsePath: 'data.items',
      refreshInterval: null,
    },
  },
  semanticLayer: {
    enabled: true,
    metrics: [{ id: 'revenue', label: 'Revenue' }],
    dimensions: [{ id: 'region', label: 'Region' }],
  },
  widgets: [
    {
      id: 'kpi-1',
      panelType: 'viz',
      vizType: 'kpi',
      title: 'Revenue',
      subtitle: '',
      encodings: { value: 'revenue' },
      options: {},
      layout: { x: 1, y: 1, w: 3, h: 1 },
    },
    {
      id: 'filter-1',
      panelType: 'viz',
      vizType: 'filterBar',
      title: 'Filters',
      subtitle: '',
      encodings: { fields: ['region'] },
      options: { layout: 'inline' },
      layout: { x: 1, y: 2, w: 12, h: 1 },
    },
  ],
  layout: [
    { id: 'kpi-1', x: 1, y: 1, w: 3, h: 1 },
    { id: 'filter-1', x: 1, y: 2, w: 12, h: 1 },
  ],
};

describe('compileAuthoringModel', () => {
  it('builds a runtime config snapshot', () => {
    const compiled = compileAuthoringModel({
      dashboard: baseDashboard,
      authoringModel: baseModel,
    });

    expect(compiled.config).toMatchInlineSnapshot(`
      {
        "datasetId": "dataset-1",
        "id": "dash-1",
        "panels": [
          {
            "datasetId": "dataset-1",
            "encodings": {
              "comparison": "",
              "trend": "",
              "value": "revenue",
            },
            "id": "kpi-1",
            "layout": {
              "h": 1,
              "w": 3,
              "x": 1,
              "y": 1,
            },
            "options": {
              "caption": "",
              "currency": "USD",
              "format": "number",
              "label": "",
            },
            "panelType": "viz",
            "query": {
              "dimensions": [],
              "measures": [
                "revenue",
              ],
            },
            "subtitle": "",
            "title": "Revenue",
            "vizType": "kpi",
          },
          {
            "datasetId": "dataset-1",
            "encodings": {
              "fields": [
                "region",
              ],
            },
            "id": "filter-1",
            "layout": {
              "h": 1,
              "w": 12,
              "x": 1,
              "y": 2,
            },
            "options": {
              "allowMultiSelect": true,
              "layout": "inline",
              "showClear": true,
              "showSearch": true,
            },
            "panelType": "viz",
            "query": {
              "dimensions": [],
              "measures": [],
            },
            "subtitle": "",
            "title": "Filters",
            "vizType": "filterBar",
          },
        ],
        "subtitle": "Q1 overview",
        "title": "Sales Board",
      }
    `);
  });

  it('omits semantic layer modules when disabled', () => {
    const compiled = compileAuthoringModel({
      dashboard: baseDashboard,
      authoringModel: {
        ...baseModel,
        semanticLayer: {
          enabled: false,
          metrics: [],
          dimensions: [],
        },
      },
    });

    expect(compiled.modules.dataset).toBeNull();
    expect(compiled.modules.metrics).toBeNull();
    expect(compiled.modules.dimensions).toBeNull();
    expect(compiled.modules.dataProvider).not.toBeNull();
  });
});
