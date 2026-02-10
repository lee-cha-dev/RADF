/**
 * @typedef {Object} RemoveWidgetModalProps
 * @property {{ title: string }|null} pendingRemoveWidget
 * @property {() => void} onCancel
 * @property {() => void} onConfirm
 */

/**
 * Confirmation modal for removing a widget.
 *
 * @param {RemoveWidgetModalProps} props
 * @returns {JSX.Element|null}
 */
const RemoveWidgetModal = ({ pendingRemoveWidget, onCancel, onConfirm }) => {
  if (!pendingRemoveWidget) {
    return null;
  }

  return (
    <div className="lazy-modal__backdrop" role="dialog" aria-modal="true">
      <div className="lazy-modal lazy-modal--compact lazy-modal--confirm">
        <div className="lazy-modal__header">
          <div>
            <p className="lazy-modal__eyebrow">Confirm removal</p>
            <h2 className="lazy-modal__title">Remove widget</h2>
          </div>
        </div>
        <div className="lazy-modal__body">
          <p className="lazy-panel__body">
            Remove "{pendingRemoveWidget.title}" from the dashboard?
          </p>
        </div>
        <div className="lazy-modal__footer">
          <button className="lazy-button ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="lazy-button danger" type="button" onClick={onConfirm}>
            Remove widget
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveWidgetModal;
