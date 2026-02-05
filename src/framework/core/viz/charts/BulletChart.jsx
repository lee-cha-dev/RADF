/**
 * @module core/viz/charts/BarWithThresholdPanel
 * @description Bullet chart table with per-row marker lines, department coloring,
 * vertical grid lines, and a three-column layout (names | bars | percent).
 */
import React, { useMemo, useRef, useState, useCallback } from 'react';
import ChartContainer from '../common/ChartContainer.jsx';
import BulletChartTooltip from '../common/BulletChartTooltip.jsx';
import { getSeriesVar } from '../palettes/paletteRegistry';

const SERIES_COUNT = 12;

/**
 * Normalize a category key.
 * @param {*} value - Raw value.
 * @returns {string|null} Normalized key.
 */
const normalizeKey = (value) => (value == null ? null : String(value));

/**
 * Parse a CSS color string into rgb values.
 * @param {string} color - CSS color string.
 * @returns {{r:number,g:number,b:number}|null} RGB or null.
 */
const parseColor = (color) => {
  if (!color) {
    return null;
  }
  const trimmed = color.trim();
  if (trimmed.startsWith('#')) {
    const hex = trimmed.replace('#', '');
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
    return null;
  }
  if (trimmed.startsWith('rgb')) {
    const match = trimmed.match(/rgba?\(([^)]+)\)/i);
    if (!match) {
      return null;
    }
    const parts = match[1].split(',').map((part) => parseFloat(part.trim()));
    if (parts.length < 3) {
      return null;
    }
    return { r: parts[0], g: parts[1], b: parts[2] };
  }
  return null;
};

/**
 * Convert RGB to HSL hue.
 * @param {{r:number,g:number,b:number}} rgb - RGB values.
 * @returns {{h:number,s:number,l:number}} HSL values.
 */
const rgbToHsl = ({ r, g, b }) => {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    if (max === nr) {
      h = ((ng - nb) / delta) % 6;
    } else if (max === ng) {
      h = (nb - nr) / delta + 2;
    } else {
      h = (nr - ng) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) {
      h += 360;
    }
    s = delta / (1 - Math.abs(2 * l - 1));
  }

  return { h, s, l };
};

/**
 * Determine if a color reads as a red hue.
 * @param {string} color - CSS color string.
 * @returns {boolean} True if color is red-ish.
 */
const isRedHue = (color) => {
  const rgb = parseColor(color);
  if (!rgb) {
    return false;
  }
  const { h, s, l } = rgbToHsl(rgb);
  const isHueRed = h <= 20 || h >= 340;
  return isHueRed && s > 0.35 && l > 0.2 && l < 0.85;
};

/**
 * Resolve non-red series indices based on computed palette colors.
 * @returns {number[]} Series indices that avoid red hues.
 */
const resolveNonRedSeriesIndices = () => {
  const indices = Array.from({ length: SERIES_COUNT }, (_, index) => index);
  if (typeof window === 'undefined' || !window.getComputedStyle) {
    return indices.filter((index) => index !== 2);
  }
  const styles = window.getComputedStyle(document.documentElement);
  const allowed = indices.filter((index) => {
    const color = styles.getPropertyValue(`--radf-series-${index + 1}`);
    return !isRedHue(color);
  });
  return allowed.length ? allowed : indices;
};

/**
 * Build a color map for categorical coloring using series palette.
 * Ensures each unique category gets a distinct color from the palette.
 */
const buildCategoryColorMap = (data, colorKey, seriesIndices) => {
  if (!colorKey || !data?.length) {
    return new Map();
  }

  const categories = [];
  const seen = new Set();
  data.forEach((row) => {
    const cat = normalizeKey(row[colorKey]);
    if (cat && !seen.has(cat)) {
      seen.add(cat);
      categories.push(cat);
    }
  });

  const colorMap = new Map();

  categories.forEach((cat, index) => {
    const seriesIndex = seriesIndices[index % seriesIndices.length] ?? 0;
    colorMap.set(cat, {
      color: getSeriesVar(seriesIndex),
      index: seriesIndex,
    });
  });
  return colorMap;
};

/**
 * Compute a quantile for sorted values.
 * @param {number[]} values - Sorted numeric values.
 * @param {number} quantile - Quantile between 0-1.
 * @returns {number|null} Quantile value.
 */
const computeQuantile = (values, quantile) => {
  if (!values.length) {
    return null;
  }
  const position = (values.length - 1) * quantile;
  const base = Math.floor(position);
  const rest = position - base;
  if (values[base + 1] != null) {
    return values[base] + rest * (values[base + 1] - values[base]);
  }
  return values[base];
};

/**
 * Compute IQR upper bounds per group.
 * @param {Array<Object>} data - Rows.
 * @param {string|null} groupKey - Grouping key.
 * @param {string} valueKey - Value key.
 * @returns {Map<string, number>} Group to upper bound map.
 */
const computeIqrUpperBounds = (data, groupKey, valueKey) => {
  const grouped = new Map();
  data.forEach((row) => {
    const group = normalizeKey(groupKey ? row[groupKey] : 'all');
    const value = row[valueKey];
    if (group && Number.isFinite(value)) {
      if (!grouped.has(group)) {
        grouped.set(group, []);
      }
      grouped.get(group).push(value);
    }
  });

  const bounds = new Map();
  grouped.forEach((values, group) => {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = computeQuantile(sorted, 0.25);
    const q3 = computeQuantile(sorted, 0.75);
    if (q1 == null || q3 == null) {
      return;
    }
    const iqr = q3 - q1;
    bounds.set(group, q3 + 1.5 * iqr);
  });

  return bounds;
};

/**
 * Compute averages per group.
 * @param {Array<Object>} data - Rows.
 * @param {string|null} groupKey - Grouping key.
 * @param {string} valueKey - Value key.
 * @returns {Map<string, number>} Group to average map.
 */
const computeGroupAverages = (data, groupKey, valueKey) => {
  const grouped = new Map();
  data.forEach((row) => {
    const group = normalizeKey(groupKey ? row[groupKey] : 'all');
    const value = row[valueKey];
    if (group && Number.isFinite(value)) {
      if (!grouped.has(group)) {
        grouped.set(group, { total: 0, count: 0 });
      }
      const entry = grouped.get(group);
      entry.total += value;
      entry.count += 1;
    }
  });

  const averages = new Map();
  grouped.forEach((entry, group) => {
    if (entry.count > 0) {
      averages.set(group, entry.total / entry.count);
    }
  });
  return averages;
};

/**
 * Sanitize legacy marker labels that contain threshold/sigma language.
 * @param {string|undefined} raw - Raw label from config.
 * @returns {string} Sanitized label.
 */
const sanitizeMarkerLabel = (raw) => {
  if (!raw || /threshold/i.test(raw) || /[μσ]/.test(raw) || /std\s*dev/i.test(raw)) {
    return 'Dept average';
  }
  return raw;
};

/**
 * Single bullet row component with tooltip support.
 */
function BulletRow({
  row,
  xKey,
  yKey,
  colorKey,
  dotColorKey,
  barColorMap,
  dotColorMap,
  showAnnotations,
  maxValue,
  markerValue,
  markerColor,
  markerEnabled,
  outlierBound,
  percentKey,
  showPercent,
  onClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}) {
  const value = row[xKey] || 0;
  const label = row[yKey] || '';
  const category = normalizeKey(row[colorKey]);
  const dotCategory = normalizeKey(row[dotColorKey]);
  const barColorEntry = category ? barColorMap.get(category) : null;
  const dotColorEntry = dotCategory ? dotColorMap.get(dotCategory) : null;
  const barColorClass = barColorEntry
    ? `radf-chart-color-${barColorEntry.index}`
    : 'radf-chart-color-0';
  const dotColorClass = dotColorEntry ? `radf-chart-color-${dotColorEntry.index}` : barColorClass;

  const percent = showPercent && percentKey ? row[percentKey] : null;

  const barWidthPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const markerPercent =
    markerEnabled && markerValue != null && maxValue > 0 ? (markerValue / maxValue) * 100 : null;

  const exceedsThreshold = outlierBound != null && value > outlierBound;

  const handleMouseEnter = useCallback(
    (e) => {
      onMouseEnter?.(row, e);
    },
    [row, onMouseEnter]
  );

  const handleMouseMove = useCallback(
    (e) => {
      onMouseMove?.(row, e);
    },
    [row, onMouseMove]
  );

  return (
    <div
      className="radf-bullet__row"
      onClick={() => onClick?.(row)}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={0}
    >
      {/* Name column */}
      <div className="radf-bullet__name-cell">
        {showAnnotations ? (
          <span className={['radf-bullet__dot', dotColorClass].join(' ')} />
        ) : null}
        <span className="radf-bullet__name">{label}</span>
      </div>

      {/* Bar column */}
      <div className="radf-bullet__bar-cell">
        <div className="radf-bullet__track">
          {/* Background track */}
          <div className="radf-bullet__track-bg" />

          {/* Value bar */}
          <div
            className={[
              'radf-bullet__bar',
              barColorClass,
              exceedsThreshold ? 'radf-bullet__bar--exceeded' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              width: `${barWidthPercent}%`,
            }}
          >
            {/* Value label ON the bar */}
            <span className="radf-bullet__value-label">
              {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}h
            </span>
          </div>

          {/* Marker line */}
          {markerPercent != null && markerEnabled && (
            <div
              className="radf-bullet__marker"
              style={{
                left: `${markerPercent}%`,
                background: markerColor || 'var(--radf-text-muted)',
              }}
            />
          )}
        </div>
      </div>

      {/* Percent column */}
      {showPercent && (
        <div className="radf-bullet__pct-cell">
          {percent != null ? `${percent.toFixed(1)}%` : '—'}
        </div>
      )}
    </div>
  );
}

/**
 * Render a bullet chart table with per-row marker lines.
 */
function BulletChart({ data = [], encodings = {}, options = {}, handlers = {}, hiddenKeys }) {
  const bulletRef = useRef(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    row: null,
    position: null,
  });

  const isHorizontal = options.orientation === 'horizontal';
  const markerConfig = options.markerLines || options.thresholdMarkers || {};
  const markerEnabled = markerConfig?.enabled !== false;
  const outlierConfig = options.outlierRule || {};
  const colorKey = encodings.color || options.colorBy;
  const leftAnnotations = options.leftAnnotations || {};
  const leftAnnotationKey = leftAnnotations.colorBy || colorKey;
  const showAnnotations = leftAnnotations.enabled !== false && leftAnnotations.type !== 'none';
  const showPercent = options.showPercentColumn !== false;
  const percentKey = options.percentKey;

  const xKey = isHorizontal ? encodings.x : encodings.y;
  const yKey = isHorizontal ? encodings.y : encodings.x;

  const seriesIndices = useMemo(() => resolveNonRedSeriesIndices(), []);

  const filteredData = useMemo(() => {
    if (!hiddenKeys?.size || !colorKey) {
      return data;
    }
    return data.filter((row) => !hiddenKeys.has(row[colorKey]));
  }, [data, hiddenKeys, colorKey]);

  const barColorMap = useMemo(
    () => buildCategoryColorMap(filteredData, colorKey, seriesIndices),
    [filteredData, colorKey, seriesIndices]
  );

  const annotationColorMap = useMemo(
    () =>
      leftAnnotationKey === colorKey
        ? barColorMap
        : buildCategoryColorMap(filteredData, leftAnnotationKey, seriesIndices),
    [filteredData, leftAnnotationKey, colorKey, seriesIndices, barColorMap]
  );

  const legendItems = useMemo(() => {
    if (!colorKey || !filteredData?.length) {
      return [];
    }
    const categories = [];
    const seen = new Set();
    filteredData.forEach((row) => {
      const cat = normalizeKey(row[colorKey]);
      if (cat && !seen.has(cat)) {
        seen.add(cat);
        categories.push(cat);
      }
    });
    return categories.map((cat) => {
      const entry = barColorMap.get(cat);
      return {
        key: cat,
        label: cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        index: entry?.index ?? 0,
      };
    });
  }, [filteredData, colorKey, barColorMap]);

  const outlierValueKey =
    outlierConfig.valueKey ||
    options.iqrValueKey ||
    options.outlierValueKey ||
    options.thresholdMarkers?.valueKey ||
    'dept_threshold';

  const markerValueKey =
    options.markerLines?.valueKey ||
    (markerConfig.valueKey && markerConfig.valueKey !== outlierValueKey
      ? markerConfig.valueKey
      : null) ||
    options.averageKey ||
    'dept_average';

  const hasOutlierKey = useMemo(
    () => filteredData.some((row) => Number.isFinite(row?.[outlierValueKey])),
    [filteredData, outlierValueKey]
  );

  const iqrBounds = useMemo(() => {
    if (hasOutlierKey) {
      return new Map();
    }
    return computeIqrUpperBounds(filteredData, colorKey, xKey);
  }, [filteredData, colorKey, xKey, hasOutlierKey]);

  const hasMarkerKey = useMemo(
    () => filteredData.some((row) => Number.isFinite(row?.[markerValueKey])),
    [filteredData, markerValueKey]
  );

  const markerAverages = useMemo(() => {
    if (hasMarkerKey) {
      return new Map();
    }
    return computeGroupAverages(filteredData, colorKey, xKey);
  }, [filteredData, colorKey, xKey, hasMarkerKey]);

  const getMarkerValue = useCallback(
    (row) => {
      if (!markerEnabled) {
        return null;
      }
      if (Number.isFinite(row?.[markerValueKey])) {
        return row[markerValueKey];
      }
      const group = normalizeKey(colorKey ? row[colorKey] : 'all');
      return markerAverages.get(group) ?? null;
    },
    [markerEnabled, markerValueKey, markerAverages, colorKey]
  );

  const getOutlierBound = useCallback(
    (row) => {
      if (Number.isFinite(row?.[outlierValueKey])) {
        return row[outlierValueKey];
      }
      const group = normalizeKey(colorKey ? row[colorKey] : 'all');
      return iqrBounds.get(group) ?? null;
    },
    [outlierValueKey, iqrBounds, colorKey]
  );

  const getExceeds = useCallback(
    (row) => {
      const bound = getOutlierBound(row);
      const value = row?.[xKey];
      return Number.isFinite(bound) && Number.isFinite(value) && value > bound;
    },
    [getOutlierBound, xKey]
  );

  const maxValue = useMemo(() => {
    if (!filteredData.length) return 100;
    let max = 0;
    filteredData.forEach((row) => {
      const val = row[xKey] || 0;
      const markerValue = getMarkerValue(row) || 0;
      max = Math.max(max, val, markerValue);
    });
    return max * 1.1;
  }, [filteredData, xKey, getMarkerValue]);

  // X-axis tick values
  const xTicks = useMemo(() => {
    const step = Math.ceil(maxValue / 4 / 50) * 50;
    const ticks = [];
    for (let i = 0; i <= maxValue; i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [maxValue]);

  // Check if any rows exceed peer bounds
  const hasExceededThreshold = useMemo(
    () => filteredData.some((row) => getExceeds(row)),
    [filteredData, getExceeds]
  );

  /**
   * Compute tooltip position relative to the bullet container.
   * @param {MouseEvent} e - Native mouse event.
   * @returns {{x: number, y: number}|null} Container-relative coordinates.
   */
  const resolveTooltipPosition = useCallback((e) => {
    const container = bulletRef.current;
    if (!container) {
      return null;
    }
    const rect = container.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseEnter = useCallback(
    (row, e) => {
      setTooltip({
        visible: true,
        row,
        position: resolveTooltipPosition(e),
      });
    },
    [resolveTooltipPosition]
  );

  const handleMouseMove = useCallback(
    (row, e) => {
      setTooltip((prev) => ({
        ...prev,
        row,
        position: resolveTooltipPosition(e),
      }));
    },
    [resolveTooltipPosition]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  /* Sanitize legacy label — strip threshold / sigma language */
  const markerLabel = sanitizeMarkerLabel(markerConfig.label);
  /* Use explicit markerLines color, otherwise neutral token */
  const markerColor = options.markerLines?.color || '#E0E000';
  const subtitle =
    options.subtitle ||
    options.chartSubtitle ||
    'Bars show individual OT; marker shows dept average; highlights indicate higher-than-peer OT';
  const xTitle = options.headerTitles.xTitle || '';
  const yTitle = options.headerTitles.yTitle || '';
  const percentTitle = options.headerTitles.percentTitle || '';

  return (
    <ChartContainer subtitle={subtitle}>
      <div className="radf-bullet" ref={bulletRef}>
        {/* Header row */}
        <div className="radf-bullet__header">
          <div className="radf-bullet__name-cell">
            <span className="radf-bullet__axis-label radf-bullet-name-label">{xTitle}</span>
          </div>
          <div className="radf-bullet__bar-cell">
            <span className="radf-bullet__axis-label">{yTitle}</span>
          </div>
          {showPercent && (
            <div className="radf-bullet__pct-cell radf-bullet__pct-header">{percentTitle}</div>
          )}
        </div>

        {/* Data rows */}
        <div className="radf-bullet__body">
          {/* Vertical grid lines container */}
          <div className="radf-bullet__grid-lines">
            <div className="radf-bullet__name-cell" />
            <div className="radf-bullet__bar-cell">
              <div className="radf-bullet__grid-container">
                {xTicks.map((tick) => (
                  <div
                    key={tick}
                    className="radf-bullet__grid-line"
                    style={{ left: `${(tick / maxValue) * 100}%` }}
                  />
                ))}
              </div>
            </div>
            {showPercent && <div className="radf-bullet__pct-cell" />}
          </div>

          {filteredData.map((row, index) => (
            <BulletRow
              key={row[yKey] || index}
              row={row}
              xKey={xKey}
              yKey={yKey}
              colorKey={colorKey}
              dotColorKey={leftAnnotationKey}
              barColorMap={barColorMap}
              dotColorMap={annotationColorMap}
              showAnnotations={showAnnotations}
              maxValue={maxValue}
              markerValue={getMarkerValue(row)}
              markerColor={markerColor}
              markerEnabled={markerEnabled}
              outlierBound={getOutlierBound(row)}
              percentKey={percentKey}
              showPercent={showPercent}
              onClick={handlers.onClick}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </div>

        {/* X-axis */}
        <div className="radf-bullet__axis">
          <div className="radf-bullet__name-cell" />
          <div className="radf-bullet__bar-cell">
            <div className="radf-bullet__axis-ticks">
              {xTicks.map((tick) => (
                <span
                  key={tick}
                  className="radf-bullet__tick"
                  style={{ left: `${(tick / maxValue) * 100}%` }}
                >
                  {tick.toLocaleString()}
                </span>
              ))}
            </div>
          </div>
          {showPercent && <div className="radf-bullet__pct-cell" />}
        </div>

        {/* Legend */}
        {(legendItems.length > 0 || markerEnabled || hasExceededThreshold) && (
          <div className="radf-bullet__legend">
            <ul className="radf-bullet__legend-list">
              {legendItems.map((item) => {
                const isHidden = hiddenKeys?.has(item.key);
                return (
                  <li
                    key={item.key}
                    className={[
                      'radf-bullet__legend-item',
                      isHidden ? 'radf-bullet__legend-item--hidden' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <button
                      type="button"
                      className="radf-bullet__legend-button"
                      onClick={() => handlers.onLegendToggle?.(item.key)}
                    >
                      <span
                        className={[
                          'radf-bullet__legend-swatch',
                          `radf-chart-color-${item.index}`,
                        ].join(' ')}
                      />
                      <span className="radf-bullet__legend-label">{item.label}</span>
                    </button>
                  </li>
                );
              })}
              {markerEnabled && (
                <li className="radf-bullet__legend-item radf-bullet__legend-item--marker">
                  <span
                    className="radf-bullet__legend-line"
                    style={{
                      background: markerColor,
                    }}
                  />
                  <span className="radf-bullet__legend-label">{markerLabel}</span>
                </li>
              )}
              {hasExceededThreshold && (
                <li className="radf-bullet__legend-item radf-bullet__legend-item--exceeded">
                  <span className="radf-bullet__legend-exceeded-swatch" />
                  <span className="radf-bullet__legend-label">Higher than most peers</span>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Custom Tooltip */}
        <BulletChartTooltip
          row={tooltip.row}
          nameKey={yKey}
          valueKey={xKey}
          colorKey={colorKey}
          percentKey={percentKey}
          markerLabel={markerLabel}
          colorMap={barColorMap}
          position={tooltip.position}
          visible={tooltip.visible}
          getMarkerValue={getMarkerValue}
          getExceeds={getExceeds}
        />
      </div>
    </ChartContainer>
  );
}

export default BulletChart;
