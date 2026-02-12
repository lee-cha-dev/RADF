import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  DashboardProvider,
  ErrorBoundary,
  GridLayout,
  Panel,
  VizRenderer,
  buildQuerySpec,
  useDashboardState,
  useQuery,
} from 'ladf';
import { updateWidgetInModel } from '../../authoring/authoringModel.js';
import LazyFilterBar from '../LazyFilterBar.jsx';

const GRID_COLUMNS = 12;
const GRID_ROWS = 24;
const GRID_GAP = 12;
const GRID_ROW_HEIGHT = 48;
const DEFAULT_LAYOUT = { x: 1, y: 1, w: 4, h: 2 };

/**
 * @typedef {Object} GridCanvasProps
 * @property {string} dashboardId
 * @property {Object} compiledConfig
 * @property {{ widgets: Object[] }} authoringModel
 * @property {Object} validation
 * @property {string|null} activeWidgetId
 * @property {(widgetId: string) => void} onWidgetSelect
 * @property {(updater: (model: Object) => Object) => void} onUpdateAuthoringModel
 * @property {Object} previewProvider
 * @property {Object[]} datasources
 * @property {Map<string, Object>} previewDatasourceBindings
 * @property {() => void} onAddWidget
 * @property {'layout'|'preview'} viewMode
 * @property {(mode: 'layout'|'preview') => void} onViewModeChange
 */

const getSafeLayout = (layout) => ({
  ...DEFAULT_LAYOUT,
  ...(layout || {}),
});

/**
 * Canvas area for arranging and previewing dashboard widgets.
 *
 * @param {GridCanvasProps} props
 * @returns {JSX.Element}
 */
const GridCanvas = ({
  dashboardId,
  compiledConfig,
  authoringModel,
  validation,
  activeWidgetId,
  onWidgetSelect,
  onUpdateAuthoringModel,
  previewProvider,
  datasources,
  previewDatasourceBindings,
  onAddWidget,
  viewMode,
  onViewModeChange,
}) => {
  const gridRef = useRef(null);
  const interactionRef = useRef(null);
  const widgets = authoringModel?.widgets || [];
  const widgetValidation = validation?.widgets || {};
  const resolvedMode = viewMode === 'preview' ? 'preview' : 'layout';
  const datasourceMap = useMemo(
    () => new Map((datasources || []).map((datasource) => [datasource.id, datasource])),
    [datasources]
  );
  const defaultDatasourceId = compiledConfig?.datasetId || datasources?.[0]?.id || null;

  const gridClasses = (layout) => {
    const safeLayout = getSafeLayout(layout);
    const width = Math.min(Math.max(safeLayout.w, 1), GRID_COLUMNS);
    const height = Math.min(Math.max(safeLayout.h, 1), GRID_ROWS);
    const maxX = GRID_COLUMNS - width + 1;
    const maxY = GRID_ROWS - height + 1;
    const x = Math.min(Math.max(safeLayout.x, 1), Math.max(maxX, 1));
    const y = Math.min(Math.max(safeLayout.y, 1), Math.max(maxY, 1));
    return `lazy-grid-x-${x} lazy-grid-y-${y} lazy-grid-w-${width} lazy-grid-h-${height}`;
  };

  const overlaps = (a, b) =>
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y;

  const resolveCollision = useCallback((widgetId, nextLayout, allWidgets) => {
    let candidate = { ...nextLayout };
    let guard = 0;
    while (
      allWidgets.some((widget) => {
        if (widget.id === widgetId) {
          return false;
        }
        const layout = getSafeLayout(widget.layout);
        return overlaps(candidate, layout);
      })
    ) {
      candidate.y += 1;
      if (candidate.y > GRID_ROWS) {
        break;
      }
      guard += 1;
      if (guard > GRID_ROWS) {
        break;
      }
    }
    return candidate;
  }, []);

  const getGridMetrics = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) {
      return null;
    }
    const rect = grid.getBoundingClientRect();
    const styles = window.getComputedStyle(grid);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const innerWidth = rect.width - paddingLeft - paddingRight;
    const totalGap = GRID_GAP * (GRID_COLUMNS - 1);
    const colWidth =
      GRID_COLUMNS > 0 ? (innerWidth - totalGap) / GRID_COLUMNS : 0;
    return {
      rect,
      colWidth,
      rowStep: GRID_ROW_HEIGHT + GRID_GAP,
    };
  }, []);

  const getDeltaFromPointer = useCallback((origin, event) => {
    const metrics = getGridMetrics();
    if (!metrics) {
      return { dx: 0, dy: 0 };
    }
    const { colWidth, rowStep } = metrics;
    const colStep = colWidth + GRID_GAP;
    return {
      dx: Math.round((event.clientX - origin.x) / colStep),
      dy: Math.round((event.clientY - origin.y) / rowStep),
    };
  }, [getGridMetrics]);

  const updateLayoutForInteraction = useCallback(
    (event) => {
      const interaction = interactionRef.current;
      if (!interaction) {
        return;
      }
      const { widgetId, origin, startLayout, type } = interaction;
      const { dx, dy } = getDeltaFromPointer(origin, event);
      onUpdateAuthoringModel((current) => {
        const target = current.widgets.find((widget) => widget.id === widgetId);
        if (!target) {
          return current;
        }
        const baseLayout = getSafeLayout(startLayout || target.layout);
        let nextLayout = { ...baseLayout };
        if (type === 'move') {
          const maxX = GRID_COLUMNS - baseLayout.w + 1;
          const maxY = GRID_ROWS - baseLayout.h + 1;
          nextLayout = {
            ...baseLayout,
            x: Math.min(
              Math.max(baseLayout.x + dx, 1),
              Math.max(maxX, 1)
            ),
            y: Math.min(
              Math.max(baseLayout.y + dy, 1),
              Math.max(maxY, 1)
            ),
          };
        }
        if (type === 'resize') {
          const maxW = GRID_COLUMNS - baseLayout.x + 1;
          const maxH = GRID_ROWS - baseLayout.y + 1;
          nextLayout = {
            ...baseLayout,
            w: Math.min(
              Math.max(baseLayout.w + dx, 1),
              Math.max(maxW, 1)
            ),
            h: Math.min(
              Math.max(baseLayout.h + dy, 1),
              Math.max(maxH, 1)
            ),
          };
        }
        nextLayout = resolveCollision(widgetId, nextLayout, current.widgets);
        return updateWidgetInModel(current, widgetId, {
          layout: nextLayout,
          draft: false,
        });
      });
    },
    [getDeltaFromPointer, onUpdateAuthoringModel, resolveCollision]
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!interactionRef.current) {
        return;
      }
      updateLayoutForInteraction(event);
    },
    [updateLayoutForInteraction]
  );

  const handlePointerUp = useCallback(() => {
    if (!interactionRef.current) {
      return;
    }
    interactionRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    document.body.classList.remove('lazy-dragging');
  }, [handlePointerMove]);

  const beginInteraction = (event, widget, type) => {
    event.preventDefault();
    event.stopPropagation();
    interactionRef.current = {
      widgetId: widget.id,
      origin: { x: event.clientX, y: event.clientY },
      startLayout: getSafeLayout(widget.layout),
      type,
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    document.body.classList.add('lazy-dragging');
  };

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.classList.remove('lazy-dragging');
    },
    [handlePointerMove, handlePointerUp]
  );

  const PreviewVizPanel = ({ panelConfig }) => {
    const dashboardState = useDashboardState();
    const querySpec = useMemo(
      () => buildQuerySpec(panelConfig, dashboardState),
      [dashboardState, panelConfig]
    );
    const { data, loading, error } = useQuery(querySpec, {
      provider: previewProvider,
    });
    const isEmpty = !loading && !error && (!data || data.length === 0);
    const status = loading ? 'loading' : error ? 'error' : 'ready';
    const isKpiPanel =
      panelConfig.vizType === 'kpi' || panelConfig.vizType === 'kpiVariant';

    return (
      <Panel
        title={panelConfig.title}
        subtitle={panelConfig.subtitle}
        status={status}
        error={error}
        isEmpty={isEmpty}
        emptyMessage="No data returned for this panel."
        hideHeader={isKpiPanel}
        chromeless={isKpiPanel}
      >
        <VizRenderer
          panelConfig={panelConfig}
          vizType={panelConfig.vizType}
          data={data || []}
          encodings={panelConfig.encodings}
          options={panelConfig.options}
        />
      </Panel>
    );
  };

  const PreviewDashboard = ({ config }) => {
    const panels = config?.panels || [];
    return (
      <section className="ladf-dashboard lazy-preview-dashboard">
        <header className="lazy-preview-dashboard__header">
          <h1 className="ladf-dashboard__title">
            {config?.title || 'Untitled Dashboard'}
          </h1>
          {config?.subtitle ? (
            <p className="ladf-dashboard__subtitle">{config.subtitle}</p>
          ) : null}
        </header>
        <GridLayout
          panels={panels}
          renderPanel={(panel) => {
            const datasourceId = panel?.datasetId || panel?.datasourceId || defaultDatasourceId;
            const datasource =
              datasourceMap.get(datasourceId) || datasources?.[0] || null;
            const datasetBinding =
              previewDatasourceBindings?.get(datasourceId) ||
              datasource?.datasetBinding ||
              null;
            const semanticLayer =
              datasource?.semanticLayer || {
                enabled: false,
                exportDatasetConfig: false,
                metrics: [],
                dimensions: [],
              };
            if (panel.panelType === 'viz' && panel.vizType === 'filterBar') {
              return (
                <Panel title={panel.title} subtitle={panel.subtitle}>
                  <LazyFilterBar
                    fields={panel.encodings?.fields}
                    options={panel.options}
                    datasetBinding={datasetBinding}
                    semanticLayer={semanticLayer}
                  />
                </Panel>
              );
            }
            if (panel.panelType === 'viz') {
              return <PreviewVizPanel panelConfig={panel} />;
            }
            return (
              <Panel title={panel.title} subtitle={panel.subtitle} status={panel.status}>
                {panel.content}
              </Panel>
            );
          }}
        />
      </section>
    );
  };

  return (
    <section className="lazy-canvas">
      <div className="lazy-canvas__header">
        <div className="lazy-canvas__header-group">
          <h2 className="lazy-panel__title">
            {resolvedMode === 'layout' ? 'Layout editor' : 'Preview'}
          </h2>
          <p className="lazy-canvas__subtitle">
            {resolvedMode === 'layout'
              ? 'Drag widgets across grid blocks and resize to fit the layout.'
              : 'Preview the live dashboard without layout handles.'}
          </p>
        </div>
        <div className="lazy-canvas__actions">
          <div className="lazy-canvas__mode-toggle" role="group" aria-label="Canvas mode">
            <button
              className={`lazy-toggle__button${resolvedMode === 'layout' ? ' active' : ''}`}
              type="button"
              onClick={() => onViewModeChange?.('layout')}
            >
              Layout
            </button>
            <button
              className={`lazy-toggle__button${resolvedMode === 'preview' ? ' active' : ''}`}
              type="button"
              onClick={() => onViewModeChange?.('preview')}
            >
              Preview
            </button>
          </div>
          <button className="lazy-button ghost" type="button" onClick={onAddWidget}>
            Add Widget
          </button>
        </div>
      </div>
      {resolvedMode === 'layout' ? (
        <div className="lazy-canvas__stage lazy-canvas__stage--layout">
          <div className="lazy-canvas__layout-grid" ref={gridRef}>
            <div className="lazy-canvas__layout-blocks" aria-hidden="true">
              {Array.from({ length: GRID_COLUMNS * GRID_ROWS }).map((_, index) => (
                <div key={`block-${index}`} className="lazy-canvas__layout-block" />
              ))}
            </div>
            {widgets.length === 0 ? (
              <p className="lazy-canvas__empty">
                Add widgets to start arranging the dashboard layout.
              </p>
            ) : (
              widgets.map((widget) => {
                const status = widgetValidation[widget.id]?.status || 'draft';
                const issues = widgetValidation[widget.id]?.errors?.length || 0;
                return (
                  <div
                    key={widget.id}
                    className={`lazy-layout-item ${gridClasses(widget.layout)}${
                      widget.id === activeWidgetId ? ' active' : ''
                    }`}
                    onClick={() => onWidgetSelect(widget.id)}
                  >
                    <div
                      className="lazy-layout-item__header"
                      onPointerDown={(event) => {
                        onWidgetSelect(widget.id);
                        beginInteraction(event, widget, 'move');
                      }}
                    >
                      <span className="lazy-layout-item__title">{widget.title}</span>
                      <span className="lazy-layout-item__status">{status}</span>
                    </div>
                    <div className="lazy-layout-item__meta">
                      <span>{widget.vizType}</span>
                      <span>{widget.layout.w}×{widget.layout.h}</span>
                      {issues > 0 ? <span>{issues} issues</span> : null}
                    </div>
                    <button
                      className="lazy-layout-item__resize"
                      type="button"
                      aria-label="Resize widget"
                      onPointerDown={(event) => {
                        onWidgetSelect(widget.id);
                        beginInteraction(event, widget, 'resize');
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>
          <div className="lazy-canvas__hint">
            Drag to reposition, pull the corner to resize, then flip to Preview.
          </div>
        </div>
      ) : (
        <div className="lazy-canvas__stage">
          <DashboardProvider
            initialState={{
              dashboardId: compiledConfig?.id || dashboardId,
              datasetId:
                compiledConfig?.datasetId ||
                defaultDatasourceId ||
                `${dashboardId}_dataset`,
            }}
          >
            <ErrorBoundary
              title="Preview failed"
              message="Fix the configuration or reload the preview to try again."
            >
              <PreviewDashboard config={compiledConfig} />
            </ErrorBoundary>
          </DashboardProvider>
        </div>
      )}
    </section>
  );
};

export default GridCanvas;
