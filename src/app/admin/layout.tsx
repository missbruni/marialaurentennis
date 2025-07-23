'use client';

import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AuthGuard from '@/components/AuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={true} className="min-h-[calc(100vh-72px)]">
        <AppSidebar />
        <main className="max-h-[calc(100vh-72px)] w-full px-4 py-8 lg:p-8">{children}</main>
      </SidebarProvider>
    </AuthGuard>
  );
}
