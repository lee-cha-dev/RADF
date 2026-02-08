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
      <div className="lazy-modal lazy-modal--compact lazy-modal--widget">
        <div className="lazy-modal__header">
          <div>
            <p className="lazy-modal__eyebrow">Widget library</p>
            <h2 className="lazy-modal__title">Add widget</h2>
          </div>
          <button className="lazy-button ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="lazy-modal__body">
          <div className="lazy-viz-grid">
            {vizManifests.map((manifest) => {
              const prereqs = getVizPrereqs(manifest);
              const isDeferred = manifest.supportLevel === 'deferred';
              const isPartial = manifest.supportLevel === 'partial';
              return (
                <button
                  key={manifest.id}
                  className={`lazy-viz-card${
                    selectedVizType === manifest.id ? ' active' : ''
                  }`}
                  type="button"
                  disabled={isDeferred}
                  onClick={() => onSelectVizType(manifest.id)}
                >
                  <div className="lazy-viz-card__header">
                    <span className="lazy-viz-card__title">
                      {manifest.label}
                    </span>
                    <span className="lazy-viz-card__type">{manifest.id}</span>
                  </div>
                  {isDeferred ? <span className="lazy-pill">Deferred</span> : null}
                  {isPartial ? <span className="lazy-pill">Partial</span> : null}
                  <p className="lazy-viz-card__description">
                    {manifest.description}
                  </p>
                  <div className="lazy-viz-card__prereqs">
                    {prereqs.map((item) => (
                      <span key={item} className="lazy-viz-card__prereq">
                        {item}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          {!datasetBinding ? (
            <div className="lazy-alert warning">
              <strong>Dataset missing.</strong>
              <span>
                Import a dataset to unlock field suggestions and previews.
              </span>
            </div>
          ) : null}
        </div>
        <div className="lazy-modal__footer">
          <button className="lazy-button ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="lazy-button" type="button" onClick={onConfirm}>
            Add widget
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWidgetModal;
