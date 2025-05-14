'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLoginDialog } from '@/providers/LoginDialogProvider';

export function AuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openLoginDialog } = useLoginDialog();

  React.useEffect(() => {
    const requiresAuth = searchParams.get('auth');
    const from = searchParams.get('from');

    if (requiresAuth === 'true' && from) {
      openLoginDialog(from);

      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      url.searchParams.delete('from');

      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, openLoginDialog, router]);

  return null;
}
