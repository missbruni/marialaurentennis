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
  // TODO: put in footer
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

  return (
    <Sidebar className="max-h-[calc(100vh-72px)] relative">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
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
