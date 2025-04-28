import React from 'react';
import { describe, expect, vi, beforeEach, test } from 'vitest';
import { render, screen } from '../lib/test-utils';

import { EmailPassword } from './EmailPassword';

vi.mock('./hooks/useAuth', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

import type { AuthContextType } from '../app/hooks/useAuth';
import { useAuth } from '../app/hooks/useAuth';

describe('EmailPassword', () => {
  const mockSignInWithEmail = vi.fn();
  const mockSignUpWithEmail = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      signInWithEmail: mockSignInWithEmail,
      signUpWithEmail: mockSignUpWithEmail
    } as Partial<AuthContextType>);
  });

  test('renders sign in form by default', () => {
    render(<EmailPassword onClose={mockOnClose} />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByText('Need an account? Sign up')).toBeInTheDocument();
  });

  test('toggles between sign in and sign up modes', async () => {
    const { user } = render(<EmailPassword onClose={mockOnClose} />);

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();

    await user.click(screen.getByText('Need an account? Sign up'));

    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByText('Already have an account? Sign in')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Create a password with at least 8 characters, one capital letter, and one number'
      )
    ).toBeInTheDocument();

    await user.click(screen.getByText('Already have an account? Sign in'));

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('validates email format', async () => {
    const { user } = render(<EmailPassword onClose={mockOnClose} />);

    await user.type(screen.getByLabelText('Email'), 'invalid-email');

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  test('validates password requirements', async () => {
    const { user } = render(<EmailPassword onClose={mockOnClose} />);

    await user.click(screen.getByText('Need an account? Sign up'));

    await user.type(screen.getByLabelText('Password'), 'short');

    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'longpassword123');
    await user.tab();

    expect(
      screen.getByText('Password must contain at least one capital letter')
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'LongPassword');
    await user.tab();

    expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
  });

  test('calls signInWithEmail when submitting sign in form', async () => {
    const { user } = render(<EmailPassword onClose={mockOnClose} />);
    const testEmail = 'test@example.com';
    const testPassword = 'Password123';

    await user.type(screen.getByLabelText('Email'), testEmail);
    await user.type(screen.getByLabelText('Password'), testPassword);

    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(mockSignInWithEmail).toHaveBeenCalledWith(testEmail, testPassword);
    expect(mockSignUpWithEmail).not.toHaveBeenCalled();
  });

  test('calls signUpWithEmail when submitting sign up form', async () => {
    const { user } = render(<EmailPassword onClose={mockOnClose} />);
    const testEmail = 'test@example.com';
    const testPassword = 'Password123';

    await user.click(screen.getByText('Need an account? Sign up'));

    await user.type(screen.getByLabelText('Email'), testEmail);
    await user.type(screen.getByLabelText('Password'), testPassword);

    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(mockSignUpWithEmail).toHaveBeenCalledWith(testEmail, testPassword);
    expect(mockSignInWithEmail).not.toHaveBeenCalled();
  });

  test('displays loading state during form submission', async () => {
    mockSignInWithEmail.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { user } = render(<EmailPassword onClose={mockOnClose} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123');

    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByText('Signing In...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Signing In...' })).toBeDisabled();
  });

  test('displays error message when authentication fails', async () => {
    const errorMessage = 'Invalid email or password';
    mockSignInWithEmail.mockRejectedValueOnce(new Error(errorMessage));

    const { user } = render(<EmailPassword onClose={mockOnClose} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123');

    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('disables submit button when form is invalid', async () => {
    const { user } = render(<EmailPassword onClose={mockOnClose} />);

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeDisabled();

    await user.type(screen.getByLabelText('Email'), 'invalid-email');
    await user.type(screen.getByLabelText('Password'), 'Password123');

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeDisabled();

    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'valid@example.com');

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeEnabled();
  });

  test('calls onClose when authentication succeeds', async () => {
    mockSignInWithEmail.mockResolvedValueOnce(undefined);

    const { user } = render(<EmailPassword onClose={mockOnClose} />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'Password123');

    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
