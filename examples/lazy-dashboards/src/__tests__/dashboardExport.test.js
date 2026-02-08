import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import {
  buildDashboardExport,
  createDashboardZip,
} from '../data/dashboardExport.js';

describe('dashboardExport', () => {
  it('builds export files and zip with expected structure', async () => {
    const dashboard = { id: 'dash-1', name: 'Sales Ops' };
    const authoringModel = {
      schemaVersion: 1,
      meta: { title: 'Sales Ops', description: '' },
      datasetBinding: {
        id: 'dataset-1',
        source: {
          type: 'api',
          baseUrl: 'https://example.com',
          method: 'GET',
          headers: [],
          queryParams: [],
          responsePath: 'data.items',
          refreshInterval: null,
        },
      },
      semanticLayer: {
        enabled: false,
        metrics: [],
        dimensions: [],
      },
      widgets: [
        {
          id: 'filter-1',
          panelType: 'viz',
          vizType: 'filterBar',
          title: 'Filters',
          subtitle: '',
          encodings: { fields: ['region'] },
          options: {},
          layout: { x: 1, y: 1, w: 12, h: 1 },
        },
      ],
      layout: [{ id: 'filter-1', x: 1, y: 1, w: 12, h: 1 }],
    };

    const exportPlan = buildDashboardExport({ dashboard, authoringModel });
    expect(exportPlan).not.toBeNull();
    expect(exportPlan.files).toHaveProperty(
      `deps/${exportPlan.fileBase}.dashboard.js`
    );
    expect(exportPlan.files).toHaveProperty(
      `deps/${exportPlan.fileBase}.dataset.js`
    );
    expect(exportPlan.files).toHaveProperty(
      `deps/${exportPlan.fileBase}.dimensions.js`
    );
    expect(exportPlan.files).toHaveProperty(
      `deps/${exportPlan.fileBase}.metrics.js`
    );
    expect(exportPlan.files).toHaveProperty(
      `deps/${exportPlan.fileBase}.dataProvider.js`
    );
    expect(exportPlan.files).toHaveProperty('utils/LazyFilterBar.jsx');
    expect(exportPlan.files).toHaveProperty(`${exportPlan.componentName}.jsx`);

    const zipBlob = await createDashboardZip(exportPlan);
    const zip = await JSZip.loadAsync(zipBlob);
    const files = Object.keys(zip.files);
    expect(files).toContain(
      `${exportPlan.folderName}/deps/${exportPlan.fileBase}.dashboard.js`
    );
    expect(files).toContain(
      `${exportPlan.folderName}/utils/LazyFilterBar.jsx`
    );
    expect(files).toContain(
      `${exportPlan.folderName}/${exportPlan.componentName}.jsx`
    );
  });
});
