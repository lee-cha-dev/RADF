import { Component } from 'react';
import { Link } from 'react-router-dom';

class EditorErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    if (!hasError) {
      return children;
    }
    return (
      <section className="lazy-panel">
        <h2 className="lazy-panel__title">Editor failed to render</h2>
        <p className="lazy-panel__body">
          Something went wrong while rendering the editor. Try returning to the
          library or reloading the page.
        </p>
        <div className="lazy-form__actions">
          <Link className="lazy-button ghost" to="/">
            Back to Library
          </Link>
          <button
            className="lazy-button"
            type="button"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </section>
    );
  }
}

export default EditorErrorBoundary;
