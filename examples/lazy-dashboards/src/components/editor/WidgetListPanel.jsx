/**
 * @typedef {Object} WidgetListPanelProps
 * @property {{ widgets: Object[] }} authoringModel
 * @property {Object} validation
 * @property {string|null} activeWidgetId
 * @property {(widgetId: string) => void} onWidgetSelect
 * @property {() => void} onOpenTemplate
 * @property {() => void} onAddWidget
 * @property {(widgetId: string) => void} onRequestRemoveWidget
 */

/**
 * Displays the list of widgets with status and selection controls.
 *
 * @param {WidgetListPanelProps} props
 * @returns {JSX.Element}
 */
const WidgetListPanel = ({
  authoringModel,
  validation,
  activeWidgetId,
  onWidgetSelect,
  onOpenTemplate,
  onAddWidget,
  onRequestRemoveWidget,
}) => {
  const widgets = authoringModel?.widgets || [];
  const widgetValidation = validation?.widgets || {};

  return (
    <section className="lazy-panel">
      <h2 className="lazy-panel__title">Authoring Model</h2>
      <p className="lazy-panel__body">
        {validation?.isValid
          ? 'All widgets compile cleanly.'
          : 'Some widgets still need required fields.'}
      </p>
      <div className="lazy-widget-list">
        {widgets.length === 0 ? (
          <div className="lazy-template-empty">
            <p className="lazy-panel__body">
              Start with a template or add widgets one by one.
            </p>
            <div className="lazy-template-empty__actions">
              <button
                className="lazy-button"
                type="button"
                onClick={onOpenTemplate}
              >
                Start from template
              </button>
              <button
                className="lazy-button ghost"
                type="button"
                onClick={onAddWidget}
              >
                Add widget
              </button>
            </div>
          </div>
        ) : (
          widgets.map((widget) => {
            const status = widgetValidation[widget.id]?.status || 'draft';
            const issues = widgetValidation[widget.id]?.errors?.length || 0;
            return (
              <div
                key={widget.id}
                className={`lazy-widget-item${
                  widget.id === activeWidgetId ? ' active' : ''
                }`}
                onClick={() => onWidgetSelect(widget.id)}
              >
                <div className="lazy-widget-item__header">
                  <strong>{widget.title}</strong>
                  <div className="lazy-widget-item__meta">
                    {issues > 0 ? (
                      <span className="lazy-widget-issues">
                        {issues} issues
                      </span>
                    ) : null}
                    <span className={`lazy-widget-status ${status}`}>
                      {status}
                    </span>
                  </div>
                </div>
                <span className="lazy-widget-meta">
                  {widget.vizType} • {widget.layout.w}x{widget.layout.h}
                </span>
                <div className="lazy-widget-actions">
                  <button
                    className="lazy-button ghost"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRequestRemoveWidget(widget.id);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <button
        className="lazy-button ghost"
        type="button"
        onClick={onAddWidget}
      >
        Add Widget
      </button>
    </section>
  );
};

export default WidgetListPanel;
