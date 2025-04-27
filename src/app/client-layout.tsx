'use client';

import AppBar from '../components/AppBar';
import React from 'react';
import { BookingFormProvider } from '../components/hooks/useBookingForm';
import { AuthProvider } from '../components/hooks/useAuth';

type ClientLayoutProps = {
  children: React.ReactNode;
};

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <AuthProvider>
      <BookingFormProvider>
        <div className="flex flex-col">
          <AppBar />
          <div>{children}</div>
        </div>
      </BookingFormProvider>
    </AuthProvider>
  );
};

export default ClientLayout;
