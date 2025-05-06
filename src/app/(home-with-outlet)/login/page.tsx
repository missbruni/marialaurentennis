'use client';

import React from 'react';
import Login from '@/components/Login';
import SuspenseLoading from '../../../components/SuspenseLoading';

export default function LoginPage() {
  return (
    <SuspenseLoading>
      <Login open={true} />;
    </SuspenseLoading>
  );
}
