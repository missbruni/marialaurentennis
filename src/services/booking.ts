import { getDocs, Timestamp, orderBy, query, where, collection } from 'firebase/firestore';
import { getFirestore } from '../lib/firebase';

export type Booking = {
  id: string;
  startDateTime: Timestamp;
  endDateTime: Timestamp;
  location: string;
  status: 'confirmed' | 'failed' | 'cancelled';
  createdAt: Timestamp;
  price?: number;
  type?: string;
  stripeId?: string;
  userId?: string;
  userEmail?: string;
  failureReason?: string;
  refunded?: boolean;
};

export const getUserBookings = async (userId?: string) => {
  console.log('[BOOKING_SERVICE] getUserBookings called with userId:', userId);

  if (!userId) {
    console.error('[BOOKING_SERVICE] getUserBookings: User not authenticated');
    throw new Error('User not authenticated');
  }

  try {
    const db = await getFirestore();
    console.log('[BOOKING_SERVICE] Firestore instance obtained');

    const bookingsCollection = collection(db, 'bookings');
    const bookingsQuery = query(
      bookingsCollection,
      where('userId', '==', userId),
      orderBy('startDateTime', 'desc')
    );

    console.log('[BOOKING_SERVICE] Executing query for user bookings');
    const snapshot = await getDocs(bookingsQuery);

    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];

    console.log('[BOOKING_SERVICE] getUserBookings result:', {
      userId,
      bookingsCount: bookings.length,
      bookingIds: bookings.map((b) => b.id),
      stripeIds: bookings.map((b) => b.stripeId).filter(Boolean)
    });

    return bookings;
  } catch (error) {
    console.error('[BOOKING_SERVICE] Error in getUserBookings:', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

export const getBookingBySessionId = async (sessionId: string) => {
  console.log('[BOOKING_SERVICE] getBookingBySessionId called with sessionId:', sessionId);

  if (!sessionId) {
    console.error('[BOOKING_SERVICE] getBookingBySessionId: Session ID is required');
    throw new Error('Session ID is required');
  }

  try {
    const db = await getFirestore();
    console.log('[BOOKING_SERVICE] Firestore instance obtained for session query');

    const bookingsCollection = collection(db, 'bookings');
    const bookingsQuery = query(bookingsCollection, where('stripeId', '==', sessionId));

    console.log('[BOOKING_SERVICE] Executing query for session booking');
    const snapshot = await getDocs(bookingsQuery);

    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];

    console.log('[BOOKING_SERVICE] getBookingBySessionId result:', {
      sessionId,
      bookingsCount: bookings.length,
      booking: bookings[0]
        ? {
            id: bookings[0].id,
            status: bookings[0].status,
            stripeId: bookings[0].stripeId
          }
        : null
    });

    // Return the first (and should be only) booking with this session ID
    return bookings[0] || null;
  } catch (error) {
    console.error('[BOOKING_SERVICE] Error in getBookingBySessionId:', {
      sessionId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};
