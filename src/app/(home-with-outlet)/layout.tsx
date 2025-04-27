'use client';

import React from 'react';
import HomePage from '../page';

export default function HomeWithOutlet({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HomePage />
      {children}
    </>
  );
}
