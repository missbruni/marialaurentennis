import type { User, Auth } from 'firebase/auth';
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
import { getAuth } from '@/lib/firebase';
import { logger } from '@/lib/logger';

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
    logger.authFailure(
      'createSessionCookie',
      error instanceof Error ? error : new Error('Unknown error'),
      {
        action: 'createSessionCookie',
        userId: user.uid,
        userEmail: user.email || undefined
      }
    );
    return false;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [auth, setAuth] = React.useState<Auth | null>(null);

  React.useEffect(() => {
    getAuth().then(setAuth);
  }, []);

  const handleUserAuthentication = React.useCallback(async (user: User | null) => {
    if (user) {
      try {
        await createSessionCookie(user);
        await user.getIdToken(true);

        const idTokenResult = await user.getIdTokenResult();
        const hasAdminRole = idTokenResult.claims.role === 'admin';

        setIsAdmin(hasAdminRole);
        setUser(user);
        setLoading(false);
      } catch (error) {
        logger.authFailure(
          'getTokenClaims',
          error instanceof Error ? error : new Error('Unknown error'),
          {
            action: 'getTokenClaims',
            userId: user.uid,
            userEmail: user.email || undefined
          }
        );
        setIsAdmin(false);
        setUser(user);
        setLoading(false);
      }
    } else {
      setIsAdmin(false);
      setUser(user);
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = React.useCallback(async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleUserAuthentication(result.user);
    } catch (error) {
      logger.authFailure(
        'signInWithGoogle',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          action: 'signInWithGoogle'
        }
      );
      setLoading(false);
    }
  }, [auth, handleUserAuthentication]);

  const signInWithFacebook = React.useCallback(async () => {
    if (!auth) return;
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleUserAuthentication(result.user);
    } catch (error) {
      logger.authFailure(
        'signInWithFacebook',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          action: 'signInWithFacebook'
        }
      );
      setLoading(false);
    }
  }, [auth, handleUserAuthentication]);

  const signInWithEmail = React.useCallback(
    async (email: string, password: string) => {
      if (!auth) return;
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await handleUserAuthentication(result.user);
      } catch (error) {
        logger.authFailure(
          'signInWithEmail',
          error instanceof Error ? error : new Error('Unknown error'),
          {
            action: 'signInWithEmail',
            userEmail: email
          }
        );
        throw error;
      }
    },
    [auth, handleUserAuthentication]
  );

  const signUpWithEmail = React.useCallback(
    async (email: string, password: string) => {
      if (!auth) return;
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await handleUserAuthentication(result.user);
      } catch (error) {
        logger.authFailure(
          'signUpWithEmail',
          error instanceof Error ? error : new Error('Unknown error'),
          {
            action: 'signUpWithEmail',
            userEmail: email
          }
        );
        throw error;
      }
    },
    [auth, handleUserAuthentication]
  );

  const logout = React.useCallback(async () => {
    if (!auth) return;
    try {
      await signOut(auth);

      const response = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await response.json();

      if (data.isProtected) {
        window.location.href = '/';
      }

      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    } catch (error) {
      logger.authFailure('logout', error instanceof Error ? error : new Error('Unknown error'), {
        action: 'logout',
        userId: user?.uid,
        userEmail: user?.email || undefined
      });
    }
  }, [auth, user?.uid, user?.email]);

  React.useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await handleUserAuthentication(user);
    });

    return () => unsubscribe();
  }, [auth, handleUserAuthentication]);

  const value = React.useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      signInWithGoogle,
      signInWithFacebook,
      signInWithEmail,
      signUpWithEmail,
      logout
    }),
    [
      user,
      loading,
      isAdmin,
      signInWithGoogle,
      signInWithFacebook,
      signInWithEmail,
      signUpWithEmail,
      logout
    ]
  );

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
