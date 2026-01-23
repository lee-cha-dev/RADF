import React from 'react';

const DEFAULT_TITLE = 'Something went wrong';
const DEFAULT_MESSAGE =
  'An unexpected error occurred. You can try reloading the page to continue.';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

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
