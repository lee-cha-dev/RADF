/**
 * @module core/viz/VizRenderer
 * @description Resolve a visualization component from the registry and render it
 * with legend and palette behavior.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { vizRegistry } from '../registry/registry';
import { buildColorAssignment } from './palettes/colorAssignment';
import Legend from './legend/Legend.jsx';

/**
 * @typedef {Object} VizRendererProps
 * @property {Object} panelConfig - Panel configuration used for palette + intent.
 * @property {string} vizType - Visualization type key registered in the registry.
 * @property {Array<Object>} data - Rows returned by the query layer.
 * @property {Object} encodings - Encodings mapping dimensions/measures to axes.
 * @property {Object} options - Visualization options (legend, tooltip, palette).
 * @property {Object} handlers - Interaction handlers passed to chart panels.
 */

/**
 * Render a registered visualization component with legends and palette assignment.
 * If the viz type is missing, a friendly empty state is shown.
 * @param {VizRendererProps} props - Renderer props.
 * @returns {JSX.Element} Visualization output.
 */
function VizRenderer({
  panelConfig,
  vizType,
  data,
  encodings,
  options,
  handlers,
}) {
  const Component = vizRegistry.get(vizType);
  const colorAssignment = useMemo(
    () =>
      buildColorAssignment({
        panelConfig,
        vizType,
        encodings,
        options,
        data,
      }),
    [panelConfig, vizType, encodings, options, data]
  );
  const [hiddenKeys, setHiddenKeys] = useState(new Set());
  const legendItems = useMemo(() => colorAssignment?.items ?? [], [colorAssignment]);
  const legendMode = options?.legendMode ?? 'auto';
  const legendPosition = options?.legendPosition ?? 'bottom';
  const shouldShowLegend =
    options?.legend !== false &&
    legendItems.length > 0 &&
    (legendMode !== 'auto' || legendItems.length > 1);
  const toggleable = colorAssignment?.mode === 'series' || colorAssignment?.mode === 'category';

  const handleToggle = useCallback(
    (key) => {
      if (!toggleable) {
        return;
      }
      setHiddenKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    },
    [toggleable]
  );

  useEffect(() => {
    if (!hiddenKeys.size) {
      return;
    }
    const keys = new Set(legendItems.map((item) => item.key));
    const filtered = [...hiddenKeys].filter((key) => keys.has(key));
    if (filtered.length === hiddenKeys.size) {
      return;
    }
    setHiddenKeys(new Set(filtered));
  }, [legendItems, hiddenKeys]);

  if (!Component) {
    return (
      <div className="radf-viz__missing">
        <p className="radf-viz__missing-title">Visualization unavailable</p>
        <p className="radf-viz__missing-text">
          The viz type &quot;{vizType}&quot; has not been registered yet.
        </p>
      </div>
    );
  }

  const layoutClass =
    legendPosition === 'right'
      ? 'radf-viz__layout radf-viz__layout--right'
      : 'radf-viz__layout';
  const legend = shouldShowLegend ? (
    <Legend
      items={legendItems}
      hiddenKeys={hiddenKeys}
      onToggle={toggleable ? handleToggle : undefined}
      position={legendPosition}
    />
  ) : null;

  const chart = (
    <Component
      data={data}
      encodings={encodings}
      options={options}
      handlers={handlers}
      colorAssignment={colorAssignment}
      hiddenKeys={hiddenKeys}
    />
  );

  return (
    <div className={layoutClass}>
      {legendPosition === 'top' ? legend : null}
      {chart}
      {legendPosition !== 'top' ? legend : null}
    </div>
  );
}

export default VizRenderer;
