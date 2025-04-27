'use client';

import { useAuth } from './hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';

import React from 'react';

import GoogleIcon from '@/lib/icons/Google';
import LoginIndicator from './LoginIndicator';
import { Button } from './ui/button';
import FacebookIcon from '../lib/icons/Facebook';

type LoginProps = {
  className?: string;
  onClick?: () => void;
};

export default function Login({ onClick }: LoginProps) {
  const { signInWithGoogle, signInWithFacebook } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  function openModal() {
    setIsOpen(true);
    onClick?.();
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <>
      <LoginIndicator onLoginClick={openModal} />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="mx-auto max-w-sm rounded bg-background text-foreground p-6 shadow">
          <DialogTitle
            aria-description="sign up or login"
            className="text-xl font-bold mb-6 text-center"
          >
            Sign Up / Sign In
          </DialogTitle>
          <DialogDescription>Please sign in to continue.</DialogDescription>

          <div className="flex flex-col gap-4">
            <Button
              className="w-full py-2 border border-gray-300 rounded flex items-center justify-center gap-2"
              onClick={async () => {
                await signInWithGoogle();
                closeModal();
              }}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            {/* Needs business verification */}
            {process.env.NODE_ENV !== 'production' && (
              <Button
                className="w-full py-2 border border-gray-300 rounded flex items-center justify-center gap-2"
                onClick={async () => {
                  await signInWithFacebook();
                  closeModal();
                }}
              >
                <FacebookIcon />
                Continue with Facebook
              </Button>
            )}
            {/* TODO: add other providers */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
