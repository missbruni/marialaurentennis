'use client';

import AppBar from '../components/AppBar';
import React from 'react';
import { BookingFormProvider } from '@/hooks/useBookingForm';
import { AuthProvider } from '@/hooks/useAuth';

type ClientLayoutProps = {
  children: React.ReactNode;
};

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <AuthProvider>
      <BookingFormProvider>
        <div className="flex flex-col">
          <AppBar />
          {children}
        </div>
      </BookingFormProvider>
    </AuthProvider>
  );
};

export default ClientLayout;
