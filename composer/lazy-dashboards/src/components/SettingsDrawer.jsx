import { useEffect } from 'react';
import Settings from '../pages/Settings.jsx';

/**
 * @typedef {Object} SettingsDrawerProps
 * @property {boolean} isOpen
 * @property {() => void} onClose
 * @property {string} themeFamily
 * @property {string} themeMode
 * @property {string} paletteId
 * @property {string} resolvedMode
 * @property {Object[]} themeFamilies
 * @property {Object[]} paletteOptions
 * @property {(value: string) => void} setThemeFamily
 * @property {(value: string) => void} setThemeMode
 * @property {(value: string) => void} setPaletteId
 */

/**
 * Slides in global theme settings for the dashboard editor.
 *
 * @param {SettingsDrawerProps} props
 * @returns {JSX.Element|null}
 */
const SettingsDrawer = ({
  isOpen,
  onClose,
  themeFamily,
  themeMode,
  paletteId,
  resolvedMode,
  themeFamilies,
  paletteOptions,
  setThemeFamily,
  setThemeMode,
  setPaletteId,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="lazy-settings-drawer__backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <aside
        className="lazy-settings-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="lazy-settings-drawer__header">
          <div>
            <p className="lazy-settings-drawer__eyebrow">Global Settings</p>
            <h2 className="lazy-settings-drawer__title">Themes & Palettes</h2>
          </div>
          <button className="lazy-button ghost" type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="lazy-settings-drawer__content">
          <Settings
            themeFamily={themeFamily}
            themeMode={themeMode}
            paletteId={paletteId}
            resolvedMode={resolvedMode}
            themeFamilies={themeFamilies}
            paletteOptions={paletteOptions}
            setThemeFamily={setThemeFamily}
            setThemeMode={setThemeMode}
            setPaletteId={setPaletteId}
            showHeader={false}
          />
        </div>
      </aside>
    </div>
  );
};

export default SettingsDrawer;
