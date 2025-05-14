'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { format } from 'date-fns';
import { formatTime } from '@/lib/date';
import { capitalizeWords } from '@/lib/string';
import { Badge } from '@/components/ui/badge';
import { Booking, getUserBookings } from '../../services/booking';
import Loader from '../../components/Loader';
import AuthGuard from '../../components/AuthGuard';

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

function BookingCard({ booking }: { booking: Booking }) {
  const startDate = booking.startDateTime.toDate();

  const formattedDate = format(startDate, 'EEEE, MMMM d yyyy');
  const formattedStartTime = formatTime(booking.startDateTime);
  const formattedEndTime = formatTime(booking.endDateTime);

  const isPast = startDate < new Date();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{formattedDate}</CardTitle>
          <Badge variant={isPast ? 'outline' : 'default'}>
            {isPast ? 'Completed' : 'Upcoming'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium">
              {formattedStartTime} - {formattedEndTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location:</span>
            <span className="font-medium">{capitalizeWords(booking.location)}</span>
          </div>
          {booking.type && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{capitalizeWords(booking.type)} Lesson</span>
            </div>
          )}
          {booking.price && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium">£{booking.price}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium">{capitalizeWords(booking.status)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booked on:</span>
            <span className="font-medium">{format(booking.createdAt.toDate(), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
