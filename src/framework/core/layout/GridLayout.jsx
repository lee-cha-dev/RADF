import React from 'react';

/**
 * @module layout/GridLayout
 * @description
 * 12-column grid layout for positioning dashboard panels.
 */

/**
 * @typedef {Object} GridLayoutPosition
 * @property {number} [x] - Column start position (1-based).
 * @property {number} [y] - Row start position (1-based).
 * @property {number} [w] - Column span in grid units.
 * @property {number} [h] - Row span in grid units.
 */

/**
 * @typedef {Object} GridLayoutItem
 * @property {string} id - Unique id used as the React key.
 * @property {GridLayoutPosition} [layout] - Grid coordinates and spans in 12-column units.
 */

/**
 * @typedef {Object} GridLayoutProps
 * @property {GridLayoutItem[]} panels - Panels to render in the grid.
 * @property {function(GridLayoutItem): React.ReactNode} renderPanel - Renderer for each panel.
 * @property {string} [className] - Optional class appended to the grid container.
 */

const GRID_COLUMNS = 12;

/**
 * @param {number} value
 * @param {number} fallback
 * @returns {number}
 */
const toPositiveNumber = (value, fallback) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }
  return value > 0 ? value : fallback;
};

/**
 * @param {GridLayoutItem['layout']} layout
 * @returns {string}
 */
const buildGridItemClasses = (layout) => {
  if (!layout) {
    return 'radf-grid__item';
  }

  const colStart = toPositiveNumber(layout.x, 1);
  const rowStart = toPositiveNumber(layout.y, 1);
  const colSpan = toPositiveNumber(layout.w, GRID_COLUMNS);
  const rowSpan = toPositiveNumber(layout.h, 1);

  return [
    'radf-grid__item',
    `radf-grid__item--col-start-${colStart}`,
    `radf-grid__item--col-span-${colSpan}`,
    `radf-grid__item--row-start-${rowStart}`,
    `radf-grid__item--row-span-${rowSpan}`,
  ].join(' ');
};

/**
 * Renders a CSS grid of panels using RADF grid utility classes.
 *
 * Uses:
 * - `radf-grid`
 * - `radf-grid__item`
 * - `radf-grid__item--col-start-*`
 * - `radf-grid__item--col-span-*`
 * - `radf-grid__item--row-start-*`
 * - `radf-grid__item--row-span-*`
 *
 * @param {GridLayoutProps} props
 * @returns {JSX.Element}
 */
function GridLayout({ panels, renderPanel, className }) {
  const gridClassName = ['radf-grid', className].filter(Boolean).join(' ');

  return (
    <div className={gridClassName}>
      {panels.map((panel) => (
        <div key={panel.id} className={buildGridItemClasses(panel.layout)}>
          {renderPanel(panel)}
        </div>
      ))}
    </div>
  );
}

export default GridLayout;
