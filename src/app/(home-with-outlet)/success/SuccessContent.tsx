'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { createBooking } from '@/services/booking';
import { Availability } from '@/services/availabilities';
import { formatTime } from '@/lib/date';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { capitalizeWords } from '@/lib/string';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

interface SuccessContentProps {
  onClose: () => void;
}

export default function SuccessContent({ onClose }: SuccessContentProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [saveAttempted, setSaveAttempted] = React.useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = React.useState(false);
  const [bookingError, setBookingError] = React.useState<string | null>(null);

  const lessonParam = searchParams.get('lesson');
  const sessionId = searchParams.get('sessionId');

  let lesson: Availability | null = null;
  if (lessonParam) {
    try {
      const decodedLesson = Buffer.from(decodeURIComponent(lessonParam), 'base64').toString();
      lesson = JSON.parse(decodedLesson);
    } catch (error) {
      console.error('Failed to parse booking details:', error);
    }
  }

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

  React.useEffect(() => {
    const createBookingRecord = async () => {
      if (!lesson || !sessionId || saveAttempted || !user) return;

      setSaveAttempted(true);
      setIsCreatingBooking(true);

      try {
        const userEmail = user.email;
        const userId = user.uid;

        if (!userEmail || !userId) {
          throw new Error('User email or ID is missing');
        }

        await createBooking(lesson, sessionId, userEmail, userId);
        queryClient.invalidateQueries({ queryKey: ['availabilities'] });
      } catch (error) {
        console.error('Error creating booking:', error);
        setBookingError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsCreatingBooking(false);
      }
    };

    createBookingRecord();
  }, [lesson, sessionId, saveAttempted, user, queryClient]);

  return (
    <>
      <DialogDescription>
        {bookingError ? (
          <div className="text-red-500">
            <p>There was an error saving your booking details:</p>
            <p>{bookingError}</p>
            <p>
              Your payment ID: <span className="break-all text-red-400">{sessionId}</span>
            </p>
          </div>
        ) : (
          'Your tennis lesson with Maria Lauren has been successfully booked.'
        )}
      </DialogDescription>

      {lesson && getBookingDetails()}

      {bookingError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800 text-sm mt-2">
          <p className="font-medium mb-1">Important:</p>
          <p>
            Your payment was processed successfully, but there was an issue creating your booking
            record. Please contact us with your payment ID for assistance.
          </p>
        </div>
      )}

      <DialogFooter className="mt-4">
        <Button onClick={onClose} className="w-full" disabled={isCreatingBooking}>
          {isCreatingBooking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Done'}
        </Button>
      </DialogFooter>
    </>
  );
}
