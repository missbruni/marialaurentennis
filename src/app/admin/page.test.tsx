import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, screen } from '@/lib/test-utils';
import AdminPage from './page';

vi.mock('next/dynamic', () => ({
  default: (importFn: () => Promise<any>) => {
    const Component = React.lazy(importFn);
    return function DynamicComponent(props: any) {
      return (
        <React.Suspense fallback={<div data-testid="loading">Loading...</div>}>
          <Component {...props} />
        </React.Suspense>
      );
    };
  }
}));

describe('AdminPage', () => {
  test('renders admin dashboard with code splitting', async () => {
    render(<AdminPage />);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to the admin dashboard/)).toBeInTheDocument();

    const loadingStates = screen.getAllByTestId('loading');
    expect(loadingStates.length).toBe(6); // 6 dashboard items
  });

  test('shows loading states for StatusCard components', () => {
    render(<AdminPage />);

    const loadingStates = screen.getAllByText('Loading...');
    expect(loadingStates.length).toBe(6); // 6 dashboard items
  });
});
