import React from 'react';

function LoadingState({ message = 'Loading data…' }) {
  return (
    <div className="radf-panel__state radf-panel__state--loading">
      <span className="radf-panel__state-icon" aria-hidden="true">
        ⏳
      </span>
      <p className="radf-panel__state-text">{message}</p>
    </div>
  );
}

export default LoadingState;
