import { describe, it, expect } from 'vitest';
import {
  createDrilldownEntry,
  applyDrilldownToDimensions,
  isDrilldownDuplicate,
} from '../../core/interactions/drilldown';

describe('drilldown utilities', () => {
  it('creates a drilldown entry with filter and label', () => {
    const entry = createDrilldownEntry({
      panelId: 'panel-1',
      dimension: 'order_month',
      to: 'order_day',
      value: '2024-01',
    });

    expect(entry).toEqual({
      id: 'panel-1:order_month:2024-01',
      sourcePanelId: 'panel-1',
      dimension: 'order_month',
      to: 'order_day',
      value: '2024-01',
      label: 'order_month: 2024-01',
      filter: {
        field: 'order_month',
        op: 'IN',
        values: ['2024-01'],
      },
    });
  });

  it('applies drilldown paths to dimensions', () => {
    const dimensions = ['order_month', 'region'];
    const drillPath = [
      { dimension: 'order_month', to: 'order_day' },
      { dimension: 'region', to: 'city' },
    ];

    const nextDimensions = applyDrilldownToDimensions({
      dimensions,
      drillPath,
      drilldownConfig: { dimension: 'order_month', to: 'order_day' },
    });

    expect(nextDimensions).toEqual(['order_day', 'city']);
  });

  it('detects duplicate drilldown entries', () => {
    const entry = { id: 'panel-1:order_month:2024-01' };

    expect(isDrilldownDuplicate([entry], entry)).toBe(true);
  });
});
