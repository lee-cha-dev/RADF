/**
 * @fileoverview Vitest coverage for schema inference across mixed datasets.
 */

import { describe, expect, it } from 'vitest';
import { inferSchemaForTable } from '../data/schemaInference.js';

/**
 * @typedef {Object} InferenceTable
 * @property {Array<{ id: string }>} columns - The column descriptors.
 * @property {Array<Object>} rows - The row data.
 */

describe('schemaInference', () => {
  it('infers types, roles, and stats for mixed datasets', () => {
    /** @type {InferenceTable} */
    const table = {
      columns: [
        { id: 'amount' },
        { id: 'date' },
        { id: 'flag' },
        { id: 'mixed' },
      ],
      rows: [
        { amount: '$2,000', date: '2024-01-02', flag: 'true', mixed: '1' },
        { amount: '1200', date: '1/3/2024', flag: 'false', mixed: 'x' },
        { amount: '(3.50)', date: '01/04/2024', flag: 'yes', mixed: '2' },
        { amount: '10%', date: '2024/01/05', flag: 'no', mixed: 'y' },
        { amount: '8', date: '2024-01-06', flag: 'y', mixed: '3' },
        { amount: '11', date: '2024-01-07', flag: 'n', mixed: 'z' },
        { amount: '0', date: '2024-01-08', flag: 'true', mixed: '4' },
        { amount: '', date: '', flag: 'false', mixed: 'w' },
        { amount: '5', date: '2024-01-09', flag: 'true', mixed: '5' },
        { amount: '9', date: '2024-01-10', flag: 'false', mixed: 'v' },
      ],
    };

    const { columns } = inferSchemaForTable(table);
    const byId = new Map(columns.map((column) => [column.id, column]));

    expect(byId.get('amount').inferredType).toBe('number');
    expect(byId.get('amount').inferredRole).toBe('metric');
    expect(byId.get('amount').stats.min).toBe(-3.5);
    expect(byId.get('amount').stats.max).toBe(2000);
    expect(byId.get('amount').stats.nullRate).toBeGreaterThan(0);

    expect(byId.get('date').inferredType).toBe('date');
    expect(byId.get('date').inferredRole).toBe('dimension');

    expect(byId.get('flag').inferredType).toBe('bool');
    expect(byId.get('flag').inferredRole).toBe('dimension');

    expect(byId.get('mixed').inferredType).toBe('string');
  });
});
