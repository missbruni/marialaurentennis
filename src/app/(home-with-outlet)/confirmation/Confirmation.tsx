'use client';

import React from 'react';
import { DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLessonFromParams } from '@/hooks/useLessonFromParams';
import { useBookingStatus } from '@/hooks/useBookingStatus';
import { BookingDetails } from './components/BookingDetails';
import { ErrorMessage } from './components/ErrorMessage';
import { BookingStatusMessage } from './components/BookingStatusMessage';
import { ConfirmationHeader } from './components/ConfirmationHeader';

interface ConfirmationProps {
  onClose: () => void;
  onBookAnother: () => void;
  sessionId: string | null;
}

export default function Confirmation({ onClose, onBookAnother, sessionId }: ConfirmationProps) {
  const lesson = useLessonFromParams();

  const { newBooking, queryError, showTimeoutError, showConfirmedView, manualRefetch } =
    useBookingStatus(sessionId);

  const isBookingFailed = newBooking?.status === 'failed';

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

  const shouldShowButton = showConfirmedView || showTimeoutError || queryError || isBookingFailed;

  return (
    <div className="flex min-h-[350px] flex-col">
      <DialogHeader>
        <ConfirmationHeader
          isBookingFailed={isBookingFailed}
          showConfirmedView={showConfirmedView}
          showTimeoutError={showTimeoutError}
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

      {lesson && (
        <>
          <div className="mt-4 mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Details</h3>
          </div>
          <BookingDetails lesson={lesson} />
        </>
      )}

      {shouldShowButton && (
        <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row">
          {showConfirmedView && !queryError && !showTimeoutError && (
            <Button onClick={onBookAnother} variant="outline" className="w-full sm:w-auto">
              Book Another Lesson
            </Button>
          )}
          <Button
            onClick={onClose}
            className="w-full sm:w-auto"
            variant={isBookingFailed ? 'destructive' : 'default'}
          >
            Done
          </Button>
        </DialogFooter>
      )}

      {/* Debug button - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <DialogFooter className="mt-2">
          <Button onClick={manualRefetch} variant="outline" size="sm" className="w-full sm:w-auto">
            🔄 Debug: Manual Refetch
          </Button>
        </DialogFooter>
      )}
    </div>
  );
}
