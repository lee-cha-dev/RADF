/**
 * @module core/viz/charts/KpiPanel
 * @description KPI panel visualization with variant registry + subtype support.
 */
import React, { useMemo } from 'react';

const VALID_VARIANTS = new Set(['clean', 'accent', 'gradient', 'icon', 'compact']);
const VALID_BADGE_TONES = new Set(['neutral', 'success', 'warning', 'danger']);
const VALID_TONES = new Set(['success', 'warning', 'danger']);
const KPI_VARIANT_REGISTRY = new Map();
const DEFAULT_CURRENCY_COMPACT_THRESHOLD = 1000000;

const clampDecimals = (value, fallback = 0) =>
  Number.isFinite(value) && value >= 0 ? value : fallback;

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
  if (format === 'hours' || format === 'time') {
    return formatHours(value, decimals);
  }
  const numericValue = typeof value === 'number' ? value : Number(value);
  const isNumeric = Number.isFinite(numericValue);
  if (!isNumeric) {
    return String(value);
  }
  if (format === 'currency') {
    const compactThreshold = Number.isFinite(options.compactThreshold)
      ? options.compactThreshold
      : DEFAULT_CURRENCY_COMPACT_THRESHOLD;
    const shouldCompact =
      options.compact === true ||
      (options.compact === 'auto' && Math.abs(numericValue) >= compactThreshold);
    const formatterOptions = {
      style: 'currency',
      currency: options.currency || 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    };
    if (shouldCompact) {
      formatterOptions.notation = 'compact';
      formatterOptions.compactDisplay = 'short';
    }
    return numericValue.toLocaleString(undefined, formatterOptions);
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

const normalizeVariant = (variant) => {
  const key = typeof variant === 'string' ? variant.toLowerCase() : variant;
  return VALID_VARIANTS.has(key) ? key : 'clean';
};

const normalizeBadgeTone = (tone) => {
  const key = typeof tone === 'string' ? tone.toLowerCase() : tone;
  return VALID_BADGE_TONES.has(key) ? key : 'neutral';
};

const normalizeTone = (tone) => {
  const key = typeof tone === 'string' ? tone.toLowerCase() : tone;
  return VALID_TONES.has(key) ? key : undefined;
};

const GENERAL_SUBTYPE_PRESETS = {
  standard: {},
  currency: {
    format: 'currency',
    compact: 'auto',
    compactThreshold: DEFAULT_CURRENCY_COMPACT_THRESHOLD,
    decimals: 0,
  },
  'large-value': { format: 'compact', decimals: 1 },
  integer: { format: 'number', decimals: 0 },
  count: { format: 'number', decimals: 0 },
  percentage: { format: 'percent', decimals: 1 },
  'decimal-percentage': { format: 'percent', decimals: 2 },
  decimal: { format: 'number', decimals: 2 },
  ratio: { format: 'ratio' },
  amount: { format: 'currency', decimals: 0 },
  time: { format: 'hours', decimals: 1 },
  negative: { valueTone: 'danger' },
  duration: { format: 'duration', decimals: 0 },
  index: { format: 'number', decimals: 0 },
};

const VARIANT_SUBTYPE_PRESETS = {
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
      badgeTone: 'warning',
      badgeIcon: 'minus',
    },
    efficiency: {
      badgeText: '-8% reduction',
      badgeTone: 'success',
      badgeIcon: 'trend-down',
    },
  },
};

const VARIANT_BASE_PRESETS = {
  icon: { icon: 'users' },
  compact: {
    badgeText: '+12% vs last month',
    badgeTone: 'success',
    badgeIcon: 'check',
  },
};

const normalizeSubtype = (subtype) => {
  if (subtype == null) {
    return 'standard';
  }
  const key = String(subtype).trim().toLowerCase();
  return key ? key.replace(/[^a-z0-9]+/g, '-') : 'standard';
};

const applySubtypePreset = (variant, subtype, viewModel) => {
  const lowerVariant = (variant || '').toLowerCase();
  const lowerSubtype = (subtype || '').toLowerCase();
  const presets = {
    ...GENERAL_SUBTYPE_PRESETS,
    ...(VARIANT_SUBTYPE_PRESETS[lowerVariant] || {}),
  };
  const preset = presets[lowerSubtype] || presets.standard || {};
  const mergedPreset = {
    ...(VARIANT_BASE_PRESETS[lowerVariant] || {}),
    ...preset,
  };
  const next = { ...viewModel };
  if (!viewModel.format && mergedPreset.format) next.format = mergedPreset.format;
  if (viewModel.compact == null && mergedPreset.compact != null) next.compact = mergedPreset.compact;
  if (viewModel.compactThreshold == null && mergedPreset.compactThreshold != null) {
    next.compactThreshold = mergedPreset.compactThreshold;
  }
  if (!viewModel.icon && mergedPreset.icon) next.icon = mergedPreset.icon;
  if (!viewModel.badgeText && mergedPreset.badgeText) next.badgeText = mergedPreset.badgeText;
  if (!viewModel.badgeIcon && mergedPreset.badgeIcon) next.badgeIcon = mergedPreset.badgeIcon;
  if (viewModel.badgeTone === 'neutral' && mergedPreset.badgeTone) {
    next.badgeTone = mergedPreset.badgeTone;
  }
  if (viewModel.valueTone == null && mergedPreset.valueTone) next.valueTone = mergedPreset.valueTone;
  if (viewModel.iconTone == null && mergedPreset.iconTone) next.iconTone = mergedPreset.iconTone;
  if (typeof mergedPreset.decimals === 'number' && viewModel.decimals == null) {
    next.decimals = mergedPreset.decimals;
  }
  return next;
};

const normalizeOptions = (options) => ({
  variant: normalizeVariant(options?.variant),
  subtype: normalizeSubtype(options?.subtype ?? options?.subvariant),
  format: options?.format,
  currency: options?.currency || 'USD',
  decimals: Number.isFinite(options?.decimals) ? options.decimals : null,
  compact: options?.compact ?? null,
  compactThreshold: Number.isFinite(options?.compactThreshold) ? options.compactThreshold : null,
  ratioDenominator: options?.ratioDenominator ?? null,
  label: options?.label || '',
  caption: options?.caption || '',
  badgeText: options?.badgeText || '',
  badgeTone: normalizeBadgeTone(options?.badgeTone),
  badgeIcon: options?.badgeIcon || '',
  icon: options?.icon || '',
  valueTone: normalizeTone(options?.valueTone),
  iconTone: normalizeTone(options?.iconTone),
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
    trend: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <polyline
          points="4 16 10 10 14 14 20 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="16 8 20 8 20 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
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
    revenue: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3v18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 7c0-1.657 1.79-3 4-3s4 1.343 4 3-1.79 3-4 3-4 1.343-4 3 1.79 3 4 3 4-1.343 4-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3 5 6v6c0 4.418 2.686 8.418 7 9 4.314-.582 7-4.582 7-9V6l-7-3Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
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
      this.viewModel.subtype
        ? `ladf-kpi--subtype-${String(this.viewModel.subtype).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
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
    const toneClass = this.viewModel.valueTone ? `ladf-kpi__value--${this.viewModel.valueTone}` : '';
    return <div className={`ladf-kpi__value ${toneClass}`.trim()}>{this.viewModel.formattedValue}</div>;
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
 * Render a KPI panel displaying a single aggregated value with variant/subtype support.
 * @param {Object} props - KPI props.
 * @param {Array<Object>} [props.data] - KPI data rows.
 * @param {Object} [props.encodings] - Encoding map (value/label/trend/comparison).
 * @param {Object} [props.options] - KPI options (variant, subtype, formatting).
 * @param {Object} [props.panelConfig] - Parent panel metadata (title/subtitle for defaults).
 * @returns {JSX.Element} KPI visualization.
 */
function KpiPanel({ data = [], encodings = {}, options = {}, panelConfig = null }) {
  const viewModel = useMemo(() => {
    const normalized = normalizeOptions(options);
    const valueKey = resolveValueKey(encodings, data);
    const rawValue = valueKey ? data?.[0]?.[valueKey] : null;
    const label = options?.label || panelConfig?.title || encodings?.label || encodings?.value || '';
    const caption = options?.caption || panelConfig?.subtitle || '';

    const hydrated = applySubtypePreset(normalized.variant, normalized.subtype, {
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

export default KpiPanel;
// eslint-disable-next-line react-refresh/only-export-components
export { KPI_VARIANT_REGISTRY as kpiVariantRegistry, registerVariant as registerKpiVariant };
