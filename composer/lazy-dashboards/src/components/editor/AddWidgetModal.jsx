/**
 * @typedef {Object} VizManifest
 * @property {string} id
 * @property {string} label
 * @property {string} description
 * @property {string} [supportLevel]
 */

/**
 * @typedef {Object} AddWidgetModalProps
 * @property {boolean} isOpen
 * @property {VizManifest[]} vizManifests
 * @property {string} selectedVizType
 * @property {(vizType: string) => void} onSelectVizType
 * @property {() => void} onClose
 * @property {() => void} onConfirm
 * @property {Object|null} datasetBinding
 * @property {(manifest: VizManifest) => string[]} getVizPrereqs
 */

/**
 * Modal for selecting a visualization type to add to the dashboard.
 *
 * @param {AddWidgetModalProps} props
 * @returns {JSX.Element|null}
 */
const AddWidgetModal = ({
  isOpen,
  vizManifests,
                          selectedVizType,
                          onSelectVizType,
                          onClose,
                          onConfirm,
                          datasetBinding,
                          getVizPrereqs,
                        }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="lazy-modal__backdrop" role="dialog" aria-modal="true">
      <div className="lazy-modal">
        {/* Header */}
        <div className="lazy-modal__header">
          <div>
            <p className="lazy-modal__eyebrow">Widget library</p>
            <h2 className="lazy-modal__title">Add widget</h2>
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
          {/* Alert for missing dataset */}
          {!datasetBinding && (
            <div className="lazy-alert warning">
              <strong>Dataset missing</strong>
              <span>
                Import a dataset to unlock field suggestions and previews.
              </span>
            </div>
          )}

          {/* Widget Grid */}
          <div className="lazy-viz-grid">
            {vizManifests.map((manifest) => {
              const prereqs = getVizPrereqs(manifest);
              const isDeferred = manifest.supportLevel === 'deferred';
              const isPartial = manifest.supportLevel === 'partial';
              const isSelected = selectedVizType === manifest.id;

              return (
                <button
                  key={manifest.id}
                  className={`lazy-viz-card${isSelected ? ' active' : ''}`}
                  type="button"
                  disabled={isDeferred}
                  onClick={() => onSelectVizType(manifest.id)}
                  aria-pressed={isSelected}
                >
                  {/* Card Header */}
                  <div className="lazy-viz-card__header">
                    <span className="lazy-viz-card__title">
                      {manifest.label}
                    </span>
                    <span className="lazy-viz-card__type">
                      {manifest.id}
                    </span>
                  </div>

                  {/* Status Pills */}
                  {isDeferred && <span className="lazy-pill">Deferred</span>}
                  {isPartial && <span className="lazy-pill">Partial</span>}

                  {/* Description */}
                  <p className="lazy-viz-card__description">
                    {manifest.description}
                  </p>

                  {/* Prerequisites */}
                  {prereqs.length > 0 && (
                    <div className="lazy-viz-card__prereqs">
                      {prereqs.map((item) => (
                        <span key={item} className="lazy-viz-card__prereq">
                          {item}
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
            onClick={onConfirm}
            disabled={!selectedVizType}
          >
            Add widget
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWidgetModal;
