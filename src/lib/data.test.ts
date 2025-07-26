import { describe, expect, test, vi, beforeEach } from 'vitest';
import { getAvailabilitiesData, getBookingsData, clearBookingsCache } from './data';

// Mock the services
vi.mock('@/services/availabilities', () => ({
  getAvailability: vi.fn().mockImplementation(() =>
    Promise.resolve([
      { id: 'avail-1', status: 'available' },
      { id: 'avail-2', status: 'available' }
    ])
  )
}));

vi.mock('@/lib/firebase', () => ({
  getFirestore: vi.fn().mockResolvedValue({})
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn().mockImplementation(() =>
    Promise.resolve({
      docs: [
        {
          id: 'booking-1',
          data: () => ({
            startDateTime: { toDate: () => new Date('2025-01-01T10:00:00Z') },
            endDateTime: { toDate: () => new Date('2025-01-01T11:00:00Z') },
            location: 'sundridge',
            status: 'confirmed',
            createdAt: { toDate: () => new Date('2025-01-01T09:00:00Z') },
            userId: 'user-123'
          })
        },
        {
          id: 'booking-2',
          data: () => ({
            startDateTime: { toDate: () => new Date('2025-01-02T10:00:00Z') },
            endDateTime: { toDate: () => new Date('2025-01-02T11:00:00Z') },
            location: 'muswell',
            status: 'confirmed',
            createdAt: { toDate: () => new Date('2025-01-02T09:00:00Z') },
            userId: 'user-123'
          })
        }
      ]
    })
  )
}));

describe('Data Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailabilitiesData', () => {
    test('should fetch availabilities', async () => {
      const result1 = await getAvailabilitiesData();
      const result2 = await getAvailabilitiesData();

      expect(result1).toHaveLength(2);
      expect(result2).toHaveLength(2);
      expect(result1).toStrictEqual(result2); // Should return same data
    });

    test('should return fresh data on each call (no caching)', async () => {
      const result1 = await getAvailabilitiesData();
      const result2 = await getAvailabilitiesData();

      expect(result1).toHaveLength(2);
      expect(result2).toHaveLength(2);
      expect(result1).toStrictEqual(result2); // Should return same data (no caching implemented)
    });
  });

  describe('getBookingsData', () => {
    test('should fetch user-specific bookings and cache them', async () => {
      const userId = 'user-123';
      const result1 = await getBookingsData(userId);
      const result2 = await getBookingsData(userId);

      expect(result1).toHaveLength(2);
      expect(result2).toHaveLength(2);
      expect(result1).toBe(result2); // Should return cached data
    });

    test('should cache different users separately', async () => {
      const user1 = 'user-123';
      const user2 = 'user-456';

      const result1 = await getBookingsData(user1);
      const result2 = await getBookingsData(user2);

      expect(result1).toHaveLength(2);
      expect(result2).toHaveLength(2);
      expect(result1).not.toBe(result2); // Should be different cache entries
    });

    test('should clear specific user cache when clearBookingsCache is called with userId', async () => {
      const userId = 'user-123';
      const result1 = await getBookingsData(userId);

      clearBookingsCache(userId);
      const result2 = await getBookingsData(userId);

      expect(result1).toHaveLength(2);
      expect(result2).toHaveLength(2);
      expect(result1).not.toBe(result2); // Should return fresh data after cache clear
    });

    test('should clear all bookings cache when clearBookingsCache is called without userId', async () => {
      const user1 = 'user-123';
      const user2 = 'user-456';

      const result1a = await getBookingsData(user1);
      const result2a = await getBookingsData(user2);

      clearBookingsCache(); // Clear all cache

      const result1b = await getBookingsData(user1);
      const result2b = await getBookingsData(user2);

      expect(result1a).not.toBe(result1b); // Should return fresh data
      expect(result2a).not.toBe(result2b); // Should return fresh data
    });

    test('should handle admin view (no userId)', async () => {
      const result1 = await getBookingsData(); // Admin view
      const result2 = await getBookingsData(); // Admin view

      expect(result1).toHaveLength(2);
      expect(result2).toHaveLength(2);
      expect(result1).toBe(result2); // Should return cached data
    });
  });

  describe('Cache Clearing Functions', () => {
    test('availabilities data should not be cached', async () => {
      const result1 = await getAvailabilitiesData();
      const result2 = await getAvailabilitiesData();

      expect(result1).toStrictEqual(result2); // Should return same data (no caching implemented)
    });

    test('clearBookingsCache with userId should clear only that user cache', async () => {
      const user1 = 'user-123';
      const user2 = 'user-456';

      const result1a = await getBookingsData(user1);
      const result2a = await getBookingsData(user2);

      clearBookingsCache(user1); // Clear only user1 cache

      const result1b = await getBookingsData(user1);
      const result2b = await getBookingsData(user2);

      expect(result1a).not.toBe(result1b); // user1 cache should be cleared
      expect(result2a).toBe(result2b); // user2 cache should remain
    });

    test('clearBookingsCache without userId should clear all bookings cache', async () => {
      const user1 = 'user-123';
      const user2 = 'user-456';

      const result1a = await getBookingsData(user1);
      const result2a = await getBookingsData(user2);

      clearBookingsCache(); // Clear all cache

      const result1b = await getBookingsData(user1);
      const result2b = await getBookingsData(user2);

      expect(result1a).not.toBe(result1b); // user1 cache should be cleared
      expect(result2a).not.toBe(result2b); // user2 cache should be cleared
    });
  });
});
