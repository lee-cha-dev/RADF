import React from 'react';
import GridLayout from '../../framework/core/layout/GridLayout.jsx';
import Panel from '../../framework/core/layout/Panel.jsx';

function DashboardPage() {
  const panels = [
    {
      id: 'overview',
      title: 'Framework Loaded',
      subtitle: 'Layout panels are ready for dashboard configs.',
      layout: { x: 1, y: 1, w: 8, h: 1 },
      status: 'ready',
      content: (
        <p className="radf-dashboard__subtitle">
          The RADF shell is ready. Future feature branches will plug in dashboards,
          queries, and interactions here.
        </p>
      ),
    },
    {
      id: 'loading',
      title: 'Loading Example',
      subtitle: 'Panels share consistent chrome.',
      layout: { x: 9, y: 1, w: 4, h: 1 },
      status: 'loading',
      content: null,
    },
    {
      id: 'empty',
      title: 'Empty Example',
      subtitle: 'No data yet.',
      layout: { x: 1, y: 2, w: 6, h: 1 },
      status: 'empty',
      content: null,
    },
    {
      id: 'error',
      title: 'Error Example',
      subtitle: 'Handle failures gracefully.',
      layout: { x: 7, y: 2, w: 6, h: 1 },
      status: 'error',
      error: new Error('Unable to load data.'),
      content: null,
    },
  ];

  return (
    <section className="radf-dashboard">
      <h1 className="radf-dashboard__title">Dashboard Layout Preview</h1>
      <GridLayout
        panels={panels}
        renderPanel={(panel) => (
          <Panel
            title={panel.title}
            subtitle={panel.subtitle}
            status={panel.status}
            error={panel.error}
          >
            {panel.content}
          </Panel>
        )}
      />
    </section>
  );
}

export default DashboardPage;
