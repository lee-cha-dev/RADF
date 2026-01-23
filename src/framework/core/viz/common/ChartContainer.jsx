import React from 'react';

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
