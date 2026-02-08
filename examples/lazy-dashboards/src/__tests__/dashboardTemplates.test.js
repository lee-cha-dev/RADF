import { describe, expect, it } from 'vitest';
import {
  applyTemplateBindings,
  buildTemplateAuthoringModel,
  getTemplatePreview,
} from '../data/dashboardTemplates.js';

describe('dashboardTemplates', () => {
  it('builds template models with matching layout entries', () => {
    const model = buildTemplateAuthoringModel('kpi-overview', {
      includeFilterBar: true,
    });

    expect(model.widgets.length).toBeGreaterThan(0);
    expect(model.layout.length).toBe(model.widgets.length);
    expect(model.widgets[0].vizType).toBe('filterBar');
    expect(getTemplatePreview('kpi-overview', true).length).toBeGreaterThan(0);
  });

  it('applies bindings based on dataset columns', () => {
    const model = buildTemplateAuthoringModel('kpi-overview');
    const bound = applyTemplateBindings(model, [
      { id: 'revenue', type: 'number', role: 'metric', stats: { distinctCount: 5 } },
      { id: 'orders', type: 'number', role: 'metric', stats: { distinctCount: 5 } },
      { id: 'region', type: 'string', role: 'dimension', stats: { distinctCount: 4 } },
      { id: 'date', type: 'date', role: 'dimension', stats: { distinctCount: 30 } },
    ]);

    const kpi = bound.widgets.find((widget) => widget.vizType === 'kpi');
    expect(kpi.encodings.value).toBe('revenue');

    const table = bound.widgets.find((widget) => widget.vizType === 'table');
    expect(table.encodings.columns.length).toBeGreaterThan(0);
  });
});
