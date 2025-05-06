import React from 'react';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import Login from './Login';
import type { User } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn()
}));

describe('Login', () => {
  const mockSignInWithGoogle = vi.fn();
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as any).mockReturnValue({
      push: mockPush
    });

    (useSearchParams as any).mockReturnValue({
      get: vi.fn().mockReturnValue('/')
    });
  });

  test('should render login button when user is not logged in', () => {
    (useAuth as any).mockReturnValue({
      signInWithGoogle: mockSignInWithGoogle,
      user: null,
      loading: false,
      logout: vi.fn()
    });

    render(<Login open={false} />);

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('should render avatar when user is logged in', () => {
    const mockUser = {
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg'
    } as User;

    (useAuth as any).mockReturnValue({
      signInWithGoogle: mockSignInWithGoogle,
      user: mockUser,
      loading: false,
      logout: vi.fn()
    });

    render(<Login open={false} />);

    expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
    const avatarPopover = document.querySelector('[data-slot="popover-trigger"]');
    expect(avatarPopover).toBeInTheDocument();
  });

  test('should render avatar with fallback when user has no photo', () => {
    const mockUser = {
      displayName: 'Test User',
      photoURL: null
    } as User;

    (useAuth as any).mockReturnValue({
      signInWithGoogle: mockSignInWithGoogle,
      user: mockUser,
      loading: false,
      logout: vi.fn()
    });

    render(<Login open={false} />);

    const avatarFallback = screen.getByText('T');
    expect(avatarFallback).toBeInTheDocument();
  });

  test('should open modal when login button is clicked', async () => {
    (useAuth as any).mockReturnValue({
      signInWithGoogle: mockSignInWithGoogle,
      user: null,
      loading: false,
      logout: vi.fn()
    });

    render(<Login open={false} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText('Sign Up Sign In')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to continue.')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  test('should call onClick prop when login button is clicked', async () => {
    (useAuth as any).mockReturnValue({
      signInWithGoogle: mockSignInWithGoogle,
      user: null,
      loading: false,
      logout: vi.fn()
    });

    const mockOnClick = vi.fn();
    render(<Login open={false} onClick={mockOnClick} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('should call signInWithGoogle and close modal when Google button is clicked', async () => {
    (useAuth as any).mockReturnValue({
      signInWithGoogle: mockSignInWithGoogle,
      user: null,
      loading: false,
      logout: vi.fn()
    });

    render(<Login open={false} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /login/i }));
    await user.click(screen.getByText('Continue with Google'));

    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);

    expect(screen.queryByText('Sign Up / Sign In')).not.toBeInTheDocument();
  });

  test('should close modal when cancel button is clicked', async () => {
    (useAuth as any).mockReturnValue({
      signInWithGoogle: mockSignInWithGoogle,
      user: null,
      loading: false,
      logout: vi.fn()
    });

    render(<Login open={false} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /login/i }));
  });

  test('should redirect to specified path after successful authentication', async () => {
    (useSearchParams as any).mockReturnValue({
      get: vi.fn().mockImplementation((param) => {
        if (param === 'from') return '/admin/availability';
        return null;
      })
    });

    mockSignInWithGoogle.mockResolvedValueOnce(undefined);

    (useAuth as any).mockReturnValue({
      signInWithGoogle: mockSignInWithGoogle,
      user: null,
      loading: false,
      logout: vi.fn()
    });

    render(<Login open={false} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /login/i }));
    await user.click(screen.getByText('Continue with Google'));

    await vi.waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/admin/availability');
    });
  });
});
