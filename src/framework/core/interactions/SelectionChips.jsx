import React from 'react';
import { getSelectionLabel } from './crossFilter';

const SelectionChips = ({ selections = [], onRemove, onClear }) => {
  if (!selections.length) {
    return null;
  }

  return (
    <div className="radf-selection-bar">
      <span className="radf-selection-bar__title">Selections</span>
      <div className="radf-selection-bar__chips">
        {selections.map((selection) => (
          <button
            key={selection.id}
            type="button"
            className="radf-selection-chip"
            onClick={() => onRemove(selection.id)}
          >
            <span className="radf-selection-chip__label">
              {getSelectionLabel(selection)}
            </span>
            <span className="radf-selection-chip__remove">×</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="radf-selection-bar__clear"
        onClick={onClear}
      >
        Clear All
      </button>
    </div>
  );
};

export default SelectionChips;
