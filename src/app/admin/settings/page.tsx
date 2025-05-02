'use client';

import React from 'react';
import { Typography } from '@/components/ui/typography';
import AdminUserManagement from '@/components/AdminUserManagement';

export default function AdminSettings() {
  return (
    <div>
      <Typography.H4 className="mb-6">Settings</Typography.H4>
      <AdminUserManagement />
    </div>
  );
}
