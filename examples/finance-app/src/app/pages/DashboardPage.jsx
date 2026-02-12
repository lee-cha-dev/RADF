/**
 * @module app/pages/DashboardPage
 * @description Example dashboard page wiring LADF providers, interactions, and panels.
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  DashboardProvider,
  GridLayout,
  Panel,
  VizRenderer,
  MockDataProvider,
  useQuery,
  useDashboardActions,
  useDashboardState,
  dashboardSelectors,
  InsightsPanel,
  useInsights,
  DrillBreadcrumbs,
  buildCrossFilterSelectionFromEvent,
  isSelectionDuplicate,
  buildDrilldownEntryFromEvent,
  isDrilldownDuplicate,
  applyDrilldownToDimensions,
  buildBrushFilter,
  formatBrushRangeLabel,
  getBrushRange,
  removeBrushFilter,
  upsertBrushFilter,
  resolvePalette,
} from 'ladf';
import exampleDashboard from '../dashboards/example/example.dashboard.js';
import ExampleFilterBar from '../dashboards/example/ExampleFilterBar.jsx';
import '../dashboards/example/example.css';

/**
 * Build an ISO date range for a rolling window.
 * @param {number} days - Number of days to include in the window.
 * @returns {[string, string]} Tuple of ISO yyyy-mm-dd values.
 */
const buildDefaultRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  const toValue = (date) => date.toISOString().slice(0, 10);
  return [toValue(start), toValue(end)];
};

/**
 * @typedef {Object} VizPanelProps
 * @property {import('ladf').PanelConfig} panelConfig
 *   - Panel configuration for the visualization.
 */

/**
 * Render a single visualization panel with interactions wired to dashboard state.
 * @param {VizPanelProps} props
 * @returns {JSX.Element}
 */
const VizPanel = ({ panelConfig }) => {
  const dashboardState = useDashboardState();
  const { addSelection, pushDrillPath, setPanelState, setGlobalFilters } =
    useDashboardActions();
  const brushDebounceRef = useRef(null);

  const querySpec = useMemo(
    () => dashboardSelectors.selectDerivedQueryInputs(dashboardState, panelConfig),
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

  const panelPaletteClass = useMemo(() => {
    const palette = resolvePalette({
      panelConfig,
      vizType: panelConfig.vizType,
      encodings: resolvedEncodings,
      options: panelConfig.options,
      data,
    });
    return palette?.paletteClass ?? null;
  }, [data, panelConfig, resolvedEncodings]);

  const panelFooter = brushZoomEnabled ? (
    <div className="ladf-brush">
      <div className="ladf-brush__range">
        <span className="ladf-brush__label">{brushLabel}</span>
        <span className="ladf-brush__value">{brushRangeLabel}</span>
      </div>
      <div className="ladf-brush__actions">
        {brushState ? (
          <button
            className="ladf-brush__button"
            type="button"
            onClick={handleBrushReset}
          >
            Reset
          </button>
        ) : null}
        {brushApplyToGlobal ? (
          <button
            className="ladf-brush__button ladf-brush__button--primary"
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

  const isKpiPanel = panelConfig.vizType === 'kpi';

  return (
    <Panel
      title={panelConfig.title}
      subtitle={panelConfig.subtitle}
      className={panelPaletteClass}
      status={status}
      error={error}
      isEmpty={isEmpty}
      emptyMessage="No data returned for this panel."
      footer={panelFooter}
      hideHeader={isKpiPanel}
      chromeless={isKpiPanel}
    >
      <VizRenderer
        panelConfig={panelConfig}
        vizType={panelConfig.vizType}
        data={data || []}
        encodings={resolvedEncodings}
        options={chartOptions}
        handlers={handlers}
      />
    </Panel>
  );
};

/**
 * @typedef {Object} InsightsPanelContainerProps
 * @property {import('ladf').PanelConfig} panelConfig
 *   - Panel configuration for the insight renderer.
 */

/**
 * Render an insights panel using the insights engine and query pipeline.
 * @param {InsightsPanelContainerProps} props
 * @returns {JSX.Element}
 */
const InsightsPanelContainer = ({ panelConfig }) => {
  const dashboardState = useDashboardState();

  const querySpec = useMemo(
    () => dashboardSelectors.selectDerivedQueryInputs(dashboardState, panelConfig),
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

/**
 * Layout the dashboard header, filters, breadcrumbs, and panel grid.
 * @returns {JSX.Element}
 */
const DashboardContent = () => {
  const dashboardState = useDashboardState();
  const drillBreadcrumbs = useMemo(
    () => dashboardSelectors.selectDrillBreadcrumbs(dashboardState),
    [dashboardState]
  );
  const drillPath = useMemo(
    () => drillBreadcrumbs.map((crumb) => crumb.entry),
    [drillBreadcrumbs]
  );
  const { popDrillPath } = useDashboardActions();

  const handleCrumbClick = useCallback(
    (index) => {
      const pops = drillBreadcrumbs.length - 1 - index;
      if (pops <= 0) {
        return;
      }
      Array.from({ length: pops }).forEach(() => popDrillPath());
    },
    [drillBreadcrumbs.length, popDrillPath]
  );

  const panels = useMemo(() => exampleDashboard.panels, []);

  return (
    <section className="ladf-dashboard ladf-example-dashboard">
      <header className="ladf-example-dashboard__header">
        <h1 className="ladf-dashboard__title">{exampleDashboard.title}</h1>
        <p className="ladf-dashboard__subtitle">
          {exampleDashboard.subtitle}
        </p>
      </header>
      <ExampleFilterBar dateField={exampleDashboard.dateField} />
      <DrillBreadcrumbs
        drillPath={drillPath}
        onCrumbClick={handleCrumbClick}
        onReset={() =>
          Array.from({ length: drillBreadcrumbs.length }).forEach(() =>
            popDrillPath()
          )
        }
      />
      <GridLayout
        panels={panels}
        renderPanel={(panel) =>
          panel.panelType === 'viz' ? (
            <VizPanel panelConfig={panel} />
          ) : panel.panelType === 'insights' ? (
            <InsightsPanelContainer panelConfig={panel} />
          ) : (
            <Panel title={panel.title} subtitle={panel.subtitle} status={panel.status}>
              {panel.content}
            </Panel>
          )
        }
      />
    </section>
  );
};

/**
 * Example dashboard route demonstrating stateful filters, drilldowns, and insights.
 * @returns {JSX.Element}
 *
 * @example
 * <Route path="/dashboard" element={<DashboardPage />} />
 */
function DashboardPage() {
  const [defaultStart, defaultEnd] = buildDefaultRange(31);

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
