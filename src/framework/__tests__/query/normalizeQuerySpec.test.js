import { describe, it, expect } from 'vitest';
import { normalizeQuerySpec } from '../../core/query/normalizeQuerySpec';

describe('normalizeQuerySpec', () => {
  it('sorts dimensions and measures and normalizes filter values', () => {
    const querySpec = {
      datasetId: 'sales',
      measures: ['revenue', 'orders'],
      dimensions: ['region', 'segment'],
      filters: [
        { field: 'segment', op: 'IN', values: ['Enterprise', 'SMB'] },
        { field: 'region', op: 'IN', values: ['West', 'East'] },
      ],
    };

    const normalized = normalizeQuerySpec({
      ...querySpec,
      measures: ['orders', 'revenue'],
      dimensions: ['segment', 'region'],
      filters: [
        { field: 'region', op: 'IN', values: ['East', 'West'] },
        { field: 'segment', op: 'IN', values: ['SMB', 'Enterprise'] },
      ],
    });

    expect(normalized.measures).toEqual(['orders', 'revenue']);
    expect(normalized.dimensions).toEqual(['region', 'segment']);
    expect(normalized.filters).toEqual([
      { field: 'region', op: 'IN', values: ['East', 'West'] },
      { field: 'segment', op: 'IN', values: ['Enterprise', 'SMB'] },
    ]);
  });

  it('produces stable output for semantically equivalent specs', () => {
    const specA = {
      datasetId: 'sales',
      measures: ['orders', 'revenue'],
      dimensions: ['segment', 'region'],
      filters: [
        { field: 'region', op: 'IN', values: ['West', 'East'] },
        { field: 'segment', op: 'IN', values: ['Enterprise', 'SMB'] },
      ],
    };

    const specB = {
      datasetId: 'sales',
      measures: ['revenue', 'orders'],
      dimensions: ['region', 'segment'],
      filters: [
        { field: 'segment', op: 'IN', values: ['SMB', 'Enterprise'] },
        { field: 'region', op: 'IN', values: ['East', 'West'] },
      ],
    };

    expect(normalizeQuerySpec(specA)).toEqual(normalizeQuerySpec(specB));
  });
});
