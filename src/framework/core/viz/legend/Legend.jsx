/**
 * @module core/viz/legend/Legend
 * @description Toggleable legend for palette assignments.
 */
import React from 'react';
import './legend.css';

/**
 * Resolve the swatch class from a palette CSS variable.
 * @param {string} colorVar - CSS variable string.
 * @returns {string} Swatch class name.
 */
const resolveSwatchClass = (colorVar) => {
  if (typeof colorVar !== 'string') {
    return 'radf-swatch--1';
  }
  const seriesMatch = colorVar.match(/--radf-series-(\d+)/);
  if (seriesMatch) {
    return `radf-swatch--${seriesMatch[1]}`;
  }
  const seqMatch = colorVar.match(/--radf-seq-(\d+)/);
  if (seqMatch) {
    return `radf-swatch--seq-${seqMatch[1]}`;
  }
  const divNegMatch = colorVar.match(/--radf-div-neg-(\d+)/);
  if (divNegMatch) {
    return `radf-swatch--div-neg-${divNegMatch[1]}`;
  }
  const divPosMatch = colorVar.match(/--radf-div-pos-(\d+)/);
  if (divPosMatch) {
    return `radf-swatch--div-pos-${divPosMatch[1]}`;
  }
  if (colorVar.includes('--radf-div-zero')) {
    return 'radf-swatch--div-zero';
  }
  return 'radf-swatch--1';
};

/**
 * @typedef {Object} LegendItem
 * @property {string} key - Unique key for the series/category.
 * @property {string} label - Label shown in the legend.
 * @property {string} colorVar - CSS variable for the swatch color.
 */

/**
 * @typedef {Object} LegendProps
 * @property {LegendItem[]} [items] - Legend items to display.
 * @property {Set<string>} [hiddenKeys] - Keys hidden from the chart.
 * @property {(key: string) => void} [onToggle] - Toggle handler for legend items.
 * @property {('top'|'bottom'|'right')} [position] - Legend position.
 */

/**
 * Render a palette-aware legend list.
 * @param {LegendProps} props - Legend props.
 * @returns {JSX.Element|null} Legend markup.
 */
function Legend({
  items = [],
  hiddenKeys,
  onToggle,
  position = 'bottom',
}) {
  if (!items.length) {
    return null;
  }
  const toggleable = typeof onToggle === 'function';

  return (
    <div className={['radf-legend', `radf-legend--${position}`].join(' ')}>
      <ul className="radf-legend__list">
        {items.map((item) => {
          const isHidden = hiddenKeys?.has(item.key);
          const swatchClass = resolveSwatchClass(item.colorVar);
          return (
            <li
              key={item.key}
              className={[
                'radf-legend__item',
                swatchClass,
                toggleable ? 'radf-legend__item--toggleable' : '',
                isHidden ? 'radf-legend__item--hidden' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <button
                className="radf-legend__button"
                type="button"
                onClick={() => {
                  if (toggleable) {
                    onToggle(item.key);
                  }
                }}
              >
                <span className="radf-legend__swatch" />
                <span className="radf-legend__label">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Legend;
