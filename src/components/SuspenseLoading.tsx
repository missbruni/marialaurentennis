'use client';

import React from 'react';
import Loader from './Loader';

export default function SuspenseLoading({ children }: { children: React.ReactNode }) {
  return <React.Suspense fallback={<Loader />}>{children}</React.Suspense>;
}
