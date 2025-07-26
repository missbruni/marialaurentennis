'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBookingStatus } from '@/hooks/useBookingStatus';

export default function DebugPage() {
  const [sessionId, setSessionId] = React.useState('');
  const [testSessionId, setTestSessionId] = React.useState('');

  const { newBooking, isLoading, queryError, showTimeoutError, showConfirmedView, manualRefetch } =
    useBookingStatus(testSessionId || null);

  const handleTest = () => {
    setTestSessionId(sessionId);
  };

  const handleClear = () => {
    setTestSessionId('');
    setSessionId('');
  };

  return (
    <div className="container mx-auto space-y-6 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Booking Status Debug Tool</CardTitle>
          <CardDescription>
            Test the booking status polling functionality with a session ID
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionId">Session ID</Label>
            <Input
              id="sessionId"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Enter a Stripe session ID to test"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleTest} disabled={!sessionId}>
              Test Polling
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
            <Button onClick={manualRefetch} variant="outline" disabled={!testSessionId}>
              Manual Refetch
            </Button>
          </div>
        </CardContent>
      </Card>

      {testSessionId && (
        <Card>
          <CardHeader>
            <CardTitle>Polling Results</CardTitle>
            <CardDescription>Current status for session: {testSessionId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Booking Found:</strong> {newBooking ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Error:</strong> {queryError ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Timeout Error:</strong> {showTimeoutError ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Confirmed View:</strong> {showConfirmedView ? 'Yes' : 'No'}
              </div>
            </div>

            {newBooking && (
              <div className="rounded border bg-gray-50 p-4">
                <h4 className="mb-2 font-semibold">Booking Details:</h4>
                <pre className="overflow-auto text-xs">{JSON.stringify(newBooking, null, 2)}</pre>
              </div>
            )}

            {queryError && (
              <div className="rounded border bg-red-50 p-4">
                <h4 className="mb-2 font-semibold text-red-700">Error:</h4>
                <pre className="overflow-auto text-xs text-red-600">
                  {JSON.stringify(queryError, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Console Logs</CardTitle>
          <CardDescription>
            Check the browser console for detailed logging information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Open the browser developer tools (F12) and check the Console tab to see detailed logs
            about:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
            <li>Polling state changes</li>
            <li>Firebase query execution</li>
            <li>Booking data retrieval</li>
            <li>Error handling</li>
            <li>Timeout events</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
