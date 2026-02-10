/**
 * @typedef {Object} TemplatePreviewBlock
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {string} [type]
 */

/**
 * @typedef {Object} DashboardTemplate
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string[]} [tags]
 * @property {boolean} [supportsFilterBar]
 */

/**
 * @typedef {Object} TemplateModalProps
 * @property {boolean} isOpen
 * @property {{ widgets: Object[] }} authoringModel
 * @property {Object|null} datasetBinding
 * @property {'replace'|'add'} templateMode
 * @property {(mode: 'replace'|'add') => void} onTemplateModeChange
 * @property {boolean} includeTemplateFilterBar
 * @property {(value: boolean) => void} onIncludeTemplateFilterBarChange
 * @property {string} selectedTemplateId
 * @property {(templateId: string) => void} onSelectTemplate
 * @property {DashboardTemplate|null} selectedTemplate
 * @property {DashboardTemplate[]} dashboardTemplates
 * @property {(templateId: string) => void} onApplyTemplate
 * @property {() => void} onClose
 * @property {(templateId: string, showFilter: boolean) => TemplatePreviewBlock[]} getTemplatePreview
 */

/**
 * Modal for picking and applying starter dashboard templates.
 *
 * @param {TemplateModalProps} props
 * @returns {JSX.Element|null}
 */
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

  const hasExistingWidgets = authoringModel.widgets.length > 0;
  const showReplaceWarning = templateMode === 'replace' && hasExistingWidgets;

  return (
    <div className="lazy-modal__backdrop" role="dialog" aria-modal="true">
      <div className="lazy-modal lazy-template-modal lazy-modal--compact lazy-modal--template">
        {/* Header */}
        <div className="lazy-modal__header">
          <div>
            <p className="lazy-modal__eyebrow">Starter templates</p>
            <h2 className="lazy-modal__title">Choose a layout</h2>
          </div>
          <button
            className="lazy-button ghost"
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="lazy-modal__body">
          {/* Controls */}
          <div className="lazy-template-modal__controls">
            {/* Description and Alerts */}
            <div>
              <p className="lazy-panel__body">
                Pick a template and decide whether to replace or append the
                current layout.
              </p>

              {/* Warnings */}
              {showReplaceWarning && (
                <div className="lazy-alert warning" style={{ marginTop: '12px' }}>
                  <div>
                    <strong>Warning</strong>
                    <span>Replacing will remove all existing widgets from your dashboard.</span>
                  </div>
                </div>
              )}

              {!datasetBinding && (
                <div className="lazy-alert warning" style={{ marginTop: '12px' }}>
                  <div>
                    <strong>Dataset missing</strong>
                    <span>Import a dataset to auto-bind fields in the template.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="lazy-template-modal__options">
              {/* Apply Mode Toggle */}
              <div className="lazy-input">
                <span className="lazy-input__label">Apply mode</span>
                <div className="lazy-toggle">
                  <button
                    className={`lazy-toggle__button ${
                      templateMode === 'replace' ? 'active' : ''
                    }`}
                    type="button"
                    onClick={() => onTemplateModeChange('replace')}
                    aria-pressed={templateMode === 'replace'}
                  >
                    Replace layout
                  </button>
                  <button
                    className={`lazy-toggle__button ${
                      templateMode === 'add' ? 'active' : ''
                    }`}
                    type="button"
                    onClick={() => onTemplateModeChange('add')}
                    aria-pressed={templateMode === 'add'}
                  >
                    Add to existing
                  </button>
                </div>
              </div>

              {/* Filter Bar Option */}
              {selectedTemplate?.supportsFilterBar && (
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
              )}
            </div>
          </div>

          {/* Template Grid */}
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
                  aria-pressed={isActive}
                >
                  {/* Preview */}
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

                  {/* Title */}
                  <h3 className="lazy-template-card__title">
                    {template.name}
                  </h3>

                  {/* Description */}
                  <p className="lazy-template-card__description">
                    {template.description}
                  </p>

                  {/* Tags */}
                  {template.tags && template.tags.length > 0 && (
                    <div className="lazy-template-card__tags">
                      {template.tags.map((tag) => (
                        <span className="lazy-pill" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="lazy-modal__footer">
          <button
            className="lazy-button ghost"
            type="button"
            onClick={onClose}
          >
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
