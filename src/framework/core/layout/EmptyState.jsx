import React from 'react';

function EmptyState({ title = 'No data yet', message = 'Try adjusting filters or refreshing the panel.' }) {
  return (
    <div className="radf-panel__state radf-panel__state--empty">
      <p className="radf-panel__state-title">{title}</p>
      <p className="radf-panel__state-text">{message}</p>
    </div>
  );
}

export default EmptyState;
