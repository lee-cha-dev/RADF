/**
 * @module core/viz/charts/KpiVariant
 * @description KPI variant visualization with category/subvariant formatting support.
 */
import React, { useMemo } from 'react';

const VALID_VARIANTS = new Set(['clean', 'accent', 'gradient', 'icon', 'compact']);
const VALID_BADGE_TONES = new Set(['neutral', 'success', 'warning', 'danger']);
const VALID_TONES = new Set(['success', 'warning', 'danger']);
const KPI_VARIANT_REGISTRY = new Map();

const clampDecimals = (value, fallback = 0) =>
  Number.isFinite(value) && value >= 0 ? value : fallback;

const normalizeVariant = (variant) => {
  if (typeof variant !== 'string') {
    return 'clean';
  }
  const key = variant.trim().toLowerCase();
  if (!key) {
    return 'clean';
  }
  if (['clean', 'minimal', 'minimal-clean', 'minimal/clean', 'minimal clean'].includes(key)) {
    return 'clean';
  }
  if (key.includes('accent')) {
    return 'accent';
  }
  if (key.includes('gradient') || key.includes('backdrop') || key.includes('halo')) {
    return 'gradient';
  }
  if (key.includes('icon')) {
    return 'icon';
  }
  if (key.includes('compact')) {
    return 'compact';
  }
  return VALID_VARIANTS.has(key) ? key : 'clean';
};

const normalizeSubvariant = (subvariant) => {
  if (subvariant == null) {
    return 'standard';
  }
  const key = String(subvariant).trim().toLowerCase();
  return key ? key.replace(/[^a-z0-9]+/g, '-') : 'standard';
};

const normalizeBadgeTone = (tone) => {
  const key = typeof tone === 'string' ? tone.toLowerCase() : tone;
  return VALID_BADGE_TONES.has(key) ? key : 'neutral';
};

const normalizeTone = (tone) => {
  const key = typeof tone === 'string' ? tone.toLowerCase() : tone;
  return VALID_TONES.has(key) ? key : undefined;
};

const resolveValueKey = (encodings, data) => {
  if (encodings?.value) {
    return encodings.value;
  }
  if (encodings?.y) {
    return encodings.y;
  }
  if (data?.length) {
    const firstRow = data[0];
    return Object.keys(firstRow || {}).find((key) => typeof firstRow[key] === 'number') || null;
  }
  return null;
};

const resolveLabel = (options, encodings, data, panelConfig) => {
  if (options?.title || options?.label) {
    return options.title || options.label;
  }
  if (panelConfig?.title) {
    return panelConfig.title;
  }
  const labelKey = encodings?.label;
  if (labelKey && data?.length && data[0]?.[labelKey] != null) {
    return String(data[0][labelKey]);
  }
  if (typeof labelKey === 'string') {
    return labelKey;
  }
  return '';
};

const resolveCaption = (options, panelConfig) =>
  options?.subtitle || options?.caption || panelConfig?.subtitle || '';

const formatDuration = (value, decimals) => {
  const safeDecimals = Math.min(6, clampDecimals(decimals, 0));
  const sign = value < 0 ? '-' : '';
  const totalSeconds = Math.abs(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (hours) {
    parts.push(`${hours}h`);
  }
  if (minutes || hours) {
    parts.push(`${minutes}m`);
  }
  const secondsValue =
    safeDecimals > 0 ? seconds.toFixed(safeDecimals) : Math.round(seconds).toString();
  if (seconds || (!hours && !minutes)) {
    parts.push(`${secondsValue}s`);
  }
  return `${sign}${parts.join(' ')}`.trim();
};

const formatRatio = (value, options) => {
  if (Array.isArray(value) && value.length >= 2) {
    return `${value[0]}:${value[1]}`;
  }
  if (value && typeof value === 'object') {
    const numerator =
      value.numerator ?? value.n ?? value.left ?? value.a ?? value.top ?? value[0];
    const denominator =
      value.denominator ?? value.d ?? value.right ?? value.b ?? value.bottom ?? value[1];
    if (numerator != null && denominator != null) {
      return `${numerator}:${denominator}`;
    }
  }
  if (typeof value === 'string') {
    return value;
  }
  const numerator = typeof value === 'number' ? value : Number(value);
  const denominator =
    options?.ratioDenominator != null ? Number(options.ratioDenominator) : null;
  if (Number.isFinite(numerator) && Number.isFinite(denominator)) {
    return `${numerator}:${denominator}`;
  }
  if (Number.isFinite(numerator)) {
    return numerator.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  return value == null ? '--' : String(value);
};

const formatHours = (value, decimals) => {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return value == null ? '--' : String(value);
  }
  const safeDecimals = Math.min(6, clampDecimals(decimals, 1));
  const formatted = numericValue.toLocaleString(undefined, {
    minimumFractionDigits: safeDecimals,
    maximumFractionDigits: safeDecimals,
  });
  return `${formatted}h`;
};

const formatKpiValue = (value, options) => {
  const format = options.format || 'number';
  const decimals = clampDecimals(options.decimals, 0);
  if (value == null || value === '') {
    return '--';
  }
  if (format === 'ratio') {
    return formatRatio(value, options);
  }
  if (format === 'hours') {
    return formatHours(value, decimals);
  }
  const numericValue = typeof value === 'number' ? value : Number(value);
  const isNumeric = Number.isFinite(numericValue);
  if (!isNumeric) {
    return String(value);
  }
  if (format === 'currency') {
    return numericValue.toLocaleString(undefined, {
      style: 'currency',
      currency: options.currency || 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  if (format === 'percent') {
    return `${(numericValue * 100).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}%`;
  }
  if (format === 'compact') {
    const fractionDigits = decimals === 0 ? 1 : decimals;
    return numericValue.toLocaleString(undefined, {
      notation: 'compact',
      maximumFractionDigits: fractionDigits,
    });
  }
  if (format === 'duration') {
    return formatDuration(numericValue, decimals || 0);
  }
  if (format === 'custom') {
    if (typeof options.formatter === 'function') {
      return options.formatter(numericValue, options);
    }
    if (typeof options.customFormat === 'function') {
      return options.customFormat(numericValue, options);
    }
    return String(numericValue);
  }
  return numericValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const subvariantPresets = {
  clean: {
    standard: {},
    currency: { format: 'currency', decimals: 0 },
    'large-value': { format: 'compact', decimals: 1 },
    integer: { format: 'number', decimals: 0 },
    count: { format: 'number', decimals: 0 },
  },
  accent: {
    standard: {},
    percentage: { format: 'percent', decimals: 1 },
    decimal: { format: 'number', decimals: 2 },
    ratio: { format: 'ratio' },
    amount: { format: 'currency', decimals: 0 },
  },
  gradient: {
    standard: {},
    time: { format: 'hours', decimals: 1 },
    negative: { valueTone: 'danger' },
    duration: { format: 'duration', decimals: 0 },
    index: { format: 'number', decimals: 0 },
  },
  icon: {
    standard: { icon: 'users' },
    rating: { icon: 'star', format: 'number', decimals: 1 },
    alert: { icon: 'alert', valueTone: 'danger', iconTone: 'danger' },
    capacity: { icon: 'box', valueTone: 'warning', iconTone: 'warning' },
    velocity: { icon: 'spark', valueTone: 'success', iconTone: 'success' },
  },
  compact: {
    standard: {
      badgeText: '+12% vs last month',
      badgeTone: 'success',
      badgeIcon: 'check',
    },
    growth: {
      badgeText: '+28% growth',
      badgeTone: 'success',
      badgeIcon: 'trend-up',
    },
    minimal: {
      badgeText: 'All systems operational',
      badgeTone: 'success',
      badgeIcon: 'check',
    },
    score: {
      badgeText: 'No change',
      badgeTone: 'neutral',
      badgeIcon: 'minus',
    },
    efficiency: {
      badgeText: '-8% reduction',
      badgeTone: 'success',
      badgeIcon: 'trend-down',
    },
  },
};

const applySubvariantPreset = (variant, subvariant, viewModel) => {
  const lowerVariant = (variant || '').toLowerCase();
  const lowerSubvariant = (subvariant || '').toLowerCase();
  const presets = subvariantPresets[lowerVariant] || {};
  const preset = presets[lowerSubvariant] || presets.standard || {};
  const next = { ...viewModel };
  if (!viewModel.format && preset.format) next.format = preset.format;
  if (!viewModel.icon && preset.icon) next.icon = preset.icon;
  if (!viewModel.badgeText && preset.badgeText) next.badgeText = preset.badgeText;
  if (!viewModel.badgeIcon && preset.badgeIcon) next.badgeIcon = preset.badgeIcon;
  if (viewModel.badgeTone === 'neutral' && preset.badgeTone) next.badgeTone = preset.badgeTone;
  if (viewModel.valueTone == null && preset.valueTone) next.valueTone = preset.valueTone;
  if (viewModel.iconTone == null && preset.iconTone) next.iconTone = preset.iconTone;
  if (typeof preset.decimals === 'number' && viewModel.decimals == null) {
    next.decimals = preset.decimals;
  }
  return next;
};

const normalizeOptions = (options) => ({
  variant: normalizeVariant(options?.variant),
  subvariant: normalizeSubvariant(options?.subvariant ?? options?.subtype),
  format: options?.format,
  currency: options?.currency || 'USD',
  decimals: Number.isFinite(options?.decimals) ? options.decimals : null,
  title: options?.title || options?.label || '',
  subtitle: options?.subtitle || options?.caption || '',
  badgeText: options?.badgeText || '',
  badgeTone: normalizeBadgeTone(options?.badgeTone),
  badgeIcon: options?.badgeIcon || '',
  icon: options?.icon || '',
  valueTone: normalizeTone(options?.valueTone),
  iconTone: normalizeTone(options?.iconTone),
  value: options?.value,
});

const resolveIconNode = (iconKey) => {
  const icons = {
    star: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    alert: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
        <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    box: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle
          cx="11"
          cy="7"
          r="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    spark: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <polyline
          points="4 14 9 9 13 13 20 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <polyline
          points="20 6 9 17 4 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    minus: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    'trend-up': (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <polyline
          points="23 6 13.5 15.5 8.5 10.5 1 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="17 6 23 6 23 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    'trend-down': (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <polyline
          points="23 18 13.5 8.5 8.5 13.5 1 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="17 18 23 18 23 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };
  return icons[iconKey] || (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};

class BaseKpiVariant {
  constructor(viewModel) {
    this.viewModel = viewModel;
  }

  className() {
    const classes = [
      'ladf-kpi',
      `ladf-kpi--${this.viewModel.variant}`,
      this.viewModel.subvariant
        ? `ladf-kpi--subvariant-${String(this.viewModel.subvariant)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}`
        : null,
    ];
    return classes.filter(Boolean).join(' ');
  }

  renderLabel() {
    if (!this.viewModel.label) {
      return null;
    }
    return <div className="ladf-kpi__label">{this.viewModel.label}</div>;
  }

  renderValue() {
    const toneClass = this.viewModel.valueTone
      ? `ladf-kpi__value--${this.viewModel.valueTone}`
      : '';
    return (
      <div className={`ladf-kpi__value ${toneClass}`.trim()}>
        {this.viewModel.formattedValue}
      </div>
    );
  }

  renderCaption() {
    if (!this.viewModel.caption) {
      return null;
    }
    return <div className="ladf-kpi__caption">{this.viewModel.caption}</div>;
  }

  renderContent() {
    return (
      <>
        {this.renderLabel()}
        {this.renderValue()}
        {this.renderCaption()}
      </>
    );
  }

  render() {
    return <div className={this.className()}>{this.renderContent()}</div>;
  }
}

class CleanKpiVariant extends BaseKpiVariant {}

class AccentKpiVariant extends BaseKpiVariant {}

class GradientKpiVariant extends BaseKpiVariant {}

class IconKpiVariant extends BaseKpiVariant {
  renderIcon() {
    if (!this.viewModel.icon && !this.viewModel.label) {
      return null;
    }
    const iconNode = resolveIconNode(this.viewModel.icon || 'spark');
    const label = this.viewModel.label ? (
      <div className="ladf-kpi__label">{this.viewModel.label}</div>
    ) : null;
    const toneClass = this.viewModel.iconTone ? `ladf-kpi__icon--${this.viewModel.iconTone}` : '';
    return (
      <div className="ladf-kpi__header">
        <div className={`ladf-kpi__icon ${toneClass}`.trim()}>{iconNode}</div>
        {label}
      </div>
    );
  }

  renderContent() {
    return (
      <>
        {this.renderIcon()}
        {this.renderValue()}
        {this.renderCaption()}
      </>
    );
  }
}

class CompactKpiVariant extends BaseKpiVariant {
  renderBadge() {
    if (!this.viewModel.badgeText) {
      return null;
    }
    const iconNode = this.viewModel.badgeIcon ? resolveIconNode(this.viewModel.badgeIcon) : null;
    return (
      <div className={`ladf-kpi__badge ladf-kpi__badge--${this.viewModel.badgeTone}`}>
        {iconNode ? <span className="ladf-kpi__badge-icon">{iconNode}</span> : null}
        {this.viewModel.badgeText}
      </div>
    );
  }

  renderFooter() {
    const badge = this.renderBadge();
    if (!badge) {
      return null;
    }
    return <div className="ladf-kpi__footer">{badge}</div>;
  }

  renderContent() {
    return (
      <>
        {this.renderLabel()}
        {this.renderValue()}
        {this.renderCaption()}
        {this.renderFooter()}
      </>
    );
  }
}

const registerVariant = (variantId, VariantClass) =>
  KPI_VARIANT_REGISTRY.set(variantId, VariantClass);

registerVariant('clean', CleanKpiVariant);
registerVariant('accent', AccentKpiVariant);
registerVariant('gradient', GradientKpiVariant);
registerVariant('icon', IconKpiVariant);
registerVariant('compact', CompactKpiVariant);

const resolveVariantRenderer = (variantId) =>
  KPI_VARIANT_REGISTRY.get(variantId) || KPI_VARIANT_REGISTRY.get('clean');

/**
 * Render a KPI variant visualization with variant/subvariant formatting presets.
 * @param {Object} props - KPI props.
 * @param {Array<Object>} [props.data] - KPI data rows.
 * @param {Object} [props.encodings] - Encoding map (value/label).
 * @param {Object} [props.options] - KPI options (variant, subvariant, formatting).
 * @param {Object} [props.panelConfig] - Parent panel metadata (title/subtitle defaults).
 * @returns {JSX.Element} KPI visualization.
 */
function KpiVariant({ data = [], encodings = {}, options = {}, panelConfig = null }) {
  const viewModel = useMemo(() => {
    const normalized = normalizeOptions(options);
    const valueKey = resolveValueKey(encodings, data);
    const rawValue =
      normalized.value !== undefined && normalized.value !== null
        ? normalized.value
        : valueKey
        ? data?.[0]?.[valueKey]
        : null;
    const label = resolveLabel(normalized, encodings, data, panelConfig);
    const caption = resolveCaption(normalized, panelConfig);

    const hydrated = applySubvariantPreset(normalized.variant, normalized.subvariant, {
      ...normalized,
      valueKey,
      rawValue,
      label,
      caption,
    });

    return {
      ...hydrated,
      formattedValue: formatKpiValue(rawValue, hydrated),
    };
  }, [data, encodings, options, panelConfig]);

  const VariantRenderer = resolveVariantRenderer(viewModel.variant);
  const instance = useMemo(() => new VariantRenderer(viewModel), [VariantRenderer, viewModel]);
  return instance.render();
}

export default KpiVariant;
// eslint-disable-next-line react-refresh/only-export-components
export { KPI_VARIANT_REGISTRY as kpiVariantRegistry, registerVariant as registerKpiVariant };
