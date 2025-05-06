'use client';

import React from 'react';
import Login from '@/components/Login';
import ClientPageWrapper from '../../../components/ClientPageWrapper';

export default function LoginPage() {
  return (
    <ClientPageWrapper>
      <Login open={true} />;
    </ClientPageWrapper>
  );
}
