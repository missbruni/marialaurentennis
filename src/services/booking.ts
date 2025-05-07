import { getDocs, Timestamp } from 'firebase/firestore';
import { orderBy, query, where } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import type { Availability } from './availabilities';
import { db } from '../lib/firebase';

export type Booking = {
  id: string;
  startDateTime: Timestamp;
  endDateTime: Timestamp;
  location: string;
  status: string;
  createdAt: Timestamp;
  price?: number;
  type?: string;
};

export const createBooking = async (
  booking: Availability,
  sessionId: string,
  userEmail: string,
  userId: string
) => {
  return fetch('/api/create-booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      booking,
      sessionId,
      userEmail,
      userId
    })
  });
};

export const getUserBookings = async (userId?: string) => {
  if (!userId) throw new Error('User not authenticated');

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
};
