import React, { useEffect, useMemo, useState } from 'react';
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

const DashboardContent = ({ theme, onToggleTheme }) => (
  <section className="radf-dashboard">
    <header className="consumer-dashboard__header">
      <div>
        <h1 className="radf-dashboard__title">{dashboardConfig.title}</h1>
        <p className="radf-dashboard__subtitle">{dashboardConfig.subtitle}</p>
      </div>
      <button
        className="consumer-dashboard__theme-toggle"
        type="button"
        onClick={onToggleTheme}
        aria-pressed={theme === 'dark'}
      >
        {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
      </button>
    </header>
    <GridLayout
      panels={dashboardConfig.panels}
      renderPanel={(panel) => <VizPanel key={panel.id} panel={panel} />}
    />
  </section>
);

const App = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    registerCharts();
    registerInsights();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('radf-theme-dark', 'radf-theme-light');
    root.classList.add(`radf-theme-${theme}`);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <DashboardProvider
      initialState={{
        dashboardId: dashboardConfig.id,
        datasetId: dashboardConfig.datasetId,
      }}
    >
      <DashboardContent theme={theme} onToggleTheme={handleToggleTheme} />
    </DashboardProvider>
  );
};

export default App;
