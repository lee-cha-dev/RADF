import LivePreviewPanel from '../LivePreviewPanel.jsx';

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
