import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true} className="min-h-[calc(100vh-72px)]">
      <AppSidebar />
      <main className="w-full max-h-[calc(100vh-72px)] py-8 px-4 lg:p-8">{children}</main>
    </SidebarProvider>
  );
}
