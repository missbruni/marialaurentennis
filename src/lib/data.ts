import { getAvailability } from '@/services/availabilities';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { getFirestore } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Booking } from '@/services/booking';

const CACHE_DURATION_5_MINUTES = 5 * 60 * 1000;
const bookingsCache: Record<string, { data: Booking[]; time: number }> = {};

export async function getAvailabilitiesData() {
  try {
    const data = await getAvailability();
    return data;
  } catch (error) {
    logger.dataFetchFailure(
      'getAvailabilitiesData',
      error instanceof Error ? error : new Error('Unknown error'),
      {
        action: 'getAvailabilitiesData'
      }
    );
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
      const aTime = a.startDateTime?.toDate?.() || new Date(0);
      const bTime = b.startDateTime?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });

    bookingsCache[cacheKey] = {
      data: bookings,
      time: now
    };

    return bookings;
  } catch (error) {
    logger.dataFetchFailure(
      'getBookingsData',
      error instanceof Error ? error : new Error('Unknown error'),
      {
        action: 'getBookingsData',
        userId
      },
      {
        cacheKey,
        cacheHit: !!bookingsCache[cacheKey]
      }
    );
    throw error;
  }
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
