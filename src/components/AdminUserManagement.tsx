'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function AdminUserManagement() {
  const { isAdmin, user } = useAuth();

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
      const idToken = await user?.getIdToken();
      const response = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ uid: userId, role })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully set role to ${role}.`);
        setUserId('');
        setRole('user');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return <div>You don&apos;t have permission to access this page.</div>;
  }

  return (
    <Card className="border-1 max-w-4xl">
      <CardHeader>
        <CardTitle>User Role Management</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <div
            className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
          >
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium mb-1">
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
            <label htmlFor="role" className="block text-sm font-medium mb-1">
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
