'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, XCircle, CheckCircle2 } from 'lucide-react';
import { Availability } from '@/services/availabilities';
import { formatTime } from '@/lib/date';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { capitalizeWords } from '@/lib/string';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getUserBookings } from '@/services/booking';

interface ConfirmationContentProps {
  onClose: () => void;
}

export default function ConfirmationContent({ onClose }: ConfirmationContentProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const lessonParam = searchParams.get('lesson');
  const sessionId = searchParams.get('sessionId');

  const POLLING_TIMEOUT_MS = 30000; // 30 seconds

  let lesson: Availability | null = null;
  if (lessonParam) {
    try {
      const decodedLesson = Buffer.from(decodeURIComponent(lessonParam), 'base64').toString();
      lesson = JSON.parse(decodedLesson);
    } catch (error) {
      console.error('Failed to parse booking details:', error);
    }
  }

  const {
    data: bookings,
    isLoading,
    error: queryError
  } = useQuery({
    queryKey: ['userBookings', user?.uid],
    queryFn: () => getUserBookings(user?.uid),
    enabled: !!user?.uid && !!sessionId,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    retry: false // Don't retry on error to avoid infinite polling
  });

  const newBooking = React.useMemo(() => {
    if (!bookings || !sessionId) return null;
    return bookings.find((booking) => booking.stripeId === sessionId);
  }, [bookings, sessionId]);

  const getBookingStatusMessage = () => {
    if (!newBooking) return null;

    if (newBooking.status === 'failed') {
      return (
        <div className="text-red-500">
          <p>Your booking could not be completed:</p>
          <p className="mt-2">{newBooking.failureReason}</p>
          <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="mb-1 font-medium">Important:</p>
            <p>
              Your payment has been automatically refunded. Please try booking a different lesson
              time.
            </p>
          </div>
        </div>
      );
    }

    if (newBooking.status === 'confirmed') {
      return 'Your tennis lesson with Maria Lauren has been successfully booked.';
    }

    return null;
  };

  // Show error if we've been polling for too long without finding the booking
  const [showTimeoutError, setShowTimeoutError] = React.useState(false);
  React.useEffect(() => {
    if (isLoading && !newBooking && sessionId) {
      const timeout = setTimeout(() => {
        setShowTimeoutError(true);
      }, POLLING_TIMEOUT_MS); // 30 seconds
      return () => clearTimeout(timeout);
    }
  }, [isLoading, newBooking, sessionId]);

  const getBookingDetails = () => {
    if (!lesson) return null;

    const startDateTime = new Timestamp(
      lesson.startDateTime.seconds,
      lesson.startDateTime.nanoseconds
    );
    const endDateTime = new Timestamp(lesson.endDateTime.seconds, lesson.endDateTime.nanoseconds);

    const date = startDateTime.toDate();
    const formattedDate = format(date, 'EEEE, MMMM d yyyy');
    const formattedStartTime = formatTime(startDateTime);
    const formattedEndTime = formatTime(endDateTime);

    return (
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date:</span>
          <span className="font-medium">{formattedDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Time:</span>
          <span className="font-medium">
            {formattedStartTime} - {formattedEndTime}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Location:</span>
          <span className="font-medium">{capitalizeWords(lesson.location)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Type:</span>
          <span className="font-medium">{capitalizeWords(lesson.type)} Lesson</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Price:</span>
          <span className="font-medium">£{lesson.price}</span>
        </div>
      </div>
    );
  };

  const errorMessage =
    queryError || showTimeoutError ? (
      <div className="text-red-500">
        <p>There was an issue confirming your booking:</p>
        {queryError ? (
          <p>
            {queryError instanceof Error ? queryError.message : 'Failed to load booking details'}
          </p>
        ) : (
          <p>Your booking is taking longer than expected to confirm.</p>
        )}
        <p className="mt-2">
          Your payment ID: <span className="break-all text-red-400">{sessionId}</span>
        </p>
        <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="mb-1 font-medium">Important:</p>
          <p>
            Your payment was processed successfully, but there was an issue confirming your booking
            record. Please contact us with your payment ID for assistance.
          </p>
        </div>
      </div>
    ) : null;

  const isLoadingOrConfirming = isLoading || (!newBooking && !!sessionId);

  return (
    <>
      <DialogHeader>
        {newBooking?.status === 'failed' ? (
          <span className="text-destructive flex items-center gap-2">
            <XCircle className="h-6 w-6" />
            <DialogTitle className="text-destructive">Booking Not Completed</DialogTitle>
          </span>
        ) : (
          <span className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            <DialogTitle>Booking Confirmed</DialogTitle>
          </span>
        )}
      </DialogHeader>
      <DialogDescription>
        {errorMessage ||
          (isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Confirming your booking...</span>
            </div>
          ) : newBooking ? (
            getBookingStatusMessage()
          ) : (
            <div className="text-yellow-600">
              <p>Your payment was successful, but we are still confirming your booking.</p>
              <p className="mt-2 text-sm">
                Please keep this window open while we process your booking. This may take a few
                moments.
              </p>
            </div>
          ))}
      </DialogDescription>

      {lesson && getBookingDetails()}

      <DialogFooter className="mt-4">
        <Button
          onClick={onClose}
          className="w-full"
          disabled={isLoadingOrConfirming}
          variant={newBooking?.status === 'failed' ? 'destructive' : 'default'}
        >
          {isLoadingOrConfirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming...
            </>
          ) : (
            'Done'
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
