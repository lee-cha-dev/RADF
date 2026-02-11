import { describe, expect, it } from 'vitest';
import { InsightEngine } from '../../core/insights/InsightEngine.js';
import trendAnalyzer from '../../core/insights/analyzers/trend.js';

describe('InsightEngine', () => {
  it('normalizes analyzer outputs into insights', () => {
    const analyzer = {
      id: 'test',
      label: 'Test Analyzer',
      analyze: () => ({
        title: 'Test insight',
        severity: 'info',
        narrative: 'Hello',
        evidence: 'value',
      }),
    };

    const insights = InsightEngine.analyze({
      rows: [],
      analyzers: [analyzer],
    });

    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      id: 'test-0-0',
      title: 'Test insight',
      severity: 'info',
      narrative: 'Hello',
      evidence: ['value'],
      source: 'test',
    });
  });

  it('ignores invalid analyzers', () => {
    const insights = InsightEngine.analyze({
      rows: [],
      analyzers: [null],
    });

    expect(insights).toEqual([]);
  });

  it('produces a trend insight when values change', () => {
    const insights = InsightEngine.analyze({
      rows: [
        { date: '2024-01-01', revenue: 10 },
        { date: '2024-01-02', revenue: 20 },
      ],
      querySpec: { measures: ['revenue'] },
      analyzers: [trendAnalyzer],
    });

    expect(insights[0]).toMatchObject({
      title: 'Trend is upward',
      severity: 'positive',
    });
  });
});
