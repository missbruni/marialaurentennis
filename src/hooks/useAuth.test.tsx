import { describe, expect, vi, beforeEach, test } from 'vitest';
import React from 'react';
import { render, screen } from '../../lib/test-utils';
import { render as originalRender } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as firebaseAuth from 'firebase/auth';
import { auth } from '../../lib/firebase';

function TestComponent() {
  const { user, loading, signInWithGoogle, logout } = useAuth();

  return (
    <div>
      <div data-testid="loading-state">{loading.toString()}</div>
      <div data-testid="user-state">{user ? 'logged-in' : 'logged-out'}</div>
      <button onClick={signInWithGoogle} data-testid="login-button">
        Sign In
      </button>
      <button onClick={logout} data-testid="logout-button">
        Logout
      </button>
    </div>
  );
}

function OutsideProviderComponent() {
  try {
    useAuth();
    return <div>Should not render</div>;
  } catch (error) {
    return <div data-testid="error-message">{(error as Error).message}</div>;
  }
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(firebaseAuth, 'onAuthStateChanged').mockImplementation((auth, callback) => {
      (callback as any)(null);
      return vi.fn();
    });
  });

  test('provides authentication context to children', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    expect(screen.getByTestId('user-state')).toHaveTextContent('logged-out');
  });

  test('updates user state when auth state changes', async () => {
    const mockUser = { uid: 'test-uid', email: 'test@example.com' };

    vi.spyOn(firebaseAuth, 'onAuthStateChanged').mockImplementationOnce((auth, callback) => {
      (callback as any)(mockUser as firebaseAuth.User);
      return vi.fn();
    });

    render(<TestComponent />);

    expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    expect(screen.getByTestId('user-state')).toHaveTextContent('logged-in');
  });

  test('calls signInWithPopup when signInWithGoogle is called', async () => {
    const googleProviderInstance = new firebaseAuth.GoogleAuthProvider();
    vi.spyOn(firebaseAuth, 'GoogleAuthProvider').mockImplementation(() => googleProviderInstance);

    const signInWithPopupMock = vi.spyOn(firebaseAuth, 'signInWithPopup');
    const { user } = render(<TestComponent />);

    await user.click(screen.getByTestId('login-button'));

    expect(signInWithPopupMock).toHaveBeenCalledWith(auth, googleProviderInstance);
  });

  test('calls signOut when logout is called', async () => {
    const signOutMock = vi.spyOn(firebaseAuth, 'signOut');
    const { user } = render(<TestComponent />);

    await user.click(screen.getByTestId('logout-button'));

    expect(signOutMock).toHaveBeenCalledWith(auth);
  });

  test('handles signInWithGoogle error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(firebaseAuth, 'signInWithPopup').mockRejectedValueOnce(new Error('Auth error'));

    const { user } = render(<TestComponent />);

    await user.click(screen.getByTestId('login-button'));

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error signing in with Google:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  test('handles logout error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(firebaseAuth, 'signOut').mockRejectedValueOnce(new Error('Logout error'));

    const { user } = render(<TestComponent />);

    await user.click(screen.getByTestId('logout-button'));

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing out:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  test('throws error when used outside of AuthProvider', () => {
    originalRender(<OutsideProviderComponent />);

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'useAuth must be used within an AuthProvider'
    );
  });
});
