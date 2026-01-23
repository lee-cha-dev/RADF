import React, { useCallback, useMemo } from 'react';
import GridLayout from '../../framework/core/layout/GridLayout.jsx';
import Panel from '../../framework/core/layout/Panel.jsx';
import VizRenderer from '../../framework/core/viz/VizRenderer.jsx';
import { buildQuerySpec } from '../../framework/core/query/buildQuerySpec.js';
import { useQuery } from '../../framework/core/query/useQuery.js';
import { MockDataProvider } from '../../framework/core/query/MockDataProvider.js';
import DashboardProvider from '../../framework/core/dashboard/DashboardProvider.jsx';
import { useDashboardActions } from '../../framework/core/dashboard/useDashboardActions.js';
import { useDashboardState } from '../../framework/core/dashboard/useDashboardState.js';
import {
  buildCrossFilterSelectionFromEvent,
  isSelectionDuplicate,
} from '../../framework/core/interactions/crossFilter.js';
import SelectionChips from '../../framework/core/interactions/SelectionChips.jsx';
import {
  buildDrilldownEntryFromEvent,
  isDrilldownDuplicate,
  applyDrilldownToDimensions,
} from '../../framework/core/interactions/drilldown.js';
import DrillBreadcrumbs from '../../framework/core/interactions/DrillBreadcrumbs.jsx';

const VizPanel = ({ panelConfig }) => {
  const dashboardState = useDashboardState();
  const { addSelection, pushDrillPath } = useDashboardActions();

  const querySpec = useMemo(
    () => buildQuerySpec(panelConfig, dashboardState),
    [panelConfig, dashboardState]
  );

  const { data, loading, error } = useQuery(querySpec, {
    provider: MockDataProvider,
  });

  const crossFilterConfig = panelConfig.interactions?.crossFilter;
  const crossFilterField =
    typeof crossFilterConfig === 'object' ? crossFilterConfig.field : null;
  const crossFilterLabel =
    typeof crossFilterConfig === 'object' ? crossFilterConfig.label : null;
  const selections = dashboardState.selections;
  const drillPath = dashboardState.drillPath;

  const drilldownConfig = panelConfig.interactions?.drilldown;
  const drilldownDimension =
    typeof drilldownConfig === 'object' ? drilldownConfig.dimension : null;
  const drilldownTo =
    typeof drilldownConfig === 'object' ? drilldownConfig.to : null;

  const handleCrossFilterClick = useCallback(
    (event) => {
      if (!crossFilterConfig) {
        return;
      }
      const selection = buildCrossFilterSelectionFromEvent({
        event,
        panelId: panelConfig.id,
        field: crossFilterField || panelConfig.encodings?.x,
        label: crossFilterLabel || panelConfig.title,
      });
      if (!selection) {
        return;
      }
      if (isSelectionDuplicate(selections, selection)) {
        return;
      }
      addSelection(selection);
    },
    [
      addSelection,
      crossFilterConfig,
      crossFilterField,
      crossFilterLabel,
      panelConfig.encodings?.x,
      panelConfig.id,
      panelConfig.title,
      selections,
    ]
  );

  const handleDrilldownClick = useCallback(
    (event) => {
      if (!drilldownConfig) {
        return;
      }
      const entry = buildDrilldownEntryFromEvent({
        event,
        panelId: panelConfig.id,
        dimension: drilldownDimension || panelConfig.encodings?.x,
        to: drilldownTo,
        label: panelConfig.title,
      });
      if (!entry) {
        return;
      }
      if (isDrilldownDuplicate(drillPath, entry)) {
        return;
      }
      pushDrillPath(entry);
    },
    [
      drillPath,
      drilldownConfig,
      drilldownDimension,
      drilldownTo,
      panelConfig.encodings?.x,
      panelConfig.id,
      panelConfig.title,
      pushDrillPath,
    ]
  );

  const handlers = useMemo(() => {
    if (!crossFilterConfig && !drilldownConfig) {
      return {};
    }
    return {
      onClick: (event) => {
        if (crossFilterConfig) {
          handleCrossFilterClick(event);
        }
        if (drilldownConfig) {
          handleDrilldownClick(event);
        }
      },
    };
  }, [
    crossFilterConfig,
    drilldownConfig,
    handleCrossFilterClick,
    handleDrilldownClick,
  ]);

  const resolvedEncodings = useMemo(() => {
    if (!panelConfig.encodings) {
      return panelConfig.encodings;
    }
    if (!drilldownConfig || !drillPath.length) {
      return panelConfig.encodings;
    }
    const [drilldownField] = applyDrilldownToDimensions({
      dimensions: [panelConfig.encodings.x],
      drillPath,
      drilldownConfig,
    });
    return {
      ...panelConfig.encodings,
      x: drilldownField,
    };
  }, [panelConfig.encodings, drillPath, drilldownConfig]);

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
        encodings={resolvedEncodings}
        options={panelConfig.options}
        handlers={handlers}
      />
    </Panel>
  );
};

const DashboardContent = () => {
  const { selections, drillPath } = useDashboardState();
  const { clearSelections, removeSelection, popDrillPath } = useDashboardActions();

  const handleCrumbClick = useCallback(
    (index) => {
      const pops = drillPath.length - 1 - index;
      if (pops <= 0) {
        return;
      }
      Array.from({ length: pops }).forEach(() => popDrillPath());
    },
    [drillPath.length, popDrillPath]
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
          dimensions: ['date_month'],
        },
        encodings: { x: 'date_month', y: 'metric_value' },
        options: { tooltip: true, legend: false },
        interactions: {
          drilldown: {
            dimension: 'date_month',
            to: 'date_day',
          },
        },
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
        interactions: {
          crossFilter: {
            field: 'category',
            label: 'Category',
          },
        },
      },
    ],
    []
  );

  return (
    <section className="radf-dashboard">
      <h1 className="radf-dashboard__title">Dashboard Layout Preview</h1>
      <DrillBreadcrumbs
        drillPath={drillPath}
        onCrumbClick={handleCrumbClick}
        onReset={() =>
          Array.from({ length: drillPath.length }).forEach(() => popDrillPath())
        }
      />
      <SelectionChips
        selections={selections}
        onClear={clearSelections}
        onRemove={removeSelection}
      />
      <GridLayout
        panels={panels}
        renderPanel={(panel) => (
          panel.panelType === 'viz' ? (
            <VizPanel panelConfig={panel} />
          ) : (
            <Panel title={panel.title} subtitle={panel.subtitle} status={panel.status}>
              {panel.content}
            </Panel>
          )
        )}
      />
    </section>
  );
};

function DashboardPage() {
  return (
    <DashboardProvider
      initialState={{
        dashboardId: 'overview',
        datasetId: 'mock-dataset',
        globalFilters: [],
      }}
    >
      <DashboardContent />
    </DashboardProvider>
  );
}

export default DashboardPage;
