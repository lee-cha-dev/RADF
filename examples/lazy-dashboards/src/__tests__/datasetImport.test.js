import { describe, expect, it } from 'vitest';
import {
  parseCsvText,
  parseRowMatrix,
} from '../data/datasetImport.js';

describe('datasetImport', () => {
  it('parses csv with quoted fields and sanitizes headers', () => {
    const text =
      'Name,,Name,Amount\n' +
      '"Alice","Smith, Jr",Alice,10\n' +
      'Bob,,Bob,20\n';
    const table = parseCsvText(text, { maxRows: 10, previewRows: 1 });

    expect(table.columns.map((column) => column.id)).toEqual([
      'name',
      'column_2',
      'name_2',
      'amount',
    ]);
    expect(table.sanitizedHeaders).toBe(true);
    expect(table.rows[0].name).toBe('Alice');
    expect(table.rows[0].column_2).toBe('Smith, Jr');
    expect(table.rows[1].amount).toBe('20');
  });

  it('flags inconsistent rows in xlsx-style matrices', () => {
    const rows = [['A', 'B'], ['1'], ['2', '3', '4']];
    const table = parseRowMatrix(rows, { maxRows: 10, previewRows: 1 });

    expect(table.expectedColumnCount).toBe(2);
    expect(table.inconsistentRowCount).toBe(2);
  });

  it('truncates large datasets when maxRows is exceeded', () => {
    const rows = [['A'], ['1'], ['2'], ['3']];
    const table = parseRowMatrix(rows, { maxRows: 2, previewRows: 1 });

    expect(table.truncated).toBe(true);
    expect(table.rowCount).toBe(2);
    expect(table.rawRowCount).toBe(3);
  });

  it('throws on unterminated quotes', () => {
    expect(() => parseCsvText('name\n"Alice', {})).toThrow(
      /unterminated quote/i
    );
  });
});
