import { useMemo } from 'react';
import {
  PanelBody,
  VizRenderer,
  buildQuerySpec,
  useDashboardState,
  useQuery,
} from 'radf';
import LazyFilterBar from './LazyFilterBar.jsx';

/**
 * @typedef {Object} PreviewPanel
 * @property {string} panelType
 * @property {string} [vizType]
 * @property {Object} [encodings]
 * @property {Object} [options]
 */

/**
 * @typedef {Object} LivePreviewPanelProps
 * @property {PreviewPanel|null} panel
 * @property {Object} dataProvider
 * @property {Object} [datasetBinding]
 * @property {Object} [semanticLayer]
 */

/**
 * Renders a live preview of a panel or a filter bar widget.
 *
 * @param {LivePreviewPanelProps} props
 * @returns {JSX.Element}
 */
const LivePreviewPanel = ({
  panel,
  dataProvider,
  datasetBinding,
  semanticLayer,
}) => {
  const dashboardState = useDashboardState();
  const isFilterBar = panel?.panelType === 'viz' && panel?.vizType === 'filterBar';
  const shouldQuery = Boolean(panel) && !isFilterBar;
  const querySpec = useMemo(
    () => (shouldQuery ? buildQuerySpec(panel, dashboardState) : {}),
    [panel, dashboardState, shouldQuery]
  );
  const { data, loading, error } = useQuery(querySpec, {
    provider: dataProvider,
    enabled: shouldQuery,
  });
  const isEmpty = !loading && !error && (!data || data.length === 0);
  const status = loading ? 'loading' : error ? 'error' : 'ready';

  if (!panel) {
    return (
      <PanelBody
        status="empty"
        emptyMessage="Configure this panel to see a preview."
      />
    );
  }

  if (isFilterBar) {
    return (
      <PanelBody status="ready">
        <LazyFilterBar
          fields={panel.encodings?.fields}
          options={panel.options}
          datasetBinding={datasetBinding}
          semanticLayer={semanticLayer}
        />
      </PanelBody>
    );
  }

  return (
    <PanelBody
      status={status}
      error={error}
      isEmpty={isEmpty}
      emptyMessage="No data returned for this panel."
    >
      {panel.panelType === 'viz' ? (
        <VizRenderer
          vizType={panel.vizType}
          data={data || []}
          encodings={panel.encodings}
          options={panel.options}
        />
      ) : (
        <div className="lazy-preview__unsupported">
          Preview is only available for viz panels.
        </div>
      )}
    </PanelBody>
  );
};

export default LivePreviewPanel;
