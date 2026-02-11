export const THEME_SETTINGS_STORAGE_KEY = 'lazyDashboards.themeSettings';

export const THEME_FAMILIES = [
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

export const THEME_CLASS_MAP = {
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

export const PALETTE_OPTIONS = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'tableau10', label: 'Tableau 10' },
  { id: 'set2', label: 'Set 2' },
  { id: 'dark2', label: 'Dark 2' },
  { id: 'okabe-ito', label: 'Okabe-Ito' },
  { id: 'viridis', label: 'Viridis' },
  { id: 'rdylgn', label: 'RdYlGn' },
];

export const ALL_THEME_CLASSES = Object.values(THEME_CLASS_MAP).flatMap((modes) =>
  Object.values(modes)
);

export const ALL_PALETTE_CLASSES = PALETTE_OPTIONS.map(
  ({ id }) => `radf-palette-${id}`
);

export const resolveThemeFamily = (value) =>
  THEME_CLASS_MAP[value] ? value : 'default';

export const resolveThemeMode = (value) =>
  value === 'light' || value === 'dark' || value === 'system' ? value : 'system';

export const resolveResolvedMode = (value) =>
  value === 'light' || value === 'dark' ? value : 'light';

export const resolvePaletteId = (value) =>
  PALETTE_OPTIONS.some((palette) => palette.id === value)
    ? value
    : 'analytics';

export const readStoredThemeSettings = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(THEME_SETTINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};
