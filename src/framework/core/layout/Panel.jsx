import React from 'react';
import PanelHeader from './PanelHeader.jsx';
import PanelBody from './PanelBody.jsx';

/**
 * @module layout/Panel
 * @description
 * Panel chrome component that composes header, body states, and optional footer.
 */

/**
 * @typedef {Object} PanelProps
 * @property {string} [title] - Panel title shown in the header.
 * @property {string} [subtitle] - Secondary title displayed below the main title.
 * @property {React.ReactNode} [actions] - Action elements rendered in the header.
 * @property {string} [className] - Optional class appended to the panel container.
 * @property {boolean} [hideHeader] - Hide the panel header entirely.
 * @property {boolean} [chromeless] - Remove panel chrome for embedded content.
 * @property {'ready' | 'loading' | 'error' | 'empty'} [status] - Current panel state.
 * @property {Error | string | null} [error] - Error used for the error state message.
 * @property {boolean} [isEmpty] - Force the empty state regardless of status.
 * @property {string} [emptyMessage] - Custom message used for the empty state.
 * @property {React.ReactNode} [footer] - Footer content rendered below the body.
 * @property {React.ReactNode} [children] - Panel visualization/content.
 */

/**
 * Composes panel layout with header, body state handling, and footer.
 *
 * Uses:
 * - `ladf-panel`
 * - `ladf-panel__footer`
 *
 * @param {PanelProps} props
 * @returns {JSX.Element}
 */
function Panel({
  title,
  subtitle,
  actions,
  className,
  hideHeader = false,
  chromeless = false,
  status,
  error,
  isEmpty,
  emptyMessage,
  footer,
  children,
}) {
  const panelClassName = [
    'ladf-panel',
    chromeless ? 'ladf-panel--chromeless' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <section className={panelClassName}>
      {hideHeader ? null : (
        <PanelHeader title={title} subtitle={subtitle} actions={actions} />
      )}
      <PanelBody
        status={status}
        error={error}
        isEmpty={isEmpty}
        emptyMessage={emptyMessage}
      >
        {children}
      </PanelBody>
      {footer ? <div className="ladf-panel__footer">{footer}</div> : null}
    </section>
  );
}

export default Panel;
