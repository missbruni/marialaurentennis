'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '../../components/ui/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true} className="min-h-[calc(100vh-72px)]">
      <AppSidebar />
      <main className="w-full max-h-[calc(100vh-72px)] p-8">{children}</main>
    </SidebarProvider>
  );
}
