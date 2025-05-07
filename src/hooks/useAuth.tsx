import type { User } from 'firebase/auth';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import React from 'react';
import { auth } from '@/lib/firebase';

type AuthEmailPassword = (email: string, password: string) => Promise<void>;
export type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithEmail: AuthEmailPassword;
  signUpWithEmail: AuthEmailPassword;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const createSessionCookie = async (user: User) => {
  try {
    const idToken = await user.getIdToken();

    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return true;
  } catch (error) {
    console.error('Error creating session:', error);
    return false;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);

  const handleUserAuthentication = async (user: User | null) => {
    if (user) {
      try {
        await createSessionCookie(user);
        const idTokenResult = await user.getIdTokenResult();
        const hasAdminRole = idTokenResult.claims.role === 'admin';
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('Error getting token claims:', error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }

    setUser(user);
    setLoading(false);
  };

  const signInWithGoogle = React.useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleUserAuthentication(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setLoading(false);
    }
  }, []);

  const signInWithFacebook = React.useCallback(async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleUserAuthentication(result.user);
    } catch (error) {
      console.error('Error signing in with Facebook:', error);
      setLoading(false);
    }
  }, []);

  const signInWithEmail = React.useCallback(async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleUserAuthentication(result.user);
    } catch (error) {
      console.error('Error signing in with email/password:', error);
      throw error;
    }
  }, []);

  const signUpWithEmail = React.useCallback(async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await handleUserAuthentication(result.user);
    } catch (error) {
      console.error('Error signing up with email/password:', error);
      throw error;
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await signOut(auth);

      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await handleUserAuthentication(user);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    isAdmin,
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    signUpWithEmail,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const memoizedValue = React.useMemo(() => {
    return {
      ...context,
      loading: context.user ? false : context.loading
    };
  }, [context]);

  return memoizedValue;
}
