'use client';

import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import MyAccount from './MyAccount';
import { Button } from './ui/button';
import { useLoginDialog } from '@/providers/LoginDialogProvider';

type LoginProps = {
  onClick?: () => void;
};

export default function Login({ onClick }: LoginProps) {
  const { user } = useAuth();
  const { openLoginDialog } = useLoginDialog();

  function handleLoginClick() {
    openLoginDialog();
    onClick?.();
  }

  if (user) {
    return <MyAccount onLoginClick={handleLoginClick} />;
  }

  return (
    <Button
      size="lg"
      variant="ghost"
      className="border-1 cursor-pointer duration-200 md:inline-flex items-center justify-center rounded-md transition-colors hover:bg-white/20 text-foreground h-9 px-4"
      onClick={handleLoginClick}
      aria-label="Login"
    >
      Login
    </Button>
  );
}
