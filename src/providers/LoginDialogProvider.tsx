'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import GoogleIcon from '@/lib/icons/Google';
import FacebookIcon from '../lib/icons/Facebook';
import { EmailPassword } from '@/components/EmailPassword';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

type LoginDialogContextType = {
  openLoginDialog: (redirectPath?: string) => void;
  closeLoginDialog: () => void;
  isOpen: boolean;
};

const LoginDialogContext = React.createContext<LoginDialogContextType | undefined>(undefined);

export function LoginDialogProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { signInWithGoogle, signInWithFacebook } = useAuth();

  const [isOpen, setIsOpen] = React.useState(false);
  const [redirectPath, setRedirectPath] = React.useState<string | undefined>(undefined);

  const openLoginDialog = React.useCallback(
    (path?: string) => {
      setRedirectPath(path || pathname);
      setIsOpen(true);
    },
    [searchParams]
  );

  const closeLoginDialog = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleAuthSuccess = React.useCallback(() => {
    closeLoginDialog();
    if (redirectPath) {
      router.push(redirectPath);
    }
  }, [closeLoginDialog, redirectPath, router]);

  const value = React.useMemo(
    () => ({
      openLoginDialog,
      closeLoginDialog,
      isOpen
    }),
    [openLoginDialog, closeLoginDialog, isOpen]
  );

  return (
    <LoginDialogContext.Provider value={value}>
      {children}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={cn('mx-auto max-w-sm rounded bg-background text-foreground p-6 shadow')}
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
    </LoginDialogContext.Provider>
  );
}

export function useLoginDialog() {
  const context = React.useContext(LoginDialogContext);

  if (context === undefined) {
    throw new Error('useLoginDialog must be used within a LoginDialogProvider');
  }

  return context;
}
