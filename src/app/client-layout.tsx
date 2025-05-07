'use client';

import AppBar from '../components/AppBar';
import React from 'react';
import { SectionRefProvider } from '@/hooks/useSectionRef';
import { AuthProvider } from '@/hooks/useAuth';
import { LoginDialogProvider } from '@/providers/LoginDialogProvider';

type ClientLayoutProps = {
  children: React.ReactNode;
};

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <AuthProvider>
      <LoginDialogProvider>
        <SectionRefProvider>
          <div className="flex flex-col">
            <AppBar />
            {children}
          </div>
        </SectionRefProvider>
      </LoginDialogProvider>
    </AuthProvider>
  );
};

export default ClientLayout;
