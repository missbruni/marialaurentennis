'use client';

import AppBar from '../components/AppBar';
import React from 'react';
import { SectionRefProvider } from '@/hooks/useSectionRef';
import { AuthProvider } from '@/hooks/useAuth';

type ClientLayoutProps = {
  children: React.ReactNode;
};

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <AuthProvider>
      <SectionRefProvider>
        <div className="flex flex-col">
          <AppBar />
          {children}
        </div>
      </SectionRefProvider>
    </AuthProvider>
  );
};

export default ClientLayout;
