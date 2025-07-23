import { getAvailability } from '@/services/availabilities';
import { getDocs, Timestamp, orderBy, query, where, collection } from 'firebase/firestore';
import { getFirestore } from '@/lib/firebase';

let availabilitiesCache: any = null;
let availabilitiesCacheTime = 0;
const CACHE_DURATION_5_MINUTES = 5 * 60 * 1000;

let bookingsCache: any = null;
let bookingsCacheTime = 0;

export async function getAvailabilitiesData() {
  const now = Date.now();

  if (availabilitiesCache && now - availabilitiesCacheTime < CACHE_DURATION_5_MINUTES) {
    return availabilitiesCache;
  }

  try {
    const data = await getAvailability();
    availabilitiesCache = data;
    availabilitiesCacheTime = now;
    return data;
  } catch (error) {
    console.error('Error fetching availabilities:', error);
    throw error;
  }
}

export async function getBookingsData(userId?: string) {
  const now = Date.now();

  if (bookingsCache && now - bookingsCacheTime < CACHE_DURATION_5_MINUTES) {
    return bookingsCache;
  }

  try {
    const db = await getFirestore();
    const bookingsCollection = collection(db, 'bookings');

    let bookingsQuery = query(bookingsCollection, orderBy('createdAt', 'desc'));

    if (userId) {
      bookingsQuery = query(
        bookingsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(bookingsQuery);
    const bookings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    bookingsCache = bookings;
    bookingsCacheTime = now;
    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
}

export async function* streamAvailabilitiesData() {
  try {
    yield { status: 'loading', data: null };

    const data = await getAvailabilitiesData();

    yield { status: 'success', data };
  } catch (error) {
    yield { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function* streamBookingsData(userId?: string) {
  try {
    yield { status: 'loading', data: null };

    const data = await getBookingsData(userId);

    yield { status: 'success', data };
  } catch (error) {
    yield { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function prefetchAvailabilities() {
  return getAvailabilitiesData();
}

export async function prefetchBookings(userId?: string) {
  return getBookingsData(userId);
}

export function clearAvailabilitiesCache() {
  availabilitiesCache = null;
  availabilitiesCacheTime = 0;
}

export function clearBookingsCache() {
  bookingsCache = null;
  bookingsCacheTime = 0;
}
