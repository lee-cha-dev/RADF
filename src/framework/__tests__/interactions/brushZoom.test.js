import { describe, it, expect } from 'vitest';
import {
  getBrushRange,
  buildBrushFilter,
  upsertBrushFilter,
  removeBrushFilter,
  formatBrushRangeLabel,
} from '../../core/interactions/brushZoom';

describe('brushZoom utilities', () => {
  const data = [
    { day: 'Mon', value: 10 },
    { day: 'Tue', value: 20 },
    { day: 'Wed', value: 30 },
  ];

  it('returns a normalized brush range with clamped indices', () => {
    const range = getBrushRange({ data, startIndex: 2, endIndex: 0, xKey: 'day' });

    expect(range).toEqual({
      startIndex: 0,
      endIndex: 2,
      startValue: 'Mon',
      endValue: 'Wed',
    });
  });

  it('builds a brush filter and upserts/removes it', () => {
    const range = getBrushRange({ data, startIndex: 0, endIndex: 1, xKey: 'day' });
    const brushFilter = buildBrushFilter({ field: 'day', range });

    expect(brushFilter).toEqual({
      field: 'day',
      op: 'BETWEEN',
      values: ['Mon', 'Tue'],
    });

    const filters = upsertBrushFilter([{ field: 'region', op: 'IN', values: ['West'] }], brushFilter);

    expect(filters).toEqual([
      { field: 'region', op: 'IN', values: ['West'] },
      { field: 'day', op: 'BETWEEN', values: ['Mon', 'Tue'] },
    ]);

    expect(removeBrushFilter(filters, 'day')).toEqual([
      { field: 'region', op: 'IN', values: ['West'] },
    ]);
  });

  it('formats brush labels for ranges', () => {
    const range = getBrushRange({ data, startIndex: 1, endIndex: 1, xKey: 'day' });

    expect(formatBrushRangeLabel(range)).toBe('Tue');
    expect(formatBrushRangeLabel(null)).toBe('Full range');
  });
});
