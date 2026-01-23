import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import GridLayout from '../../framework/core/layout/GridLayout.jsx';
import Panel from '../../framework/core/layout/Panel.jsx';
import VizRenderer from '../../framework/core/viz/VizRenderer.jsx';
import { buildQuerySpec } from '../../framework/core/query/buildQuerySpec.js';
import { useQuery } from '../../framework/core/query/useQuery.js';
import { MockDataProvider } from '../../framework/core/query/MockDataProvider.js';
import InsightsPanel from '../../framework/core/insights/InsightsPanel.jsx';
import { useInsights } from '../../framework/core/insights/useInsights.js';
import DashboardProvider from '../../framework/core/dashboard/DashboardProvider.jsx';
import { useDashboardActions } from '../../framework/core/dashboard/useDashboardActions.js';
import { useDashboardState } from '../../framework/core/dashboard/useDashboardState.js';
import {
  buildCrossFilterSelectionFromEvent,
  isSelectionDuplicate,
} from '../../framework/core/interactions/crossFilter.js';
import {
  buildDrilldownEntryFromEvent,
  isDrilldownDuplicate,
  applyDrilldownToDimensions,
} from '../../framework/core/interactions/drilldown.js';
import DrillBreadcrumbs from '../../framework/core/interactions/DrillBreadcrumbs.jsx';
import {
  buildBrushFilter,
  formatBrushRangeLabel,
  getBrushRange,
  removeBrushFilter,
  upsertBrushFilter,
} from '../../framework/core/interactions/brushZoom.js';
import exampleDashboard from '../dashboards/example/example.dashboard.js';
import ExampleFilterBar from '../dashboards/example/ExampleFilterBar.jsx';
import '../dashboards/example/example.css';

const buildDefaultRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  const toValue = (date) => date.toISOString().slice(0, 10);
  return [toValue(start), toValue(end)];
};

const VizPanel = ({ panelConfig }) => {
  const dashboardState = useDashboardState();
  const { addSelection, pushDrillPath, setPanelState, setGlobalFilters } =
    useDashboardActions();
  const brushDebounceRef = useRef(null);

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
  const panelStateById = dashboardState.panelStateById;
  const globalFilters = dashboardState.globalFilters;

  const drilldownConfig = panelConfig.interactions?.drilldown;
  const drilldownDimension =
    typeof drilldownConfig === 'object' ? drilldownConfig.dimension : null;
  const drilldownTo =
    typeof drilldownConfig === 'object' ? drilldownConfig.to : null;

  const brushZoomConfig = panelConfig.interactions?.brushZoom;
  const brushZoomEnabled = Boolean(brushZoomConfig);
  const brushField =
    typeof brushZoomConfig === 'object' ? brushZoomConfig.field : null;
  const brushLabel =
    typeof brushZoomConfig === 'object' ? brushZoomConfig.label : 'Visible range';
  const brushApplyToGlobal =
    typeof brushZoomConfig === 'object' ? brushZoomConfig.applyToGlobal : false;
  const brushDebounceMs =
    typeof brushZoomConfig === 'object' && brushZoomConfig.debounceMs != null
      ? brushZoomConfig.debounceMs
      : 140;

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

  useEffect(() => {
    return () => {
      if (brushDebounceRef.current) {
        clearTimeout(brushDebounceRef.current);
      }
    };
  }, []);

  const handleBrushChange = useCallback(
    ({ startIndex, endIndex, data, dataKey }) => {
      if (!brushZoomEnabled) {
        return;
      }
      const range = getBrushRange({
        data,
        startIndex,
        endIndex,
        xKey: dataKey,
      });
      if (!range) {
        return;
      }
      if (brushDebounceRef.current) {
        clearTimeout(brushDebounceRef.current);
      }
      brushDebounceRef.current = setTimeout(() => {
        setPanelState(panelConfig.id, { brush: range });
      }, brushDebounceMs);
    },
    [brushDebounceMs, brushZoomEnabled, panelConfig.id, setPanelState]
  );

  const handlers = useMemo(() => {
    const nextHandlers = {};
    if (crossFilterConfig || drilldownConfig) {
      nextHandlers.onClick = (event) => {
        if (crossFilterConfig) {
          handleCrossFilterClick(event);
        }
        if (drilldownConfig) {
          handleDrilldownClick(event);
        }
      };
    }
    if (brushZoomEnabled) {
      nextHandlers.onBrushChange = handleBrushChange;
    }
    return nextHandlers;
  }, [
    crossFilterConfig,
    drilldownConfig,
    handleCrossFilterClick,
    handleDrilldownClick,
    brushZoomEnabled,
    handleBrushChange,
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

  const brushState = panelStateById[panelConfig.id]?.brush || null;
  const brushRangeLabel = formatBrushRangeLabel(brushState);
  const brushFieldKey = brushField || resolvedEncodings?.x;

  const handleBrushReset = useCallback(() => {
    if (!brushZoomEnabled) {
      return;
    }
    setPanelState(panelConfig.id, { brush: null });
    if (brushApplyToGlobal && brushFieldKey) {
      setGlobalFilters(removeBrushFilter(globalFilters, brushFieldKey));
    }
  }, [
    brushApplyToGlobal,
    brushFieldKey,
    brushZoomEnabled,
    globalFilters,
    panelConfig.id,
    setGlobalFilters,
    setPanelState,
  ]);

  const handleBrushApply = useCallback(() => {
    if (!brushApplyToGlobal || !brushState || !brushFieldKey) {
      return;
    }
    const filter = buildBrushFilter({
      field: brushFieldKey,
      range: brushState,
    });
    if (!filter) {
      return;
    }
    setGlobalFilters(upsertBrushFilter(globalFilters, filter));
  }, [
    brushApplyToGlobal,
    brushFieldKey,
    brushState,
    globalFilters,
    setGlobalFilters,
  ]);

  const panelFooter = brushZoomEnabled ? (
    <div className="radf-brush">
      <div className="radf-brush__range">
        <span className="radf-brush__label">{brushLabel}</span>
        <span className="radf-brush__value">{brushRangeLabel}</span>
      </div>
      <div className="radf-brush__actions">
        {brushState ? (
          <button
            className="radf-brush__button"
            type="button"
            onClick={handleBrushReset}
          >
            Reset
          </button>
        ) : null}
        {brushApplyToGlobal ? (
          <button
            className="radf-brush__button radf-brush__button--primary"
            type="button"
            onClick={handleBrushApply}
            disabled={!brushState}
          >
            Apply to global range
          </button>
        ) : null}
      </div>
    </div>
  ) : null;

  const isEmpty = !loading && !error && (!data || data.length === 0);
  const status = loading ? 'loading' : error ? 'error' : 'ready';
  const chartOptions = useMemo(
    () => ({
      ...panelConfig.options,
      brush: brushZoomEnabled
        ? {
            enabled: true,
            startIndex: brushState?.startIndex,
            endIndex: brushState?.endIndex,
          }
        : undefined,
    }),
    [brushState?.endIndex, brushState?.startIndex, brushZoomEnabled, panelConfig.options]
  );

  return (
    <Panel
      title={panelConfig.title}
      subtitle={panelConfig.subtitle}
      status={status}
      error={error}
      isEmpty={isEmpty}
      emptyMessage="No data returned for this panel."
      footer={panelFooter}
    >
      <VizRenderer
        vizType={panelConfig.vizType}
        data={data || []}
        encodings={resolvedEncodings}
        options={chartOptions}
        handlers={handlers}
      />
    </Panel>
  );
};

const InsightsPanelContainer = ({ panelConfig }) => {
  const dashboardState = useDashboardState();

  const querySpec = useMemo(
    () => buildQuerySpec(panelConfig, dashboardState),
    [panelConfig, dashboardState]
  );

  const { data, meta, loading, error } = useQuery(querySpec, {
    provider: MockDataProvider,
  });

  const { insights } = useInsights({
    rows: data || [],
    meta,
    querySpec,
    dashboardState,
  });

  const isEmpty = !loading && !error && insights.length === 0;
  const status = loading ? 'loading' : error ? 'error' : 'ready';

  return (
    <Panel
      title={panelConfig.title}
      subtitle={panelConfig.subtitle}
      status={status}
      error={error}
      isEmpty={isEmpty}
      emptyMessage="No insights available for this panel."
    >
      <InsightsPanel insights={insights} />
    </Panel>
  );
};

const DashboardContent = () => {
  const { drillPath } = useDashboardState();
  const { popDrillPath } = useDashboardActions();

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

  const panels = useMemo(() => exampleDashboard.panels, []);

  return (
    <section className="radf-dashboard radf-example-dashboard">
      <header className="radf-example-dashboard__header">
        <h1 className="radf-dashboard__title">{exampleDashboard.title}</h1>
        <p className="radf-example-dashboard__subtitle">
          {exampleDashboard.subtitle}
        </p>
      </header>
      <ExampleFilterBar dateField={exampleDashboard.dateField} />
      <DrillBreadcrumbs
        drillPath={drillPath}
        onCrumbClick={handleCrumbClick}
        onReset={() =>
          Array.from({ length: drillPath.length }).forEach(() => popDrillPath())
        }
      />
      <GridLayout
        panels={panels}
        renderPanel={(panel) => (
          panel.panelType === 'viz' ? (
            <VizPanel panelConfig={panel} />
          ) : panel.panelType === 'insights' ? (
            <InsightsPanelContainer panelConfig={panel} />
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
  const [defaultStart, defaultEnd] = buildDefaultRange(14);

  return (
    <DashboardProvider
      initialState={{
        dashboardId: exampleDashboard.id,
        datasetId: exampleDashboard.datasetId,
        globalFilters: [
          {
            field: exampleDashboard.dateField,
            op: 'BETWEEN',
            values: [defaultStart, defaultEnd],
          },
        ],
      }}
    >
      <DashboardContent />
    </DashboardProvider>
  );
}

export default DashboardPage;
