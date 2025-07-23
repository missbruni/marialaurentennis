import React from 'react';
import { Loader2, XCircle, CheckCircle2 } from 'lucide-react';
import { DialogTitle } from '@/components/ui/dialog';

interface ConfirmationHeaderProps {
  isBookingFailed: boolean;
  showConfirmedView: boolean;
  showTimeoutError: boolean;
}

export function ConfirmationHeader({
  isBookingFailed,
  showConfirmedView,
  showTimeoutError
}: ConfirmationHeaderProps) {
  if (isBookingFailed) {
    return (
      <span className="text-destructive flex items-center gap-2">
        <XCircle className="h-6 w-6" />
        <DialogTitle className="text-destructive">Booking Not Completed</DialogTitle>
      </span>
    );
  }

  if (showConfirmedView) {
    return (
      <span className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="h-6 w-6" />
        <DialogTitle>Booking Confirmed</DialogTitle>
      </span>
    );
  }

  if (showTimeoutError) {
    return (
      <span className="text-destructive flex items-center gap-2">
        <XCircle className="h-6 w-6" />
        <DialogTitle className="text-destructive">Error Processing Booking</DialogTitle>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 text-yellow-600">
      <Loader2 className="h-6 w-6 animate-spin" />
      <DialogTitle>Processing Your Booking</DialogTitle>
    </span>
  );
}
