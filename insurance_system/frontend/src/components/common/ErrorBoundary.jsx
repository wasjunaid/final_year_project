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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1a1a] px-4">
          <div className="w-full max-w-lg rounded-xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-[#2d2d2d] p-6 shadow-lg">
            <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark"
              onClick={() => window.location.reload()}
            >
            Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;