/**
 * @fileoverview Vitest coverage for dashboard export planning and zip output.
 */

import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import {
  buildDashboardExport,
  createDashboardZip,
} from '../data/dashboardExport.js';

/**
 * @typedef {Object} ExportDashboardFixture
 * @property {string} id - The dashboard id.
 * @property {string} name - The dashboard name.
 */

/**
 * @typedef {Object} ExportAuthoringFixture
 * @property {number} schemaVersion - The authoring schema version.
 * @property {{ title: string, description: string }} meta - The dashboard metadata.
 * @property {{ id: string, source: { type: string, baseUrl: string, method: string, headers: Array<Object>, queryParams: Array<Object>, responsePath: string, refreshInterval: number|null } }} datasetBinding - The dataset binding.
 * @property {{ enabled: boolean, exportDatasetConfig: boolean, metrics: Array<Object>, dimensions: Array<Object> }} semanticLayer - The semantic layer settings.
 * @property {Array<Object>} widgets - The widget definitions.
 * @property {Array<Object>} layout - The layout placements.
 */

describe('dashboardExport', () => {
  it('builds export files and zip with expected structure', async () => {
    /** @type {ExportDashboardFixture} */
    const dashboard = { id: 'dash-1', name: 'Sales Ops' };
    /** @type {ExportAuthoringFixture} */
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
        exportDatasetConfig: true,
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

    const exportPlan = buildDashboardExport({
      dashboard,
      authoringModel,
      themeFamily: 'nord',
      themeMode: 'dark',
    });
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

    const componentSource = exportPlan.files[`${exportPlan.componentName}.jsx`];
    expect(componentSource).toContain('ladf-dashboard__toggle');
    expect(componentSource).toContain('DEFAULT_THEME_FAMILY = "default"');
    expect(componentSource).toContain('DEFAULT_THEME_MODE = "light"');
    expect(componentSource).toContain('EXPORTED_THEME_FAMILY = "nord"');
    expect(componentSource).toContain('EXPORTED_THEME_MODE = "dark"');

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

  it('includes per-datasource dataset modules', () => {
    const dashboard = { id: 'dash-2', name: 'Multi Source' };
    const authoringModel = {
      schemaVersion: 1,
      meta: { title: 'Multi Source', description: '' },
      datasources: [
        {
          id: 'sales',
          name: 'Sales',
          datasetBinding: {
            id: 'sales-1',
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
            enabled: true,
            exportDatasetConfig: true,
            metrics: [],
            dimensions: [],
          },
        },
        {
          id: 'inventory',
          name: 'Inventory',
          datasetBinding: {
            id: 'inventory-1',
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
            enabled: true,
            exportDatasetConfig: true,
            metrics: [],
            dimensions: [],
          },
        },
      ],
      widgets: [],
      layout: [],
    };

    const exportPlan = buildDashboardExport({
      dashboard,
      authoringModel,
      themeFamily: 'nord',
      themeMode: 'dark',
    });
    expect(exportPlan.files).toHaveProperty(
      `deps/${exportPlan.fileBase}.dataset.sales.js`
    );
    expect(exportPlan.files).toHaveProperty(
      `deps/${exportPlan.fileBase}.dataset.inventory.js`
    );
  });
});
