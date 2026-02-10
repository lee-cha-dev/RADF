import React from 'react';

/**
 * @module layout/ErrorBoundary
 * @description
 * Error boundary wrapper that renders a full-panel fallback and reset action.
 */

const DEFAULT_TITLE = 'Something went wrong';
const DEFAULT_MESSAGE =
  'An unexpected error occurred. You can try reloading the page to continue.';

/**
 * @typedef {Object} ErrorBoundaryProps
 * @property {React.ReactNode} children - Content wrapped by the error boundary.
 * @property {string} [title] - Title displayed in the fallback UI.
 * @property {string} [message] - Message displayed in the fallback UI.
 * @property {function(Error, React.ErrorInfo): void} [onError] - Callback when an error is caught.
 * @property {function(): void} [onReset] - Callback invoked after resetting the boundary.
 */

/**
 * Error boundary for dashboard regions that need a reset mechanism.
 *
 * @extends React.Component<ErrorBoundaryProps>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  /**
   * Updates local state so the fallback UI renders after an error.
   *
   * @param {Error} error
   * @returns {{hasError: boolean, error: Error}}
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Lifecycle hook invoked after an error is thrown within children.
   *
   * @param {Error} error
   * @param {React.ErrorInfo} info
   * @returns {void}
   */
  componentDidCatch(error, info) {
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  /**
   * Resets the boundary to render children again.
   *
   * @returns {void}
   */
  handleReset() {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  /**
   * Renders children or fallback UI when an error has been caught.
   *
   * Uses:
   * - `radf-error-boundary`
   * - `radf-error-boundary__content`
   * - `radf-error-boundary__title`
   * - `radf-error-boundary__message`
   * - `radf-error-boundary__action`
   *
   * @returns {JSX.Element | React.ReactNode}
   */
  render() {
    const { hasError } = this.state;
    if (!hasError) {
      return this.props.children;
    }

    const title = this.props.title || DEFAULT_TITLE;
    const message = this.props.message || DEFAULT_MESSAGE;

    return (
      <section className="radf-error-boundary">
        <div className="radf-error-boundary__content">
          <h2 className="radf-error-boundary__title">{title}</h2>
          <p className="radf-error-boundary__message">{message}</p>
          <button
            className="radf-button radf-error-boundary__action"
            type="button"
            onClick={this.handleReset}
          >
            Reload dashboard
          </button>
        </div>
      </section>
    );
  }
}

export default ErrorBoundary;
