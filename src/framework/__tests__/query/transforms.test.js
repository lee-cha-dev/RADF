import { describe, expect, it } from 'vitest';
import { pivotRows } from '../../core/query/transforms/pivot.js';
import { rollingRows } from '../../core/query/transforms/rolling.js';
import { sortRows } from '../../core/query/transforms/sort.js';
import { yoyRows } from '../../core/query/transforms/yoy.js';

describe('query transforms', () => {
  it('pivots rows into wide format with fill values', () => {
    const rows = [
      { month: 'Jan', metric: 'A', value: 2 },
      { month: 'Jan', metric: 'B', value: 3 },
      { month: 'Feb', metric: 'A', value: 5 },
    ];

    const result = pivotRows(rows, {
      index: 'month',
      column: 'metric',
      value: 'value',
      fill: 0,
    });

    expect(result).toEqual([
      { month: 'Jan', A: 2, B: 3 },
      { month: 'Feb', A: 5, B: 0 },
    ]);
  });

  it('computes rolling averages with sorting', () => {
    const rows = [
      { date: 1, value: 2 },
      { date: 2, value: 4 },
      { date: 3, value: 6 },
    ];

    const result = rollingRows(rows, { field: 'value', window: 2, sortBy: 'date' });
    expect(result[1].value_rolling_2).toBe(3);
    expect(result[2].value_rolling_2).toBe(5);
  });

  it('sorts rows with custom comparator', () => {
    const rows = [{ id: 1, score: 3 }, { id: 2, score: 1 }];
    const sorted = sortRows(rows, {
      comparator: (left, right) => left.score - right.score,
    });

    expect(sorted.map((row) => row.id)).toEqual([2, 1]);
  });

  it('computes year-over-year deltas', () => {
    const rows = [
      { date: '2023-01-01', value: 100 },
      { date: '2024-01-01', value: 125 },
    ];

    const result = yoyRows(rows, { field: 'value', dateField: 'date', percent: false });
    expect(result[1].value_yoy).toBe(25);
  });

  it('returns null when YoY prior value is zero', () => {
    const rows = [
      { date: '2023-01-01', value: 0 },
      { date: '2024-01-01', value: 10 },
    ];

    const result = yoyRows(rows, { field: 'value', dateField: 'date', percent: true });
    expect(result[1].value_yoy).toBeNull();
  });
});
