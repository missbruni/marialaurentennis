import React from 'react';
import { render, screen } from '@/lib/test-utils';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import AuthGuard from './AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import type { User } from 'firebase/auth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render children when user is authenticated', () => {
    const mockUser = { uid: 'test-uid' } as User;

    (useAuth as any).mockReturnValue({
      user: mockUser,
      loading: false
    });

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('should render login dialog when user is not authenticated', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: false
    });

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    // The Login component should be rendered with open={true}
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    // We can't directly test for the Login component since it's mocked in tests
    // but we can check that our children are not rendered
  });

  test('should render loading state when auth is loading', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: true
    });

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
