import React from 'react';

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1>Something went wrong.</h1>
          <button onClick={() => window.location.reload()} className="button mt-4">
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
