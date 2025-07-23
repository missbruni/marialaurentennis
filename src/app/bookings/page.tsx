'use client';

import React, { Suspense, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Typography } from '@/components/ui/typography';
import AuthGuard from '../../components/AuthGuard';
import { BookingCard } from '@/components/BookingCard';
import { use } from 'react';
import { getBookingsData } from '@/lib/data';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import type { Booking } from '@/services/booking';

// Skeleton component for booking cards
function BookingsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-6 shadow-md dark:bg-[#242423]">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mb-4 h-4 w-48" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BookingsPage() {
  const { user } = useAuth();

  if (!user?.uid) {
    return (
      <AuthGuard>
        <BookingsSkeleton />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <section className="dark:bg-background relative flex min-h-[calc(100vh-72px)] w-full flex-col gap-8 overflow-hidden p-8 md:p-16 lg:p-24">
        <Typography.H3 className="mb-6">My Lessons</Typography.H3>

        <Suspense fallback={<BookingsSkeleton />}>
          <ErrorBoundary
            fallback={
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <Typography.P className="text-red-600 dark:text-red-400">
                  Error loading bookings. Please try again later.
                </Typography.P>
              </div>
            }
          >
            <BookingsWithData userId={user.uid} />
          </ErrorBoundary>
        </Suspense>
      </section>
    </AuthGuard>
  );
}

function BookingsWithData({ userId }: { userId: string }) {
  // Create a stable promise reference using useMemo
  const bookingsPromise = useMemo(() => {
    console.log('🔄 Creating bookings promise for userId:', userId);
    return getBookingsData(userId);
  }, [userId]);

  const bookings = use(bookingsPromise);

  console.log('📋 Bookings data received:', bookings?.length || 0, 'bookings');

  if (!bookings || bookings.length === 0) {
    return (
      <div className="py-12 text-center">
        <Typography.H4 className="text-muted-foreground mb-2">No lessons found</Typography.H4>
        <Typography.P>You haven&apos;t booked any lessons yet.</Typography.P>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {bookings.map((booking: Booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
