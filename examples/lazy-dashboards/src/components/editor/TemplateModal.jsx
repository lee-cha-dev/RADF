const TemplateModal = ({
  isOpen,
  authoringModel,
  datasetBinding,
  templateMode,
  onTemplateModeChange,
  includeTemplateFilterBar,
  onIncludeTemplateFilterBarChange,
  selectedTemplateId,
  onSelectTemplate,
  selectedTemplate,
  dashboardTemplates,
  onApplyTemplate,
  onClose,
  getTemplatePreview,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="lazy-modal__backdrop" role="dialog" aria-modal="true">
      <div className="lazy-modal lazy-template-modal lazy-modal--compact lazy-modal--template">
        <div className="lazy-modal__header">
          <div>
            <p className="lazy-modal__eyebrow">Starter templates</p>
            <h2 className="lazy-modal__title">Choose a layout</h2>
          </div>
          <button className="lazy-button ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="lazy-modal__body">
          <div className="lazy-template-modal__controls">
            <div>
              <p className="lazy-panel__body">
                Pick a template and decide whether to replace or append the
                current layout.
              </p>
              {templateMode === 'replace' && authoringModel.widgets.length > 0 ? (
                <div className="lazy-alert warning">
                  Replacing will remove existing widgets.
                </div>
              ) : null}
              {!datasetBinding ? (
                <div className="lazy-alert warning">
                  Import a dataset to auto-bind fields in the template.
                </div>
              ) : null}
            </div>
            <div className="lazy-template-modal__options">
              <div className="lazy-input">
                <span className="lazy-input__label">Apply mode</span>
                <div className="lazy-toggle">
                  <button
                    className={`lazy-toggle__button ${
                      templateMode === 'replace' ? 'active' : ''
                    }`}
                    type="button"
                    onClick={() => onTemplateModeChange('replace')}
                  >
                    Replace layout
                  </button>
                  <button
                    className={`lazy-toggle__button ${
                      templateMode === 'add' ? 'active' : ''
                    }`}
                    type="button"
                    onClick={() => onTemplateModeChange('add')}
                  >
                    Add to existing
                  </button>
                </div>
              </div>
              {selectedTemplate?.supportsFilterBar ? (
                <label className="lazy-template-card__toggle">
                  <input
                    type="checkbox"
                    checked={includeTemplateFilterBar}
                    onChange={(event) =>
                      onIncludeTemplateFilterBarChange(event.target.checked)
                    }
                  />
                  <span>Include filter bar</span>
                </label>
              ) : null}
            </div>
          </div>
          <div className="lazy-template-grid">
            {dashboardTemplates.map((template) => {
              const isActive = template.id === selectedTemplateId;
              const showFilter = isActive ? includeTemplateFilterBar : false;
              return (
                <button
                  key={template.id}
                  type="button"
                  className={`lazy-template-card lazy-template-card--selectable ${
                    isActive ? 'is-active' : ''
                  }`}
                  onClick={() => onSelectTemplate(template.id)}
                >
                  <div className="lazy-template-card__preview">
                    <div className="lazy-template-preview">
                      {getTemplatePreview(template.id, showFilter).map(
                        (block, index) => (
                          <span
                            key={`${template.id}-${index}`}
                            className={`lazy-template-preview__block ${
                              block.type || ''
                            } lazy-grid-x-${block.x} lazy-grid-y-${
                              block.y
                            } lazy-grid-w-${block.w} lazy-grid-h-${block.h}`}
                          />
                        )
                      )}
                    </div>
                  </div>
                  <h3 className="lazy-template-card__title">{template.name}</h3>
                  <p className="lazy-template-card__description">
                    {template.description}
                  </p>
                  <div className="lazy-template-card__tags">
                    {template.tags.map((tag) => (
                      <span className="lazy-pill" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="lazy-modal__footer">
          <button className="lazy-button ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="lazy-button"
            type="button"
            onClick={() => onApplyTemplate(selectedTemplateId)}
            disabled={!selectedTemplateId}
          >
            Apply template
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
