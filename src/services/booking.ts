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
  if (!userId) throw new Error('User not authenticated');

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
};
