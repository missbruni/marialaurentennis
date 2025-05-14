'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import LinearProgress from '@/components/LinearProgress';

type AuthGuardProps = {
  children: React.ReactNode;
  loadingMessage?: string;
  fallback?: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LinearProgress />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
