import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDashboardActions } from '../../../framework/core/dashboard/useDashboardActions';
import { useDashboardState } from '../../../framework/core/dashboard/useDashboardState';
import {
  buildBrushFilter,
  removeBrushFilter,
  upsertBrushFilter,
} from '../../../framework/core/interactions/brushZoom';
import { getSelectionLabel } from '../../../framework/core/interactions/crossFilter';

const getDateFilter = (filters, field) =>
  (filters || []).find((filter) => filter.field === field && filter.op === 'BETWEEN');

const toInputValue = (value) => {
  if (!value) {
    return '';
  }
  return String(value).slice(0, 10);
};

const buildRangeFromFilter = (filter) => {
  if (!filter || !Array.isArray(filter.values)) {
    return { start: '', end: '' };
  }
  return {
    start: toInputValue(filter.values[0]),
    end: toInputValue(filter.values[1]),
  };
};

function ExampleFilterBar({ dateField }) {
  const { globalFilters, selections } = useDashboardState();
  const { setGlobalFilters, clearSelections, removeSelection } =
    useDashboardActions();
  const activeDateFilter = useMemo(
    () => getDateFilter(globalFilters, dateField),
    [dateField, globalFilters]
  );
  const [range, setRange] = useState(() => buildRangeFromFilter(activeDateFilter));

  useEffect(() => {
    setRange(buildRangeFromFilter(activeDateFilter));
  }, [activeDateFilter]);

  const handleRangeChange = useCallback((event) => {
    const { name, value } = event.target;
    setRange((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleApply = useCallback(() => {
    if (!dateField) {
      return;
    }
    if (!range.start || !range.end) {
      setGlobalFilters(removeBrushFilter(globalFilters, dateField));
      return;
    }
    const filter = buildBrushFilter({
      field: dateField,
      range: { startValue: range.start, endValue: range.end },
    });
    setGlobalFilters(upsertBrushFilter(globalFilters, filter));
  }, [dateField, globalFilters, range.end, range.start, setGlobalFilters]);

  const handleReset = useCallback(() => {
    if (!dateField) {
      return;
    }
    setGlobalFilters(removeBrushFilter(globalFilters, dateField));
  }, [dateField, globalFilters, setGlobalFilters]);

  return (
    <div className="radf-filter-bar">
      <div className="radf-filter-bar__group">
        <span className="radf-filter-bar__label">Date range</span>
        <div className="radf-filter-bar__inputs">
          <input
            className="radf-filter-bar__input"
            type="date"
            name="start"
            value={range.start}
            onChange={handleRangeChange}
          />
          <span className="radf-filter-bar__separator">to</span>
          <input
            className="radf-filter-bar__input"
            type="date"
            name="end"
            value={range.end}
            onChange={handleRangeChange}
          />
          <button
            type="button"
            className="radf-filter-bar__button radf-filter-bar__button--primary"
            onClick={handleApply}
          >
            Apply
          </button>
          <button
            type="button"
            className="radf-filter-bar__button radf-filter-bar__button--ghost"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
      {selections.length ? (
        <div className="radf-filter-bar__group radf-filter-bar__group--chips">
          <span className="radf-filter-bar__label">Selections</span>
          <div className="radf-filter-bar__chips">
            {selections.map((selection) => (
              <button
                key={selection.id}
                type="button"
                className="radf-filter-bar__chip"
                onClick={() => removeSelection(selection.id)}
              >
                <span className="radf-filter-bar__chip-label">
                  {getSelectionLabel(selection)}
                </span>
                <span className="radf-filter-bar__chip-remove">×</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="radf-filter-bar__clear"
            onClick={clearSelections}
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ExampleFilterBar;
