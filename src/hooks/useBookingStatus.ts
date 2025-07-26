import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getUserBookings, getBookingBySessionId } from '@/services/booking';

const POLLING_TIMEOUT_MS = 30000;
const VIEW_DELAY_MS = 1000;

export function useBookingStatus(sessionId: string | null) {
  const { user } = useAuth();
  const [showTimeoutError, setShowTimeoutError] = React.useState(false);
  const [showConfirmedView, setShowConfirmedView] = React.useState(false);
  const [shouldStopPolling, setShouldStopPolling] = React.useState(false);

  const waitForUserSession = !!user?.uid && !!sessionId;
  const waitForSessionId = !!sessionId && !user?.uid;

  console.log('[BOOKING_STATUS] Hook state:', {
    sessionId,
    userId: user?.uid,
    waitForUserSession,
    waitForSessionId,
    shouldStopPolling,
    showTimeoutError
  });

  const {
    data: userBookings,
    isLoading: isLoadingUserBookings,
    error: userBookingsError
  } = useQuery({
    queryKey: ['userBookings', user?.uid],
    queryFn: () => {
      console.log('[BOOKING_STATUS] Fetching user bookings for:', user?.uid);
      return getUserBookings(user?.uid);
    },
    enabled: waitForUserSession && !shouldStopPolling,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    retry: false
  });

  const {
    data: sessionBooking,
    isLoading: isLoadingSessionBooking,
    error: sessionBookingError
  } = useQuery({
    queryKey: ['sessionBooking', sessionId],
    queryFn: () => {
      console.log('[BOOKING_STATUS] Fetching session booking for:', sessionId);
      return getBookingBySessionId(sessionId!);
    },
    enabled: waitForSessionId && !shouldStopPolling,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    retry: false
  });

  console.log('[BOOKING_STATUS] Query results:', {
    userBookingsCount: userBookings?.length || 0,
    sessionBooking: sessionBooking ? 'found' : 'not found',
    isLoadingUserBookings,
    isLoadingSessionBooking,
    userBookingsError: userBookingsError ? 'error' : null,
    sessionBookingError: sessionBookingError ? 'error' : null
  });

  const newBooking = React.useMemo(() => {
    const bookings = userBookings || (sessionBooking ? [sessionBooking] : undefined);
    if (!bookings || !sessionId) return null;
    const booking = bookings.find((booking) => booking.stripeId === sessionId);

    console.log('[BOOKING_STATUS] Finding booking by session ID:', {
      sessionId,
      bookingsCount: bookings.length,
      found: !!booking,
      bookingStatus: booking?.status
    });

    return booking;
  }, [userBookings, sessionBooking, sessionId]);

  const isLoading = isLoadingUserBookings || isLoadingSessionBooking;
  const queryError = userBookingsError || sessionBookingError;

  React.useEffect(() => {
    if (newBooking || queryError) {
      console.log('[BOOKING_STATUS] Stopping polling:', {
        reason: newBooking ? 'booking found' : 'query error',
        bookingStatus: newBooking?.status
      });
      setShouldStopPolling(true);
    }
  }, [newBooking, queryError]);

  React.useEffect(() => {
    if (newBooking?.status === 'confirmed' && !showConfirmedView) {
      console.log('[BOOKING_STATUS] Showing confirmed view after delay');
      const timer = setTimeout(() => setShowConfirmedView(true), VIEW_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [newBooking?.status, showConfirmedView]);

  React.useEffect(() => {
    if (!newBooking && (waitForUserSession || waitForSessionId) && !shouldStopPolling) {
      console.log('[BOOKING_STATUS] Starting timeout timer for polling');
      const timeout = setTimeout(() => {
        console.log('[BOOKING_STATUS] Polling timeout reached after', POLLING_TIMEOUT_MS, 'ms');
        setShowTimeoutError(true);
        setShouldStopPolling(true);
      }, POLLING_TIMEOUT_MS);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, newBooking, sessionId, shouldStopPolling, waitForUserSession, waitForSessionId]);

  console.log('[BOOKING_STATUS] Final state:', {
    newBooking: newBooking ? { id: newBooking.id, status: newBooking.status } : null,
    isLoading,
    queryError: queryError ? 'error' : null,
    showTimeoutError,
    showConfirmedView
  });

  return {
    newBooking,
    isLoading,
    queryError,
    showTimeoutError,
    showConfirmedView
  };
}
