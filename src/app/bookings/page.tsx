'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Typography } from '@/components/ui/typography';
import { getUserBookings } from '../../services/booking';
import Loader from '../../components/Loader';
import AuthGuard from '../../components/AuthGuard';
import { BookingCard } from '@/components/BookingCard';

const FIVE_MINUTES = 5 * 60 * 1000;

export default function BookingsPage() {
  const { user } = useAuth();

  const {
    data: bookings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['userBookings', user?.uid],
    queryFn: () => getUserBookings(user?.uid),
    enabled: !!user?.uid,
    staleTime: FIVE_MINUTES
  });

  return (
    <AuthGuard>
      <section className="p-8 md:p-16 lg:p-24 dark:bg-background min-h-[calc(100vh-72px)] w-full relative overflow-hidden flex flex-col gap-8">
        <Typography.H3 className="mb-6">My Lessons</Typography.H3>

        {isLoading ? (
          <Loader message="Getting your booked lessons..." />
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
            <Typography.P className="text-red-600 dark:text-red-400">
              Error loading bookings: {error instanceof Error ? error.message : 'Unknown error'}
            </Typography.P>
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Typography.H4 className="text-muted-foreground mb-2">No lessons found</Typography.H4>
            <Typography.P>You haven&apos;t booked any lessons yet.</Typography.P>
          </div>
        )}
      </section>
    </AuthGuard>
  );
}


