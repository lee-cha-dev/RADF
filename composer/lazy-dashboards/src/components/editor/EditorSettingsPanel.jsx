/**
 * @typedef {Object} EditorSettingsPanelProps
 * @property {boolean} autoSaveEnabled
 * @property {(enabled: boolean) => void} onToggleAutoSave
 * @property {boolean} syncSupported
 * @property {boolean} syncEnabled
 * @property {string} syncStatusLabel
 * @property {() => void} onEnableSync
 * @property {() => void} onDisableSync
 * @property {() => void} [onChangeSyncFolder]
 */

/**
 * Shows editor preferences and optional disk sync controls.
 *
 * @param {EditorSettingsPanelProps} props
 * @returns {JSX.Element}
 */
const EditorSettingsPanel = ({
  autoSaveEnabled,
  onToggleAutoSave,
  syncSupported,
  syncEnabled,
  syncStatusLabel,
  onEnableSync,
  onDisableSync,
  onChangeSyncFolder,
}) => {
  const handleChangeSyncFolder = onChangeSyncFolder || onEnableSync;

  return (
    <section className="lazy-panel">
      <h2 className="lazy-panel__title">Editor Settings</h2>
      <p className="lazy-panel__body">Manage disk sync and editor preferences.</p>
      <div className="lazy-editor-settings">
        <div className="lazy-editor-settings__section">
          <p className="lazy-input__label">Disk sync</p>
          <p className="lazy-panel__body">{syncStatusLabel}</p>
          {syncSupported ? (
            syncEnabled ? (
              <div className="lazy-editor-settings__actions">
                <button
                  className="lazy-button ghost"
                  type="button"
                  onClick={handleChangeSyncFolder}
                >
                  Change Sync Folder
                </button>
                <button
                  className="lazy-button ghost"
                  type="button"
                  onClick={onDisableSync}
                >
                  Disable Sync
                </button>
              </div>
            ) : (
              <button
                className="lazy-button ghost"
                type="button"
                onClick={onEnableSync}
              >
                Enable Disk Sync
              </button>
            )
          ) : (
            <p className="lazy-panel__body">
              Disk sync is not available in this browser.
            </p>
          )}
        </div>
        <div className="lazy-editor-settings__section">
          <p className="lazy-input__label">Preferences</p>
          <label className="lazy-checkbox">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(event) => onToggleAutoSave?.(event.target.checked)}
            />
            <span>Auto-save</span>
          </label>
          <p className="lazy-panel__body">
            Auto-save keeps your draft updated as you work.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EditorSettingsPanel;
