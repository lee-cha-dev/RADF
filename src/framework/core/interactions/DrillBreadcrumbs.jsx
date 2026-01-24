/**
 * @module core/interactions/DrillBreadcrumbs
 * @description Breadcrumb UI for navigating drilldown paths.
 */

import React from 'react';
import { getDrilldownLabel } from './drilldown';

/**
 * @typedef {import('../docs/jsdocTypes.js').DrilldownPath} DrilldownPath
 */

/**
 * @typedef {Object} DrillBreadcrumbsProps
 * @property {DrilldownPath[]} [drillPath] - Active drilldown path entries.
 * @property {(index: number) => void} [onCrumbClick]
 *   - Handler fired with the crumb index to rewind to.
 * @property {() => void} [onReset] - Handler to reset the drill path.
 */

/**
 * Render drilldown breadcrumbs for navigation.
 *
 * @param {DrillBreadcrumbsProps} props
 * @returns {JSX.Element|null} Drill breadcrumb bar or null when empty.
 */
const DrillBreadcrumbs = ({ drillPath = [], onCrumbClick, onReset }) => {
  if (!drillPath.length) {
    return null;
  }

  return (
    <div className="radf-drill">
      <span className="radf-drill__title">Drill path</span>
      <div className="radf-drill__crumbs">
        {drillPath.map((entry, index) => (
          <button
            key={entry.id || `${entry.dimension}-${index}`}
            type="button"
            className="radf-drill__crumb"
            onClick={() => onCrumbClick?.(index)}
          >
            {getDrilldownLabel(entry)}
          </button>
        ))}
      </div>
      <button type="button" className="radf-drill__reset" onClick={onReset}>
        Reset
      </button>
    </div>
  );
};

export default DrillBreadcrumbs;
