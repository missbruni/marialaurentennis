'use client';

import { Calendar, Home, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { useAdminPreloader } from '@/lib/admin-preloader';

const items = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Home
  },
  {
    title: 'Availability',
    url: '/admin/availability',
    icon: Calendar
  },
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: Settings
  }
  // {
  //   title: 'Bookings',
  //   url: '/admin/bookings',
  //   icon: Inbox
  // },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { preloadRouteComponents } = useAdminPreloader();

  const preloadPage = (url: string) => {
    preloadRouteComponents(url);
  };

  return (
    <Sidebar className="relative max-h-[calc(100vh-72px)] border-r-[var(--sidebar-border)]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    onMouseEnter={() => preloadPage(item.url)}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
