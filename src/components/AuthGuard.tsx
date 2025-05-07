'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Loader from './Loader';
import { useLoginDialog } from '@/providers/LoginDialogProvider';
import { useRouter } from 'next/navigation';

type AuthGuardProps = {
  children: React.ReactNode;
  loadingMessage?: string;
  fallback?: React.ReactNode;
  redirectTo?: string;
};

type AuthState = 'idle' | 'dialog-opened' | 'redirecting';

export default function AuthGuard({
  children,
  loadingMessage = 'Loading...',
  fallback,
  redirectTo = '/'
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const { openLoginDialog, isOpen } = useLoginDialog();
  const router = useRouter();

  const [authState, setAuthState] = React.useState<AuthState>('idle');
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      setInitialLoadComplete(true);
    }
  }, [loading]);

  React.useEffect(() => {
    if (loading) {
      return;
    }

    if (user) {
      setAuthState('idle');
      return;
    }

    if (authState === 'idle') {
      openLoginDialog();
      setAuthState('dialog-opened');
    } else if (authState === 'dialog-opened' && !isOpen) {
      setAuthState('redirecting');
      router.push(redirectTo);
    }
  }, [loading, user, isOpen, authState, openLoginDialog, router, redirectTo]);

  if (loading && !initialLoadComplete) {
    return <Loader message={loadingMessage} />;
  }

  if (!user) {
    return fallback || null;
  }

  return <>{children}</>;
}
