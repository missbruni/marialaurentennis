'use client';

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Suspense } from 'react';
import { useSectionRef } from '@/hooks/useSectionRef';
import { useSearchParams } from 'next/navigation';
import { useBookingStatus } from '@/hooks/useBookingStatus';
import Confirmation from './Confirmation';
import { BookingStatusProvider } from '@/components/BookingStatusProvider';

function ConfirmationWrapper({
  onClose,
  onBookAnother,
  onProcessingStateChange
}: {
  onClose: () => void;
  onBookAnother: () => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
}) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { newBooking, isLoading, showTimeoutError, showConfirmedView, queryError } =
    useBookingStatus(sessionId);

  const isProcessing = isLoading || (!newBooking && !!sessionId);
  const hasFinalResult =
    showConfirmedView || showTimeoutError || queryError || newBooking?.status === 'failed';
  const shouldShowCloseButton = hasFinalResult && !isProcessing;

  React.useEffect(() => {
    onProcessingStateChange(isProcessing);
  }, [isProcessing, onProcessingStateChange]);

  return (
    <DialogContent className={`sm:max-w-lg ${!shouldShowCloseButton ? '[&>button]:hidden' : ''}`}>
      <Confirmation onClose={onClose} onBookAnother={onBookAnother} sessionId={sessionId} />
    </DialogContent>
  );
}

export default function SuccessPage() {
  const [open, setOpen] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const { scrollToBookingForm } = useSectionRef();

  const handleClose = () => {
    setOpen(false);
    window.history.replaceState({}, '', '/');
  };

  const handleBookAnother = () => {
    handleClose();
    scrollToBookingForm();
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing the dialog if processing is happening
    if (!newOpen && isProcessing) {
      return;
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Suspense fallback={<div>Loading booking details...</div>}>
        <BookingStatusProvider>
          <ConfirmationWrapper
            onClose={handleClose}
            onBookAnother={handleBookAnother}
            onProcessingStateChange={setIsProcessing}
          />
        </BookingStatusProvider>
      </Suspense>
    </Dialog>
  );
}
