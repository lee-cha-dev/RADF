/**
 * @module core/viz/common/ChartContainer
 * @description Shared wrapper for chart content and optional header/footer.
 */
import React from 'react';

/**
 * @typedef {Object} ChartContainerProps
 * @property {string} [title] - Optional chart title.
 * @property {string} [subtitle] - Optional chart subtitle.
 * @property {React.ReactNode} [footer] - Optional footer content.
 * @property {React.ReactNode} children - Chart body content.
 */

/**
 * Render a chart container with standard RADF chrome.
 * @param {ChartContainerProps} props - Container props.
 * @returns {JSX.Element} Chart container.
 */
function ChartContainer({ title, subtitle, footer, children }) {
  return (
    <div className="radf-chart">
      {(title || subtitle) && (
        <div className="radf-chart__header">
          <div className="radf-chart__heading">
            {title ? <p className="radf-chart__title">{title}</p> : null}
            {subtitle ? <p className="radf-chart__subtitle">{subtitle}</p> : null}
          </div>
        </div>
      )}
      <div className="radf-chart__canvas">{children}</div>
      {footer ? <div className="radf-chart__footer">{footer}</div> : null}
    </div>
  );
}

export default ChartContainer;
