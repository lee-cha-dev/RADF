import React from 'react';

function PanelHeader({ title, subtitle, actions }) {
  if (!title && !subtitle && !actions) {
    return null;
  }

  return (
    <div className="radf-panel__header">
      <div className="radf-panel__heading">
        {title ? <h2 className="radf-panel__title">{title}</h2> : null}
        {subtitle ? <p className="radf-panel__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="radf-panel__actions">{actions}</div> : null}
    </div>
  );
}

export default PanelHeader;
