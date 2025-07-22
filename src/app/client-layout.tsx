'use client';

import AppBar from '../components/AppBar';
import React from 'react';
import { SectionRefProvider } from '@/hooks/useSectionRef';
import { AuthProvider } from '@/hooks/useAuth';
import { LoginDialogProvider } from '@/providers/LoginDialogProvider';
import { AuthHandler } from '@/components/AuthHandler';
import SuspenseLoading from '../components/SuspenseLoading';
import { FirebaseLazyLoader } from '@/components/FirebaseLazyLoader';

type ClientLayoutProps = {
  children: React.ReactNode;
};

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <FirebaseLazyLoader preloadStrategy="all">
      <AuthProvider>
        <LoginDialogProvider>
          <SectionRefProvider>
            <SuspenseLoading>
              <AuthHandler />
            </SuspenseLoading>
            <div className="flex flex-col">
              <AppBar />
              {children}
            </div>
          </SectionRefProvider>
        </LoginDialogProvider>
      </AuthProvider>
    </FirebaseLazyLoader>
  );
};

export default ClientLayout;
