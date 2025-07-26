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
  console.log('🔍 getUserBookings called with userId:', userId);

  if (!userId) {
    const error = new Error('User not authenticated');
    console.error('❌ getUserBookings failed - no userId:', error.message);
    logger.authFailure('getUserBookings', error, {
      action: 'getUserBookings'
    });
    throw error;
  }

  try {
    console.log('🔍 getUserBookings - getting Firestore instance');
    const db = await getFirestore();
    console.log('🔍 getUserBookings - creating query');
    const bookingsCollection = collection(db, 'bookings');
    const bookingsQuery = query(
      bookingsCollection,
      where('userId', '==', userId),
      orderBy('startDateTime', 'desc')
    );

    console.log('🔍 getUserBookings - executing query');
    const snapshot = await getDocs(bookingsQuery);
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];

    console.log('✅ getUserBookings - found', bookings.length, 'bookings');
    return bookings;
  } catch (error) {
    console.error('❌ getUserBookings failed:', error);
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
  console.log('🔍 getBookingBySessionId called with sessionId:', sessionId);

  if (!sessionId) {
    const error = new Error('Session ID is required');
    console.error('❌ getBookingBySessionId failed - no sessionId:', error.message);
    logger.dataFetchFailure('getBookingBySessionId', error, {
      action: 'getBookingBySessionId'
    });
    throw error;
  }

  try {
    console.log('🔍 getBookingBySessionId - getting Firestore instance');
    const db = await getFirestore();
    console.log('🔍 getBookingBySessionId - creating query');
    const bookingsCollection = collection(db, 'bookings');
    const bookingsQuery = query(bookingsCollection, where('stripeId', '==', sessionId));

    console.log('🔍 getBookingBySessionId - executing query');
    const snapshot = await getDocs(bookingsQuery);
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];

    console.log(
      '✅ getBookingBySessionId - found',
      bookings.length,
      'bookings with sessionId:',
      sessionId
    );
    // Return the first (and should be only) booking with this session ID
    return bookings[0] || null;
  } catch (error) {
    console.error('❌ getBookingBySessionId failed:', error);
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
