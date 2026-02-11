import { useEffect, useMemo, useState } from 'react';
import {
  ALL_PALETTE_CLASSES,
  ALL_THEME_CLASSES,
  PALETTE_OPTIONS,
  THEME_CLASS_MAP,
  THEME_FAMILIES,
  THEME_SETTINGS_STORAGE_KEY,
  readStoredThemeSettings,
  resolvePaletteId,
  resolveThemeFamily,
  resolveThemeMode,
} from '../theme/themeConfig.js';

/**
 * @typedef {Object} ThemeFamilyOption
 * @property {string} id
 * @property {string} label
 */

/**
 * @typedef {Object} PaletteOption
 * @property {string} id
 * @property {string} label
 */

/**
 * @typedef {Object} ThemeSettingsState
 * @property {string} themeFamily - The active theme family id.
 * @property {'light'|'dark'|'system'} themeMode - The requested theme mode.
 * @property {string} paletteId - The active palette id.
 * @property {'light'|'dark'} resolvedMode - The computed light/dark mode.
 * @property {ThemeFamilyOption[]} themeFamilies - The available theme families.
 * @property {PaletteOption[]} paletteOptions - The available palette options.
 * @property {(nextFamily: string) => void} setThemeFamily - The theme family setter.
 * @property {(nextMode: 'light'|'dark'|'system') => void} setThemeMode - The mode setter.
 * @property {(nextPaletteId: string) => void} setPaletteId - The palette setter.
 */

/**
 * Syncs theme settings with local storage and root theme classes.
 *
 * @returns {ThemeSettingsState} The theme settings state and setters.
 */
const useThemeSettings = () => {
  const stored = readStoredThemeSettings();
  const [themeFamily, setThemeFamily] = useState(
    resolveThemeFamily(stored.themeFamily)
  );
  const [themeMode, setThemeMode] = useState(resolveThemeMode(stored.themeMode));
  const [paletteId, setPaletteId] = useState(resolvePaletteId(stored.paletteId));
  const [systemMode, setSystemMode] = useState('light');

  useEffect(() => {
    if (themeMode !== 'system') {
      return undefined;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemMode(media.matches ? 'dark' : 'light');

    update();
    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, [themeMode]);

  const resolvedMode = themeMode === 'system' ? systemMode : themeMode;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      THEME_SETTINGS_STORAGE_KEY,
      JSON.stringify({ themeFamily, themeMode, paletteId })
    );
  }, [themeFamily, themeMode, paletteId]);

  useEffect(() => {
    const root = document.documentElement;
    const family = resolveThemeFamily(themeFamily);
    const palette = resolvePaletteId(paletteId);
    const themeClass = THEME_CLASS_MAP[family][resolvedMode];

    root.classList.remove(...ALL_THEME_CLASSES, ...ALL_PALETTE_CLASSES);
    root.classList.add(themeClass, `radf-palette-${palette}`);
  }, [themeFamily, paletteId, resolvedMode]);

  return useMemo(
    () => ({
      themeFamily,
      themeMode,
      paletteId,
      resolvedMode,
      themeFamilies: THEME_FAMILIES,
      paletteOptions: PALETTE_OPTIONS,
      setThemeFamily,
      setThemeMode,
      setPaletteId,
    }),
    [
      themeFamily,
      themeMode,
      paletteId,
      resolvedMode,
      setThemeFamily,
      setThemeMode,
      setPaletteId,
    ]
  );
};

export default useThemeSettings;
