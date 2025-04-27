import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import Login from './Login';
import type { User } from 'firebase/auth';

vi.mock('@/components/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

import { useAuth } from '@/components/hooks/useAuth';

describe('Login', () => {
  const mockSignInWithGoogle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render login button when user is not logged in', () => {
    (useAuth as any).mockReturnValue({
      signInWithGoogle: mockSignInWithGoogle,
      user: null,
      loading: false,
      logout: vi.fn()
    });

    render(<Login />);

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

    render(<Login />);

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

    render(<Login />);

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

    render(<Login />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText('Sign Up / Sign In')).toBeInTheDocument();
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
    render(<Login onClick={mockOnClick} />);

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

    render(<Login />);

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

    render(<Login />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /login/i }));
    await user.click(screen.getByText('Cancel'));

    expect(screen.queryByText('Sign Up / Sign In')).not.toBeInTheDocument();
  });
});
