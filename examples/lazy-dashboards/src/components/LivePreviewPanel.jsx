import { useMemo } from 'react';
import {
  PanelBody,
  VizRenderer,
  buildQuerySpec,
  useDashboardState,
  useQuery,
} from 'radf';

const LivePreviewPanel = ({ panel, dataProvider }) => {
  const dashboardState = useDashboardState();
  const querySpec = useMemo(
    () => (panel ? buildQuerySpec(panel, dashboardState) : {}),
    [panel, dashboardState]
  );
  const { data, loading, error } = useQuery(querySpec, {
    provider: dataProvider,
    enabled: Boolean(panel),
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
