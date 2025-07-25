'use client';

import React from 'react';
import { setUserRoleAction } from '@/lib/actions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function AdminUserManagement() {
  const [userId, setUserId] = React.useState('');
  const [role, setRole] = React.useState('user');
  const [message, setMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSetRole = async () => {
    if (!userId) {
      setMessage('Please enter a user ID');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('uid', userId);
      formData.append('role', role);

      const result = await setUserRoleAction(formData);

      if (result.success) {
        setMessage(result.message || `Successfully set role to ${role}.`);
        setUserId('');
        setRole('user');
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl border-1 border-[var(--sidebar-border)]">
      <CardHeader>
        <CardTitle>User Role Management</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <div
            className={`mb-4 rounded p-3 ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
          >
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="userId" className="mb-1 block text-sm font-medium">
              User ID
            </label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Firebase User UID"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium">
              Role
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSetRole} disabled={isLoading || !userId} className="w-full">
            {isLoading ? 'Setting Role...' : 'Set Role'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
