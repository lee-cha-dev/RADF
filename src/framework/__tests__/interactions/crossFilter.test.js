import { describe, it, expect } from 'vitest';
import {
  createCrossFilterSelection,
  getCrossFilterValueFromEvent,
  buildCrossFilterSelectionFromEvent,
  isSelectionDuplicate,
} from '../../core/interactions/crossFilter';

describe('crossFilter utilities', () => {
  it('creates a selection with a label and filter values', () => {
    const selection = createCrossFilterSelection({
      panelId: 'panel-1',
      field: 'region',
      value: ['West', 'East'],
      label: 'Region',
    });

    expect(selection).toEqual({
      id: 'panel-1:region:West|East',
      sourcePanelId: 'panel-1',
      label: 'Region: West, East',
      filter: {
        field: 'region',
        op: 'IN',
        values: ['West', 'East'],
      },
    });
  });

  it('maps event payloads to values consistently', () => {
    const payloadEvent = { payload: { region: 'West' } };
    const nestedEvent = { payload: { payload: { region: 'East' } } };
    const activePayloadEvent = { activePayload: [{ payload: { region: 'Central' } }] };
    const activeLabelEvent = { activeLabel: 'North', activeLabelField: 'region' };

    expect(getCrossFilterValueFromEvent(payloadEvent, 'region')).toBe('West');
    expect(getCrossFilterValueFromEvent(nestedEvent, 'region')).toBe('East');
    expect(getCrossFilterValueFromEvent(activePayloadEvent, 'region')).toBe('Central');
    expect(getCrossFilterValueFromEvent(activeLabelEvent, 'region')).toBe('North');
  });

  it('builds selections from events and detects duplicates', () => {
    const selection = buildCrossFilterSelectionFromEvent({
      event: { payload: { region: 'South' } },
      panelId: 'panel-2',
      field: 'region',
    });

    expect(selection).toMatchObject({
      id: 'panel-2:region:South',
      filter: {
        field: 'region',
        op: 'IN',
        values: ['South'],
      },
    });

    expect(isSelectionDuplicate([selection], selection)).toBe(true);
  });
});
