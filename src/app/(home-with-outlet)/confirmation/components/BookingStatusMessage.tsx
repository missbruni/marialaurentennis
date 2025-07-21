import React from 'react';
import type { Booking } from '@/services/booking';

interface BookingStatusMessageProps {
  booking: Booking | null | undefined;
}

export function BookingStatusMessage({ booking }: BookingStatusMessageProps) {
  if (!booking) return null;

  if (booking.status === 'failed') {
    return (
      <div className="text-red-500">
        <p>Your booking could not be completed:</p>
        <p className="mt-2">{booking.failureReason}</p>
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

  if (booking.status === 'confirmed') {
    return 'Your tennis lesson with Maria Lauren has been successfully booked.';
  }

  return null;
}
