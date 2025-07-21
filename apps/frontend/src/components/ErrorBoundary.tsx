import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { Alert } from './ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4">
          <Alert variant="destructive">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="mt-2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try again
            </button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}