import React from 'react';
import LoadingState from './LoadingState.jsx';
import EmptyState from './EmptyState.jsx';
import ErrorState from './ErrorState.jsx';

const resolveErrorMessage = (error) => {
  if (!error) {
    return null;
  }
  if (typeof error === 'string') {
    return error;
  }
  return error.message || 'Something went wrong.';
};

function PanelBody({ status = 'ready', isEmpty = false, emptyMessage, error, children }) {
  let content = <div className="radf-panel__content">{children}</div>;

  if (status === 'loading') {
    content = <LoadingState />;
  }

  if (status === 'error') {
    content = <ErrorState message={resolveErrorMessage(error)} />;
  }

  if (status === 'empty' || isEmpty) {
    content = <EmptyState message={emptyMessage} />;
  }

  return <div className="radf-panel__body">{content}</div>;
}

export default PanelBody;
