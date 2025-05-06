'use client';

import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleIcon from '@/lib/icons/Google';
import LoginIndicator from './LoginIndicator';
import { Button } from './ui/button';
import FacebookIcon from '../lib/icons/Facebook';
import { EmailPassword } from './EmailPassword';
import { cn } from '../lib/utils';

type LoginProps = {
  open?: boolean;
  className?: string;
  onClick?: () => void;
};

export default function Login({ open, className, onClick }: LoginProps) {
  const { signInWithGoogle, signInWithFacebook } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('from') || '/';

  const [isOpen, setIsOpen] = React.useState(open);

  function openModal() {
    setIsOpen(true);
    onClick?.();
  }

  function closeModal() {
    setIsOpen(false);
  }

  async function handleAuthSuccess() {
    closeModal();
    router.push(redirectPath);
  }

  return (
    <>
      <LoginIndicator onLoginClick={openModal} />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={cn(
            'mx-auto max-w-sm rounded bg-background text-foreground p-6 shadow',
            className
          )}
        >
          <DialogTitle
            aria-description="sign up or login"
            className="text-xl font-bold mb-6 text-center"
          >
            Sign Up <span className="mx-2 text-muted-foreground font-extralight">|</span> Sign In
          </DialogTitle>
          <DialogDescription>Please sign in to continue.</DialogDescription>

          <div className="flex flex-col gap-4">
            <EmailPassword onClose={handleAuthSuccess} />

            {/* Needs business verification */}
            {process.env.NODE_ENV !== 'production' && (
              <Button
                className="w-full py-2 border border-gray-300 rounded flex items-center justify-center gap-2"
                onClick={async () => {
                  await signInWithFacebook();
                  handleAuthSuccess();
                }}
              >
                <FacebookIcon />
                Continue with Facebook
              </Button>
            )}

            <Button
              className="w-full py-2 border border-gray-300 rounded flex items-center justify-center gap-2"
              onClick={async () => {
                await signInWithGoogle();
                handleAuthSuccess();
              }}
            >
              <GoogleIcon />
              Continue with Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
