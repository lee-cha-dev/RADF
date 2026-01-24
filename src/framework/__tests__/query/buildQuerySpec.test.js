import { describe, it, expect } from 'vitest';
import { buildQuerySpec } from '../../core/query/buildQuerySpec';

describe('buildQuerySpec', () => {
  it('builds a query spec with defaults and drilldown dimensions', () => {
    const panelConfig = {
      id: 'panel-1',
      datasetId: 'sales_dataset',
      query: {
        measures: ['total_revenue'],
        dimensions: ['order_month'],
        filters: { field: 'channel', op: 'IN', values: ['Online'] },
      },
      interactions: {
        drilldown: { dimension: 'order_month', to: 'order_day' },
      },
    };

    const dashboardState = {
      datasetId: 'fallback_dataset',
      timeRange: 'last_30_days',
      timezone: 'UTC',
      globalFilters: [{ field: 'region', op: 'IN', values: ['West'] }],
      selections: [
        {
          id: 'sel-1',
          filter: { field: 'segment', op: 'IN', values: ['Enterprise'] },
        },
      ],
      drillPath: [
        {
          dimension: 'order_month',
          to: 'order_day',
          value: '2024-01',
        },
      ],
    };

    const querySpec = buildQuerySpec(panelConfig, dashboardState);

    expect(querySpec).toEqual({
      datasetId: 'sales_dataset',
      measures: ['total_revenue'],
      dimensions: ['order_day'],
      filters: [
        { field: 'region', op: 'IN', values: ['West'] },
        { field: 'segment', op: 'IN', values: ['Enterprise'] },
        { field: 'order_month', op: 'IN', values: ['2024-01'] },
        { field: 'channel', op: 'IN', values: ['Online'] },
      ],
      timeRange: 'last_30_days',
      grain: null,
      sort: null,
      limit: null,
      offset: null,
      timezone: 'UTC',
      transforms: [],
    });
  });

  it('falls back to dashboard defaults when panel fields are missing', () => {
    const panelConfig = {
      id: 'panel-2',
      query: {},
    };

    const dashboardState = {
      datasetId: 'inventory_dataset',
      timeRange: 'last_7_days',
      timezone: 'America/Chicago',
    };

    const querySpec = buildQuerySpec(panelConfig, dashboardState);

    expect(querySpec).toEqual({
      datasetId: 'inventory_dataset',
      measures: [],
      dimensions: [],
      filters: [],
      timeRange: 'last_7_days',
      grain: null,
      sort: null,
      limit: null,
      offset: null,
      timezone: 'America/Chicago',
      transforms: [],
    });
  });
});
