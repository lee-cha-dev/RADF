import React, { useCallback, useMemo, useRef, useEffect } from 'react';
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
import {
  buildBrushFilter,
  formatBrushRangeLabel,
  getBrushRange,
  removeBrushFilter,
  upsertBrushFilter,
} from '../../framework/core/interactions/brushZoom.js';

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
          brushZoom: {
            label: 'Visible date window',
            applyToGlobal: true,
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
