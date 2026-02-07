import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'lazyDashboards.themeSettings';

const THEME_FAMILIES = [
  { id: 'default', label: 'Default' },
  { id: 'nord', label: 'Nord' },
  { id: 'dracula', label: 'Dracula' },
  { id: 'solarized', label: 'Solarized' },
  { id: 'monokai', label: 'Monokai' },
  { id: 'gruvbox', label: 'Gruvbox' },
  { id: 'material', label: 'Material' },
  { id: 'one', label: 'One' },
  { id: 'tokyo', label: 'Tokyo' },
  { id: 'catppuccin', label: 'Catppuccin' },
  { id: 'horizon', label: 'Horizon' },
];

const THEME_CLASS_MAP = {
  default: {
    light: 'radf-theme-light',
    dark: 'radf-theme-dark',
  },
  nord: {
    light: 'radf-theme-nord-light',
    dark: 'radf-theme-nord-dark',
  },
  dracula: {
    light: 'radf-theme-dracula-light',
    dark: 'radf-theme-dracula-dark',
  },
  solarized: {
    light: 'radf-theme-solarized-light',
    dark: 'radf-theme-solarized-dark',
  },
  monokai: {
    light: 'radf-theme-monokai-light',
    dark: 'radf-theme-monokai-dark',
  },
  gruvbox: {
    light: 'radf-theme-gruvbox-light',
    dark: 'radf-theme-gruvbox-dark',
  },
  material: {
    light: 'radf-theme-material-light',
    dark: 'radf-theme-material-dark',
  },
  one: {
    light: 'radf-theme-one-light',
    dark: 'radf-theme-one-dark',
  },
  tokyo: {
    light: 'radf-theme-tokyo-light',
    dark: 'radf-theme-tokyo-dark',
  },
  catppuccin: {
    light: 'radf-theme-catppuccin-light',
    dark: 'radf-theme-catppuccin-dark',
  },
  horizon: {
    light: 'radf-theme-horizon-light',
    dark: 'radf-theme-horizon-dark',
  },
};

const PALETTE_OPTIONS = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'tableau10', label: 'Tableau 10' },
  { id: 'set2', label: 'Set 2' },
  { id: 'dark2', label: 'Dark 2' },
  { id: 'okabe-ito', label: 'Okabe-Ito' },
  { id: 'viridis', label: 'Viridis' },
  { id: 'rdylgn', label: 'RdYlGn' },
];

const ALL_THEME_CLASSES = Object.values(THEME_CLASS_MAP).flatMap((modes) =>
  Object.values(modes)
);
const ALL_PALETTE_CLASSES = PALETTE_OPTIONS.map(
  ({ id }) => `radf-palette-${id}`
);

const getStoredSettings = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
};

const resolveFamily = (value) =>
  THEME_CLASS_MAP[value] ? value : 'default';

const resolveMode = (value) =>
  value === 'light' || value === 'dark' || value === 'system'
    ? value
    : 'system';

const resolvePalette = (value) =>
  PALETTE_OPTIONS.some((palette) => palette.id === value)
    ? value
    : 'analytics';

const useThemeSettings = () => {
  const stored = getStoredSettings();
  const [themeFamily, setThemeFamily] = useState(
    resolveFamily(stored.themeFamily)
  );
  const [themeMode, setThemeMode] = useState(resolveMode(stored.themeMode));
  const [paletteId, setPaletteId] = useState(resolvePalette(stored.paletteId));
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
      STORAGE_KEY,
      JSON.stringify({ themeFamily, themeMode, paletteId })
    );
  }, [themeFamily, themeMode, paletteId]);

  useEffect(() => {
    const root = document.documentElement;
    const family = resolveFamily(themeFamily);
    const palette = resolvePalette(paletteId);
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
