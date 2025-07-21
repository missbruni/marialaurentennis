import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getUserBookings } from '@/services/booking';

const POLLING_TIMEOUT_MS = 30000;
const VIEW_DELAY_MS = 1000;

export function useBookingStatus(sessionId: string | null) {
  const { user } = useAuth();
  const [showTimeoutError, setShowTimeoutError] = React.useState(false);
  const [showConfirmedView, setShowConfirmedView] = React.useState(false);

  const waitForUserSession = !!user?.uid && !!sessionId;

  const {
    data: bookings,
    isLoading,
    error: queryError
  } = useQuery({
    queryKey: ['userBookings', user?.uid],
    queryFn: () => getUserBookings(user?.uid),
    enabled: waitForUserSession,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    retry: false
  });

  const newBooking = React.useMemo(() => {
    if (!bookings || !sessionId) return null;
    return bookings.find((booking) => booking.stripeId === sessionId);
  }, [bookings, sessionId]);

  React.useEffect(() => {
    if (newBooking?.status === 'confirmed' && !showConfirmedView) {
      const timer = setTimeout(() => setShowConfirmedView(true), VIEW_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [newBooking?.status, showConfirmedView]);

  React.useEffect(() => {
    if (!newBooking && waitForUserSession) {
      const timeout = setTimeout(() => setShowTimeoutError(true), POLLING_TIMEOUT_MS);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, newBooking, sessionId, showTimeoutError, waitForUserSession]);

  return {
    newBooking,
    isLoading,
    queryError,
    showTimeoutError,
    showConfirmedView
  };
}
