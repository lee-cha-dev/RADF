import LivePreviewPanel from '../LivePreviewPanel.jsx';

/**
 * @typedef {Object} GridWidgetProps
 * @property {Object} widget
 * @property {boolean} isActive
 * @property {string} className
 * @property {string} status
 * @property {number} issues
 * @property {() => void} onSelect
 * @property {(event: React.PointerEvent) => void} [onStartMove]
 * @property {(event: React.PointerEvent) => void} [onStartResize]
 * @property {Object|null} previewPanel
 * @property {Object} previewProvider
 * @property {Object|null} datasetBinding
 * @property {Object} semanticLayer
 */

/**
 * Renders a single widget tile inside the grid canvas.
 *
 * @param {GridWidgetProps} props
 * @returns {JSX.Element}
 */
const GridWidget = ({
  widget,
  isActive,
  className,
  status,
  issues,
  onSelect,
  onStartMove,
  onStartResize,
  previewPanel,
  previewProvider,
  datasetBinding,
  semanticLayer,
}) => (
  <div
    className={`lazy-canvas-item ${className}${isActive ? ' active' : ''}`}
    onClick={onSelect}
  >
    <div
      className={`lazy-canvas-item__header${onStartMove ? ' is-draggable' : ''}`}
      onPointerDown={onStartMove}
    >
      <span className="lazy-canvas-item__title">{widget.title}</span>
      <div className="lazy-canvas-item__meta">
        {issues > 0 ? (
          <span className="lazy-widget-issues">{issues} issues</span>
        ) : null}
        <span className={`lazy-widget-status ${status}`}>{status}</span>
      </div>
    </div>
    <div className="lazy-canvas-item__preview">
      <LivePreviewPanel
        panel={previewPanel}
        dataProvider={previewProvider}
        datasetBinding={datasetBinding}
        semanticLayer={semanticLayer}
      />
    </div>
    {onStartResize ? (
      <button
        className="lazy-canvas-item__resize"
        type="button"
        aria-label="Resize widget"
        onPointerDown={onStartResize}
      />
    ) : null}
  </div>
);

export default GridWidget;
