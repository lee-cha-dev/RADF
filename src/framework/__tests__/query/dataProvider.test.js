import { describe, expect, it } from 'vitest';
import {
  createDataProvider,
  createMultiDataProvider,
  isDataProvider,
  assertDataProvider,
} from '../../core/query/DataProvider.js';

describe('DataProvider utilities', () => {
  it('validates data providers', () => {
    const provider = createDataProvider(async () => ({ rows: [], meta: {} }));

    expect(isDataProvider(provider)).toBe(true);
    expect(() => assertDataProvider(provider)).not.toThrow();
    expect(isDataProvider({})).toBe(false);
    expect(() => assertDataProvider(null)).toThrow(/DataProvider/);
  });

  it('routes queries by dataset id with fallback', async () => {
    const salesProvider = createDataProvider(async () => ({ rows: [{ id: 1 }] }));
    const fallbackProvider = createDataProvider(async () => ({ rows: [{ id: 2 }] }));

    const multi = createMultiDataProvider(
      { sales: salesProvider },
      { defaultProvider: fallbackProvider }
    );

    const salesResult = await multi.execute({ datasetId: 'sales' }, { signal: new AbortController().signal });
    expect(salesResult.rows[0].id).toBe(1);

    const fallbackResult = await multi.execute({ datasetId: 'unknown' }, { signal: new AbortController().signal });
    expect(fallbackResult.rows[0].id).toBe(2);
  });

  it('throws when no provider matches', async () => {
    const multi = createMultiDataProvider({});

    await expect(
      multi.execute({ datasetId: 'missing' }, { signal: new AbortController().signal })
    ).rejects.toThrow(/No data provider/);
  });
});
