import React, { useMemo } from 'react';
import GridLayout from '../../framework/core/layout/GridLayout.jsx';
import Panel from '../../framework/core/layout/Panel.jsx';
import VizRenderer from '../../framework/core/viz/VizRenderer.jsx';
import { buildQuerySpec } from '../../framework/core/query/buildQuerySpec.js';
import { useQuery } from '../../framework/core/query/useQuery.js';
import { MockDataProvider } from '../../framework/core/query/MockDataProvider.js';

const VizPanel = ({ panelConfig, dashboardState }) => {
  const querySpec = useMemo(
    () => buildQuerySpec(panelConfig, dashboardState),
    [panelConfig, dashboardState]
  );

  const { data, loading, error } = useQuery(querySpec, {
    provider: MockDataProvider,
  });

  const isEmpty = !loading && !error && (!data || data.length === 0);
  const status = loading ? 'loading' : error ? 'error' : 'ready';

  return (
    <Panel
      title={panelConfig.title}
      subtitle={panelConfig.subtitle}
      status={status}
      error={error}
      isEmpty={isEmpty}
      emptyMessage="No data returned for this panel."
    >
      <VizRenderer
        vizType={panelConfig.vizType}
        data={data || []}
        encodings={panelConfig.encodings}
        options={panelConfig.options}
        handlers={panelConfig.handlers}
      />
    </Panel>
  );
};

function DashboardPage() {
  const dashboardState = useMemo(
    () => ({
      datasetId: 'mock-dataset',
      globalFilters: [],
      selections: [],
      drillPath: [],
    }),
    []
  );

  const panels = useMemo(
    () => [
      {
        id: 'overview',
        panelType: 'content',
        title: 'Framework Loaded',
        subtitle: 'Viz registry and core charts are now wired.',
        layout: { x: 1, y: 1, w: 12, h: 1 },
        status: 'ready',
        content: (
          <p className="radf-dashboard__subtitle">
            Line and bar charts are registered in the viz registry and render using
            shared tooltip and legend styling.
          </p>
        ),
      },
      {
        id: 'trend',
        panelType: 'viz',
        title: 'Daily Metric Trend',
        subtitle: 'Mock data via the query layer.',
        layout: { x: 1, y: 2, w: 8, h: 2 },
        vizType: 'line',
        datasetId: 'mock-dataset',
        query: {
          measures: ['metric_value'],
          dimensions: ['date_day'],
        },
        encodings: { x: 'date_day', y: 'metric_value' },
        options: { tooltip: true, legend: false },
      },
      {
        id: 'breakdown',
        panelType: 'viz',
        title: 'Category Breakdown',
        subtitle: 'Mock categorical breakdown.',
        layout: { x: 9, y: 2, w: 4, h: 2 },
        vizType: 'bar',
        datasetId: 'mock-dataset',
        query: {
          measures: ['metric_value'],
          dimensions: ['category'],
        },
        encodings: { x: 'category', y: 'metric_value' },
        options: { tooltip: true, legend: false },
      },
    ],
    []
  );

  return (
    <section className="radf-dashboard">
      <h1 className="radf-dashboard__title">Dashboard Layout Preview</h1>
      <GridLayout
        panels={panels}
        renderPanel={(panel) => (
          panel.panelType === 'viz' ? (
            <VizPanel panelConfig={panel} dashboardState={dashboardState} />
          ) : (
            <Panel title={panel.title} subtitle={panel.subtitle} status={panel.status}>
              {panel.content}
            </Panel>
          )
        )}
      />
    </section>
  );
}

export default DashboardPage;
