'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useLessonFromParams } from '@/hooks/useLessonFromParams';
import { useBookingStatus } from '@/hooks/useBookingStatus';
import { BookingDetails } from './components/BookingDetails';
import { ErrorMessage } from './components/ErrorMessage';
import { BookingStatusMessage } from './components/BookingStatusMessage';
import { ConfirmationHeader } from './components/ConfirmationHeader';

interface ConfirmationProps {
  onClose: () => void;
  onBookAnother: () => void;
}

export default function Confirmation({ onClose, onBookAnother }: ConfirmationProps) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const lesson = useLessonFromParams();

  const { newBooking, isLoading, queryError, showTimeoutError, showConfirmedView } =
    useBookingStatus(sessionId);

  const isBookingConfirmed = newBooking?.status === 'confirmed';
  const isBookingFailed = newBooking?.status === 'failed';

  const isProcessing = isLoading || (!newBooking && !!sessionId);

  const renderContent = () => {
    if (queryError || showTimeoutError) {
      return null;
    }

    if (showConfirmedView) {
      return <BookingStatusMessage booking={newBooking} />;
    }

    return (
      <div>
        <div>Great! Your payment was successful.</div>
        <div className="mt-2 text-sm">
          We&apos;re now finalizing your booking details. This usually takes just a moment.
        </div>
      </div>
    );
  };

  const isButtonLoading = isProcessing || (isBookingConfirmed && !showConfirmedView);

  return (
    <div className="flex min-h-[350px] flex-col">
      <DialogHeader>
        <ConfirmationHeader
          isBookingFailed={isBookingFailed}
          showConfirmedView={showConfirmedView}
        />
      </DialogHeader>

      <DialogDescription className="mt-4 flex-1">
        <ErrorMessage
          queryError={queryError}
          showTimeoutError={showTimeoutError}
          sessionId={sessionId}
        />
        {renderContent()}
      </DialogDescription>

      {lesson && <BookingDetails lesson={lesson} />}

      <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row">
        {showConfirmedView && (
          <Button onClick={onBookAnother} variant="outline" className="w-full sm:w-auto">
            Book Another Lesson
          </Button>
        )}
        <Button
          onClick={onClose}
          className="w-full sm:w-auto"
          disabled={isButtonLoading}
          variant={isBookingFailed ? 'destructive' : 'default'}
        >
          {isButtonLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming...
            </>
          ) : (
            'Done'
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}
