import React from 'react';
import PanelHeader from './PanelHeader.jsx';
import PanelBody from './PanelBody.jsx';

function Panel({
  title,
  subtitle,
  actions,
  className,
  status,
  error,
  isEmpty,
  emptyMessage,
  footer,
  children,
}) {
  const panelClassName = ['radf-panel', className].filter(Boolean).join(' ');
  return (
    <section className={panelClassName}>
      <PanelHeader title={title} subtitle={subtitle} actions={actions} />
      <PanelBody
        status={status}
        error={error}
        isEmpty={isEmpty}
        emptyMessage={emptyMessage}
      >
        {children}
      </PanelBody>
      {footer ? <div className="radf-panel__footer">{footer}</div> : null}
    </section>
  );
}

export default Panel;
