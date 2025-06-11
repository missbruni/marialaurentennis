'use client';

import React from 'react';
import { Typography } from '@/components/ui/typography';
import { StatusCard, type StatusChipColor } from '@/components/StatusCard';

type DashboardItem = {
  title: string;
  description: string;
  actionText: string;
  statusText: string;
  statusColor: StatusChipColor;
  url: string;
  disabled?: boolean;
};

const dashboardItems: DashboardItem[] = [
  {
    title: 'Availability',
    description: 'Configure your coaching hours and manage your schedule.',
    actionText: 'Manage availability',
    statusText: 'Set Up',
    statusColor: 'green',
    url: '/admin/availability'
  },
  {
    title: 'Settings',
    description: 'Adjust your account settings and notification preferences.',
    actionText: 'Manage settings',
    statusText: 'Configure',
    statusColor: 'gray',
    url: '/admin/settings'
  },
  {
    title: 'Bookings',
    description: 'Manage your upcoming and past coaching sessions.',
    actionText: 'View all bookings',
    statusText: '12 Active',
    statusColor: 'blue',
    url: '/admin/bookings',
    disabled: true
  },
  {
    title: 'Profile',
    description: 'Edit your profile information and coaching details.',
    actionText: 'Edit profile',
    statusText: 'Update',
    statusColor: 'yellow',
    url: '/admin/profile',
    disabled: true
  },
  {
    title: 'Analytics',
    description: 'Track your coaching performance and client statistics.',
    actionText: 'View analytics',
    statusText: 'View',
    statusColor: 'purple',
    url: '/admin/analytics',
    disabled: true
  },
  {
    title: 'Clients',
    description: 'Manage your client list and view client details.',
    actionText: 'View clients',
    statusText: '25 Total',
    statusColor: 'indigo',
    url: '/admin/clients',
    disabled: true
  }
];

export default function AdminPage() {
  const handleCardClick = (url: string) => {
    // You could use router.push here if you want to navigate programmatically
    window.location.href = url;
  };

  return (
    <div className="container py-8">
      <Typography.H4 className="mb-6">Admin Dashboard</Typography.H4>
      <Typography.P className="mb-8">
        Welcome to the admin dashboard. Here you can view your bookings, availability, and settings.
      </Typography.P>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item) => (
          <StatusCard
            disabled={item.disabled}
            key={item.title}
            title={item.title}
            description={item.description}
            actionText={item.actionText}
            statusText={item.statusText}
            statusColor={item.statusColor}
            onClick={() => handleCardClick(item.url)}
          />
        ))}
      </div>
    </div>
  );
}
