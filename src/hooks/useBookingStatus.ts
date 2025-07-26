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

  // Log polling state changes for debugging
  React.useEffect(() => {
    console.log('🔍 Booking status polling state changed:', {
      sessionId,
      userId: user?.uid,
      userEmail: user?.email,
      waitForUserSession,
      waitForSessionId,
      shouldStopPolling
    });
  }, [sessionId, user?.uid, user?.email, waitForUserSession, waitForSessionId, shouldStopPolling]);

  const {
    data: userBookings,
    isLoading: isLoadingUserBookings,
    error: userBookingsError,
    refetch: refetchUserBookings
  } = useQuery({
    queryKey: ['userBookings', user?.uid],
    queryFn: async () => {
      console.log('🔍 Fetching user bookings:', {
        userId: user?.uid,
        userEmail: user?.email,
        sessionId
      });
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
    error: sessionBookingError,
    refetch: refetchSessionBooking
  } = useQuery({
    queryKey: ['sessionBooking', sessionId],
    queryFn: async () => {
      console.log('🔍 Fetching session booking:', {
        sessionId,
        userId: user?.uid,
        userEmail: user?.email
      });
      return getBookingBySessionId(sessionId!);
    },
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

    if (booking) {
      console.log('✅ Found matching booking:', {
        sessionId,
        bookingId: booking.id,
        bookingStatus: booking.status,
        userId: user?.uid,
        userEmail: user?.email
      });
    }

    return booking;
  }, [userBookings, sessionBooking, sessionId, user?.uid, user?.email]);

  const isLoading = isLoadingUserBookings || isLoadingSessionBooking;
  const queryError = userBookingsError || sessionBookingError;

  React.useEffect(() => {
    if (newBooking || queryError) {
      console.log('🛑 Stopping polling - booking found or error occurred:', {
        sessionId,
        userId: user?.uid,
        userEmail: user?.email,
        bookingFound: !!newBooking,
        hasError: !!queryError
      });
      setShouldStopPolling(true);
    }
  }, [newBooking, queryError, sessionId, user?.uid, user?.email]);

  React.useEffect(() => {
    if (newBooking?.status === 'confirmed' && !showConfirmedView) {
      console.log('✅ Showing confirmed view:', {
        sessionId,
        bookingId: newBooking.id,
        userId: user?.uid,
        userEmail: user?.email
      });
      const timer = setTimeout(() => setShowConfirmedView(true), VIEW_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [newBooking?.status, showConfirmedView, sessionId, user?.uid, user?.email]);

  React.useEffect(() => {
    if (!newBooking && (waitForUserSession || waitForSessionId) && !shouldStopPolling) {
      console.log('⏰ Starting timeout timer for booking polling:', {
        sessionId,
        userId: user?.uid,
        userEmail: user?.email,
        timeoutMs: POLLING_TIMEOUT_MS
      });

      const timeout = setTimeout(() => {
        console.error('⏰ Booking polling timed out:', {
          sessionId,
          userId: user?.uid,
          userEmail: user?.email,
          timeoutMs: POLLING_TIMEOUT_MS,
          userBookingsCount: userBookings?.length || 0,
          sessionBookingFound: !!sessionBooking
        });

        setShowTimeoutError(true);
        setShouldStopPolling(true);
      }, POLLING_TIMEOUT_MS);

      return () => {
        console.log('🧹 Clearing timeout timer:', {
          sessionId,
          userId: user?.uid,
          userEmail: user?.email
        });
        clearTimeout(timeout);
      };
    }
  }, [
    isLoading,
    newBooking,
    sessionId,
    shouldStopPolling,
    waitForUserSession,
    waitForSessionId,
    user?.uid,
    user?.email,
    userBookings?.length,
    sessionBooking
  ]);

  // Manual refetch function for debugging
  const manualRefetch = React.useCallback(() => {
    console.log('🔄 Manual refetch triggered:', {
      sessionId,
      userId: user?.uid,
      userEmail: user?.email
    });

    if (waitForUserSession) {
      refetchUserBookings();
    } else if (waitForSessionId) {
      refetchSessionBooking();
    }
  }, [
    waitForUserSession,
    waitForSessionId,
    refetchUserBookings,
    refetchSessionBooking,
    sessionId,
    user?.uid,
    user?.email
  ]);

  return {
    newBooking,
    isLoading,
    queryError,
    showTimeoutError,
    showConfirmedView,
    manualRefetch
  };
}
