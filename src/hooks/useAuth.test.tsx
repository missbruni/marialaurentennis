import { describe, expect, vi, beforeEach, test } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@/lib/test-utils';
import { render as originalRender } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as firebaseAuth from 'firebase/auth';
import { auth } from '@/lib/firebase';

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

    // Instead of using act, we'll use a more direct approach
    vi.spyOn(firebaseAuth, 'onAuthStateChanged').mockImplementation((_auth, callback: any) => {
      // Call the callback asynchronously
      setTimeout(() => {
        callback(null);
      }, 0);
      return vi.fn();
    });

    // Mock fetch for session cookie tests
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    );
  });

  test('provides authentication context to children', async () => {
    render(<TestComponent />);

    // Wait for the loading state to be updated
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('user-state')).toHaveTextContent('logged-out');
  });

  test('updates user state when auth state changes', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: { role: 'user' } })
    };

    vi.spyOn(firebaseAuth, 'onAuthStateChanged').mockImplementationOnce((_auth, callback: any) => {
      setTimeout(() => {
        callback(mockUser as unknown as firebaseAuth.User);
      }, 0);
      return vi.fn();
    });

    render(<TestComponent />);

    // Wait for state updates to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
      expect(screen.getByTestId('user-state')).toHaveTextContent('logged-in');
    });
  });

  test('calls signInWithPopup when signInWithGoogle is called', async () => {
    const googleProviderInstance = new firebaseAuth.GoogleAuthProvider();
    vi.spyOn(firebaseAuth, 'GoogleAuthProvider').mockImplementation(() => googleProviderInstance);

    // Mock the user object properly for handleUserAuthentication
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: { role: 'user' } })
    };

    const signInWithPopupMock = vi.spyOn(firebaseAuth, 'signInWithPopup').mockResolvedValueOnce({
      user: mockUser as unknown as firebaseAuth.User
    } as any);

    const { user } = render(<TestComponent />);

    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    });

    await user.click(screen.getByTestId('login-button'));

    expect(signInWithPopupMock).toHaveBeenCalledWith(auth, googleProviderInstance);
  });

  test('calls signOut when logout is called', async () => {
    const signOutMock = vi.spyOn(firebaseAuth, 'signOut').mockResolvedValueOnce(undefined);

    const { user } = render(<TestComponent />);

    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    });

    await user.click(screen.getByTestId('logout-button'));

    expect(signOutMock).toHaveBeenCalledWith(auth);
  });

  test('handles signInWithGoogle error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(firebaseAuth, 'signInWithPopup').mockRejectedValueOnce(new Error('Auth error'));

    const { user } = render(<TestComponent />);

    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    });

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

    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('false');
    });

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

  test('creates session cookie when user authenticates', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: { role: 'user' } })
    };

    vi.spyOn(firebaseAuth, 'signInWithPopup').mockResolvedValueOnce({
      user: mockUser as unknown as firebaseAuth.User
    } as any);

    const { user } = render(<TestComponent />);

    await user.click(screen.getByTestId('login-button'));

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'mock-id-token' })
    });
  });

  test('sets admin status when user has admin role', async () => {
    const mockUser = {
      uid: 'admin-uid',
      email: 'admin@example.com',
      getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: { role: 'admin' } })
    };

    vi.spyOn(firebaseAuth, 'onAuthStateChanged').mockImplementationOnce((_auth, callback: any) => {
      setTimeout(() => {
        callback(mockUser as unknown as firebaseAuth.User);
      }, 0);
      return vi.fn();
    });

    const TestAdminComponent = () => {
      const { isAdmin } = useAuth();
      return <div data-testid="admin-state">{isAdmin.toString()}</div>;
    };

    render(<TestAdminComponent />);

    // Wait for state updates to complete
    await waitFor(() => {
      expect(screen.getByTestId('admin-state')).toHaveTextContent('true');
    });
  });

  test('calls API to logout when logout is called', async () => {
    const signOutMock = vi.spyOn(firebaseAuth, 'signOut').mockResolvedValueOnce(undefined);
    const { user } = render(<TestComponent />);

    await user.click(screen.getByTestId('logout-button'));

    expect(signOutMock).toHaveBeenCalledWith(auth);
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
  });

  test('handles session creation failure gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock fetch to fail
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    );

    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: { role: 'user' } })
    };

    vi.spyOn(firebaseAuth, 'signInWithPopup').mockResolvedValueOnce({
      user: mockUser as unknown as firebaseAuth.User
    } as any);

    const { user } = render(<TestComponent />);

    await user.click(screen.getByTestId('login-button'));

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating session:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  test('handles token claims error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
      getIdTokenResult: vi.fn().mockRejectedValue(new Error('Token error'))
    };

    vi.spyOn(firebaseAuth, 'signInWithPopup').mockResolvedValueOnce({
      user: mockUser as unknown as firebaseAuth.User
    } as any);

    const { user } = render(<TestComponent />);

    await user.click(screen.getByTestId('login-button'));

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting token claims:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  test('redirects to home page when logging out from admin route', async () => {
    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/admin/settings', href: '' },
      writable: true
    });

    const signOutMock = vi.spyOn(firebaseAuth, 'signOut').mockResolvedValueOnce(undefined);
    const { user } = render(<TestComponent />);

    await user.click(screen.getByTestId('logout-button'));

    expect(signOutMock).toHaveBeenCalledWith(auth);
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
    expect(window.location.href).toBe('/');

    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    });
  });

  test('does not redirect when logging out from non-admin route', async () => {
    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/contact', href: '' },
      writable: true
    });

    const signOutMock = vi.spyOn(firebaseAuth, 'signOut').mockResolvedValueOnce(undefined);
    const { user } = render(<TestComponent />);

    await user.click(screen.getByTestId('logout-button'));

    expect(signOutMock).toHaveBeenCalledWith(auth);
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
    expect(window.location.href).toBe(''); // Should not change

    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    });
  });
});
