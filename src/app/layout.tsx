'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { SectionRefProvider } from '@/hooks/useSectionRef';
import { AuthProvider } from '@/hooks/useAuth';
import { LoginDialogProvider } from '@/providers/LoginDialogProvider';
import { FirebaseLazyLoader } from '@/components/FirebaseLazyLoader';
import SuspenseLoading from '@/components/SuspenseLoading';
import { Toaster } from '@/components/ui/sonner';
import AppBar from '@/components/AppBar';
import { AuthHandler } from '@/components/AuthHandler';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SectionRefProvider>
            <FirebaseLazyLoader>
              <AuthProvider>
                <LoginDialogProvider>
                  <SuspenseLoading>
                    <AuthHandler />
                  </SuspenseLoading>
                  <div className="flex flex-col">
                    <AppBar />
                    {children}
                  </div>
                  <Toaster />
                </LoginDialogProvider>
              </AuthProvider>
            </FirebaseLazyLoader>
          </SectionRefProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
