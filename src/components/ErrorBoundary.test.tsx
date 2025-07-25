import React from 'react';
import { render, screen } from '@/lib/test-utils';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  const originalError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.queryByText('Error occurred')).not.toBeInTheDocument();
  });

  test('renders fallback when error occurs', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.queryByText('No error')).not.toBeInTheDocument();
  });

  test('logs error in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development');

    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: ErrorBoundary caught an error')
    );

    vi.unstubAllEnvs();
  });

  test('logs error in production mode with structured format', () => {
    vi.stubEnv('NODE_ENV', 'production');

    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should log with structured format, not the old simple format
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: ErrorBoundary caught an error')
    );
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('environment=production'));

    vi.unstubAllEnvs();
  });
});
