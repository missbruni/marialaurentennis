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

  const {
    data: userBookings,
    isLoading: isLoadingUserBookings,
    error: userBookingsError
  } = useQuery({
    queryKey: ['userBookings', user?.uid],
    queryFn: () => getUserBookings(user?.uid),
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
    queryFn: () => getBookingBySessionId(sessionId!),
    enabled: waitForSessionId && !shouldStopPolling,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    retry: false
  });

  const newBooking = React.useMemo(() => {
    const bookings = userBookings || (sessionBooking ? [sessionBooking] : undefined);
    if (!bookings || !sessionId) return null;
    const booking = bookings.find((booking) => booking.stripeId === sessionId);
    return booking;
  }, [userBookings, sessionBooking, sessionId]);

  const isLoading = isLoadingUserBookings || isLoadingSessionBooking;
  const queryError = userBookingsError || sessionBookingError;

  React.useEffect(() => {
    if (newBooking || queryError) {
      setShouldStopPolling(true);
    }
  }, [newBooking, queryError]);

  React.useEffect(() => {
    if (newBooking?.status === 'confirmed' && !showConfirmedView) {
      const timer = setTimeout(() => setShowConfirmedView(true), VIEW_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [newBooking?.status, showConfirmedView]);

  React.useEffect(() => {
    if (!newBooking && (waitForUserSession || waitForSessionId) && !shouldStopPolling) {
      const timeout = setTimeout(() => {
        setShowTimeoutError(true);
        setShouldStopPolling(true);
      }, POLLING_TIMEOUT_MS);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, newBooking, sessionId, shouldStopPolling, waitForUserSession, waitForSessionId]);

  return {
    newBooking,
    isLoading,
    queryError,
    showTimeoutError,
    showConfirmedView
  };
}
