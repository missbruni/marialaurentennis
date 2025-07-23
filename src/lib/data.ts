import { Availability, getAvailability } from '@/services/availabilities';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { getFirestore } from '@/lib/firebase';
import type { Booking } from '@/services/booking';

let availabilitiesCache: Availability[] | null = null;
let availabilitiesCacheTime = 0;
const CACHE_DURATION_5_MINUTES = 5 * 60 * 1000;
const bookingsCache: Record<string, { data: Booking[]; time: number }> = {};

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

export async function getBookingsData(userId?: string): Promise<Booking[]> {
  const now = Date.now();
  const cacheKey = userId || 'all';

  if (bookingsCache[cacheKey] && now - bookingsCache[cacheKey].time < CACHE_DURATION_5_MINUTES) {
    return bookingsCache[cacheKey].data;
  }

  try {
    const db = await getFirestore();
    const bookingsCollection = collection(db, 'bookings');

    let bookingsQuery;

    if (userId) {
      bookingsQuery = query(bookingsCollection, where('userId', '==', userId));
    } else {
      bookingsQuery = query(bookingsCollection);
    }

    const querySnapshot = await getDocs(bookingsQuery);
    const bookings = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];

    bookings.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });

    bookingsCache[cacheKey] = {
      data: bookings,
      time: now
    };

    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
}

export function clearAvailabilitiesCache() {
  availabilitiesCache = null;
  availabilitiesCacheTime = 0;
}

export function clearBookingsCache(userId?: string) {
  if (userId) {
    delete bookingsCache[userId];
  } else {
    Object.keys(bookingsCache).forEach((key) => {
      delete bookingsCache[key];
    });
  }
}
