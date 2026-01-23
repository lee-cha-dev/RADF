import React from 'react';
import { getDrilldownLabel } from './drilldown';

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
