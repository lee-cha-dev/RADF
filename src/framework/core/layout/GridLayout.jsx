import React from 'react';

const GRID_COLUMNS = 12;

const toPositiveNumber = (value, fallback) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }
  return value > 0 ? value : fallback;
};

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
