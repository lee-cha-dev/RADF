/**
 * @module app/dashboards/example/ExampleFilterBar
 * @description Filter bar that syncs global date range and selections with dashboard state.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useDashboardActions,
  useDashboardState,
  dashboardSelectors,
  buildBrushFilter,
  removeBrushFilter,
  upsertBrushFilter,
} from 'radf';

/**
 * Normalize a date value for input elements.
 * @param {string|number|Date|null|undefined} value - Raw date value.
 * @returns {string} Input-ready yyyy-mm-dd string.
 */
const toInputValue = (value) => {
  if (!value) {
    return '';
  }
  return String(value).slice(0, 10);
};

/**
 * Convert a brush filter into a date range object for inputs.
 * @param {import('radf').Filter|null} filter
 * @returns {{ start: string, end: string }}
 */
const buildRangeFromFilter = (filter) => {
  if (!filter || !Array.isArray(filter.values)) {
    return { start: '', end: '' };
  }
  return {
    start: toInputValue(filter.values[0]),
    end: toInputValue(filter.values[1]),
  };
};

/**
 * @typedef {Object} ExampleFilterBarProps
 * @property {string} dateField - Dimension id used for the date range filter.
 */

/**
 * Example filter bar that manages global date filters and selection chips.
 * @param {ExampleFilterBarProps} props
 * @returns {JSX.Element}
 *
 * @example
 * <ExampleFilterBar dateField="date_day" />
 */
function ExampleFilterBar({ dateField }) {
  const dashboardState = useDashboardState();
  const globalFilters = dashboardSelectors.selectGlobalFilters(dashboardState);
  const selectionEntities = useMemo(
    () => dashboardSelectors.selectSelectedEntities(dashboardState),
    [dashboardState]
  );
  const activeFiltersSummary = useMemo(
    () => dashboardSelectors.selectActiveFiltersSummary(dashboardState),
    [dashboardState]
  );
  const { setGlobalFilters, clearSelections, removeSelection } = useDashboardActions();
  const activeDateFilter = useMemo(
    () => {
      const match = activeFiltersSummary.find(
        (filter) =>
          filter.source === 'global' &&
          filter.field === dateField &&
          filter.op === 'BETWEEN'
      );
      if (!match) {
        return null;
      }
      return {
        field: match.field,
        op: match.op,
        values: match.values,
      };
    },
    [activeFiltersSummary, dateField]
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
      {selectionEntities.length ? (
        <div className="radf-filter-bar__group radf-filter-bar__group--chips">
          <span className="radf-filter-bar__label">Selections</span>
          <div className="radf-filter-bar__chips">
            {selectionEntities.map((selection) => (
              <button
                key={selection.selectionId}
                type="button"
                className="radf-filter-bar__chip"
                onClick={() => removeSelection(selection.selectionId)}
              >
                <span className="radf-filter-bar__chip-label">
                  {selection.label}
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
