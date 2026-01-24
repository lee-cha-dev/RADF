import React, { useEffect, useMemo } from 'react';
import {
  DashboardProvider,
  GridLayout,
  Panel,
  VizRenderer,
  buildQuerySpec,
  registerCharts,
  registerInsights,
  useDashboardState,
  useQuery,
  MockDataProvider,
} from 'radf';
import dashboardConfig from './dashboard.config.js';

const VizPanel = ({ panel }) => {
  const dashboardState = useDashboardState();
  const querySpec = useMemo(
    () => buildQuerySpec(panel, dashboardState),
    [panel, dashboardState]
  );

  const { data, loading, error } = useQuery(querySpec, {
    provider: MockDataProvider,
  });

  const isEmpty = !loading && !error && (!data || data.length === 0);
  const status = loading ? 'loading' : error ? 'error' : 'ready';

  return (
    <Panel
      title={panel.title}
      subtitle={panel.subtitle}
      status={status}
      error={error}
      isEmpty={isEmpty}
      emptyMessage="No data returned for this panel."
    >
      <VizRenderer
        vizType={panel.vizType}
        data={data || []}
        encodings={panel.encodings}
        options={panel.options}
      />
    </Panel>
  );
};

const DashboardContent = () => (
  <section className="radf-dashboard">
    <h1 className="radf-dashboard__title">{dashboardConfig.title}</h1>
    <p className="radf-dashboard__subtitle">{dashboardConfig.subtitle}</p>
    <GridLayout
      panels={dashboardConfig.panels}
      renderPanel={(panel) => <VizPanel key={panel.id} panel={panel} />}
    />
  </section>
);

const App = () => {
  useEffect(() => {
    registerCharts();
    registerInsights();

    const root = document.documentElement;
    root.classList.remove('radf-theme-dark');
    root.classList.add('radf-theme-light');
  }, []);

  return (
    <DashboardProvider
      initialState={{
        dashboardId: dashboardConfig.id,
        datasetId: dashboardConfig.datasetId,
      }}
    >
      <DashboardContent />
    </DashboardProvider>
  );
};

export default App;
