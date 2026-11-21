import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TaskFlow caught an uncaught render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="bg-white rounded-3xl border border-border p-8 sm:p-10 max-w-lg shadow-card space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-black">
              !
            </div>
            <h2 className="text-2xl font-extrabold text-charcoal">Something went wrong</h2>
            <p className="text-sm text-charcoal-400 leading-relaxed">
              We encountered an issue rendering this section. You can refresh or return to the dashboard.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="bg-charcoal text-lime font-bold text-sm px-6 py-2.5 rounded-xl shadow-subtle hover:bg-black transition-colors"
              >
                Reload Page
              </button>
              <a
                href="#/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="bg-surface-muted text-charcoal font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-charcoal-100 transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
