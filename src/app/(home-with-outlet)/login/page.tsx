'use client';

import React from 'react';
import { useLoginDialog } from '@/providers/LoginDialogProvider';

export default function LoginPage() {
  const { openLoginDialog } = useLoginDialog();

  React.useEffect(() => {
    openLoginDialog();
  }, [openLoginDialog]);

  return null;
}
