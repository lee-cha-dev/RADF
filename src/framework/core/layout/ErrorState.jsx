import React from 'react';

function ErrorState({ title = 'Something went wrong', message = 'Please try again.' }) {
  return (
    <div className="radf-panel__state radf-panel__state--error">
      <p className="radf-panel__state-title">{title}</p>
      <p className="radf-panel__state-text">{message}</p>
    </div>
  );
}

export default ErrorState;
