'use client';

import { useAuth } from './hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import React from 'react';

import GoogleIcon from '@/lib/icons/Google';
import { Button } from './ui/button';
import LoginIndicator from './LoginIndicator';

type LoginProps = {
  className?: string;
  onClick?: () => void;
};

export default function Login({ onClick }: LoginProps) {
  const { signInWithGoogle, user } = useAuth();
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
            <button
              onClick={async () => {
                await signInWithGoogle();
                closeModal();
              }}
              className="w-full py-2 border border-gray-300 rounded flex items-center justify-center gap-2"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* TODO: add other providers */}
          </div>
          <DialogFooter>
            <button
              onClick={closeModal}
              className="mt-4 text-blue-600 hover:underline w-full text-center"
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
