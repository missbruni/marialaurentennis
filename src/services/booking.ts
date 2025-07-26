import { getDocs, Timestamp, orderBy, query, where, collection } from 'firebase/firestore';
import { getFirestore } from '../lib/firebase';
import { logger } from '../lib/logger';

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
  if (!userId) {
    const error = new Error('User not authenticated');
    logger.authFailure('getUserBookings', error, {
      action: 'getUserBookings'
    });
    throw error;
  }

  try {
    const db = await getFirestore();
    const bookingsCollection = collection(db, 'bookings');
    const bookingsQuery = query(
      bookingsCollection,
      where('userId', '==', userId),
      orderBy('startDateTime', 'desc')
    );

    const snapshot = await getDocs(bookingsQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
  } catch (error) {
    logger.dataFetchFailure(
      'getUserBookings',
      error instanceof Error ? error : new Error('Unknown error'),
      {
        action: 'getUserBookings',
        userId
      }
    );
    throw error;
  }
};

export const getBookingBySessionId = async (sessionId: string) => {
  if (!sessionId) {
    const error = new Error('Session ID is required');
    logger.dataFetchFailure('getBookingBySessionId', error, {
      action: 'getBookingBySessionId'
    });
    throw error;
  }

  try {
    const db = await getFirestore();
    const bookingsCollection = collection(db, 'bookings');
    const bookingsQuery = query(bookingsCollection, where('stripeId', '==', sessionId));

    const snapshot = await getDocs(bookingsQuery);
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];

    // Return the first (and should be only) booking with this session ID
    return bookings[0] || null;
  } catch (error) {
    logger.dataFetchFailure(
      'getBookingBySessionId',
      error instanceof Error ? error : new Error('Unknown error'),
      {
        action: 'getBookingBySessionId',
        sessionId
      }
    );
    throw error;
  }
};
