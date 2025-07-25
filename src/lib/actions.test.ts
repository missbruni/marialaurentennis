import { describe, expect, test, vi, beforeEach } from 'vitest';
import {
  createAvailabilityAction,
  createCheckoutSessionAction,
  createBookingAction
} from './actions';

vi.mock('./data', () => ({
  clearAvailabilitiesCache: vi.fn(),
  clearBookingsCache: vi.fn()
}));

vi.mock('@/lib/firebase', () => ({
  getFirestore: vi.fn().mockResolvedValue({})
}));

vi.mock('@/lib/firebase-admin', () => ({
  getAdminAuth: vi.fn(() => ({
    verifyIdToken: vi.fn().mockResolvedValue({
      uid: 'admin-uid',
      role: 'admin'
    })
  })),
  getAdminFirestore: vi.fn(() => ({
    batch: vi.fn(() => ({
      set: vi.fn(),
      commit: vi.fn()
    })),
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        id: 'mock-doc-id',
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({ status: 'available' })
        }),
        update: vi.fn().mockResolvedValue(undefined)
      })),
      add: vi.fn(() => Promise.resolve({ id: 'mock-doc-id' }))
    }))
  })),
  verifySessionCookie: vi.fn().mockResolvedValue({
    uid: 'admin-uid',
    role: 'admin'
  })
}));

vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            url: 'https://checkout.stripe.com/mock-session',
            id: 'cs_test_mock_session_id'
          })
        }
      }
    }))
  };
});

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');

  const TimestampConstructor = function (seconds: number, nanoseconds: number) {
    return {
      seconds,
      nanoseconds,
      toDate: () => new Date(seconds * 1000)
    };
  };

  TimestampConstructor.fromDate = vi.fn((date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000,
    toDate: () => date
  }));

  TimestampConstructor.now = vi.fn(() => ({
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: (Date.now() % 1000) * 1000000,
    toDate: () => new Date()
  }));

  return {
    ...actual,
    doc: vi.fn(),
    getDoc: vi.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({ status: 'available' })
    }),
    updateDoc: vi.fn().mockResolvedValue(undefined),
    deleteField: vi.fn(),
    collection: vi.fn(),
    addDoc: vi.fn().mockResolvedValue({ id: 'mock-availability-id' }),
    Timestamp: TimestampConstructor,
    writeBatch: vi.fn().mockReturnValue({
      set: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined)
    })
  };
});

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn((name: string) => {
        if (name === 'mlt_session') {
          return { value: 'mock-session-cookie' };
        }
        return undefined;
      })
    })
  )
}));

describe('Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAvailabilityAction', () => {
    test('should create availability successfully', async () => {
      const formData = new FormData();
      formData.append('type', 'private');
      formData.append('availabilityDate', '2025-12-25T00:00:00.000Z'); // Future date
      formData.append('availabilityStartTime', '10:00');
      formData.append('availabilityEndTime', '11:00');
      formData.append('players', '1');
      formData.append('location', 'sundridge');
      formData.append('price', '40');
      formData.append('createHourlySlots', 'off');

      const result = await createAvailabilityAction(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.count).toBe(1);
      }
    });

    test('should clear availabilities cache when creating single availability', async () => {
      const { clearAvailabilitiesCache } = await import('./data');

      const formData = new FormData();
      formData.append('type', 'private');
      formData.append('availabilityDate', '2025-12-25T00:00:00.000Z');
      formData.append('availabilityStartTime', '10:00');
      formData.append('availabilityEndTime', '11:00');
      formData.append('players', '1');
      formData.append('location', 'sundridge');
      formData.append('price', '40');
      formData.append('createHourlySlots', 'off');

      await createAvailabilityAction(formData);

      expect(clearAvailabilitiesCache).toHaveBeenCalledTimes(1);
    });

    test('should clear availabilities cache when creating hourly slots', async () => {
      const { clearAvailabilitiesCache } = await import('./data');

      const formData = new FormData();
      formData.append('type', 'private');
      formData.append('availabilityDate', '2025-12-25T00:00:00.000Z');
      formData.append('availabilityStartTime', '10:00');
      formData.append('availabilityEndTime', '12:00');
      formData.append('players', '1');
      formData.append('location', 'sundridge');
      formData.append('price', '40');
      formData.append('createHourlySlots', 'on');

      await createAvailabilityAction(formData);

      expect(clearAvailabilitiesCache).toHaveBeenCalledTimes(1);
    });

    test('should handle authentication errors', async () => {
      // Mock cookies to return no session
      const { cookies } = await import('next/headers');
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn(() => undefined)
      } as any);

      const formData = new FormData();
      formData.append('type', 'private');
      formData.append('availabilityDate', '2025-12-25T00:00:00.000Z');
      formData.append('availabilityStartTime', '10:00');
      formData.append('availabilityEndTime', '11:00');
      formData.append('players', '1');
      formData.append('location', 'sundridge');
      formData.append('price', '40');
      formData.append('createHourlySlots', 'off');

      const result = await createAvailabilityAction(formData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized: Admin access required');
    });

    test('should create hourly slots when requested', async () => {
      const formData = new FormData();
      formData.append('type', 'private');
      formData.append('availabilityDate', '2025-12-25T00:00:00.000Z'); // Future date
      formData.append('availabilityStartTime', '10:00');
      formData.append('availabilityEndTime', '12:00');
      formData.append('players', '1');
      formData.append('location', 'sundridge');
      formData.append('price', '40');
      formData.append('createHourlySlots', 'on');

      const result = await createAvailabilityAction(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.count).toBe(2); // 2 hours
      }
    });
  });

  describe('createCheckoutSessionAction', () => {
    test('should create checkout session successfully', async () => {
      const mockLesson = {
        id: 'lesson-123',
        startDateTime: { seconds: 1234567890, nanoseconds: 123456789 },
        endDateTime: { seconds: 1234571490, nanoseconds: 123456789 },
        price: 50,
        location: 'sundridge',
        players: 1,
        type: 'private'
      };

      const formData = new FormData();
      formData.append('lesson', JSON.stringify(mockLesson));
      formData.append('userId', 'user-123');
      formData.append('userEmail', 'test@example.com');

      const result = await createCheckoutSessionAction(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.url).toBe('https://checkout.stripe.com/mock-session');
      }
    });

    test('should clear availabilities cache when creating checkout session', async () => {
      const { clearAvailabilitiesCache } = await import('./data');

      const mockLesson = {
        id: 'lesson-123',
        startDateTime: { seconds: 1234567890, nanoseconds: 123456789 },
        endDateTime: { seconds: 1234571490, nanoseconds: 123456789 },
        price: 50,
        location: 'sundridge',
        players: 1,
        type: 'private'
      };

      const formData = new FormData();
      formData.append('lesson', JSON.stringify(mockLesson));
      formData.append('userId', 'user-123');
      formData.append('userEmail', 'test@example.com');

      await createCheckoutSessionAction(formData);

      expect(clearAvailabilitiesCache).toHaveBeenCalledTimes(1);
    });

    test('should handle authentication errors', async () => {
      // Mock cookies to return no session
      const { cookies } = await import('next/headers');
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn(() => undefined)
      } as any);

      const mockLesson = {
        id: 'lesson-123',
        startDateTime: { seconds: 1234567890, nanoseconds: 123456789 },
        endDateTime: { seconds: 1234571490, nanoseconds: 123456789 },
        price: 50,
        location: 'sundridge',
        players: 1,
        type: 'private'
      };

      const formData = new FormData();
      formData.append('lesson', JSON.stringify(mockLesson));
      formData.append('userId', 'user-123');
      formData.append('userEmail', 'test@example.com');

      const result = await createCheckoutSessionAction(formData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
    });
  });

  describe('createBookingAction', () => {
    test('should create booking successfully', async () => {
      const mockBooking = {
        id: 'availability-123',
        startDateTime: { seconds: 1234567890, nanoseconds: 123456789 },
        endDateTime: { seconds: 1234571490, nanoseconds: 123456789 },
        location: 'sundridge'
      };

      const formData = new FormData();
      formData.append('booking', JSON.stringify(mockBooking));
      formData.append('userEmail', 'test@example.com');
      formData.append('sessionId', 'cs_test_session_123');
      formData.append('userId', 'user-123');

      const result = await createBookingAction(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.booking?.id).toBe('mock-doc-id');
      }
    });

    test('should clear user-specific bookings cache when creating booking', async () => {
      const { clearBookingsCache, clearAvailabilitiesCache } = await import('./data');

      const mockBooking = {
        id: 'availability-123',
        startDateTime: { seconds: 1234567890, nanoseconds: 123456789 },
        endDateTime: { seconds: 1234571490, nanoseconds: 123456789 },
        location: 'sundridge'
      };

      const formData = new FormData();
      formData.append('booking', JSON.stringify(mockBooking));
      formData.append('userEmail', 'test@example.com');
      formData.append('sessionId', 'cs_test_session_123');
      formData.append('userId', 'user-123');

      await createBookingAction(formData);

      expect(clearBookingsCache).toHaveBeenCalledWith('user-123');
      expect(clearAvailabilitiesCache).toHaveBeenCalledTimes(1);
    });

    test('should clear both caches when booking has availability ID', async () => {
      const { clearBookingsCache, clearAvailabilitiesCache } = await import('./data');

      const mockBooking = {
        id: 'availability-123',
        startDateTime: { seconds: 1234567890, nanoseconds: 123456789 },
        endDateTime: { seconds: 1234571490, nanoseconds: 123456789 },
        location: 'sundridge'
      };

      const formData = new FormData();
      formData.append('booking', JSON.stringify(mockBooking));
      formData.append('userEmail', 'test@example.com');
      formData.append('sessionId', 'cs_test_session_123');
      formData.append('userId', 'user-123');

      await createBookingAction(formData);

      expect(clearBookingsCache).toHaveBeenCalledWith('user-123');
      expect(clearAvailabilitiesCache).toHaveBeenCalledTimes(1);
    });

    test('should handle booking creation without availability ID', async () => {
      const { clearBookingsCache, clearAvailabilitiesCache } = await import('./data');

      const mockBooking = {
        startDateTime: { seconds: 1234567890, nanoseconds: 123456789 },
        endDateTime: { seconds: 1234571490, nanoseconds: 123456789 },
        location: 'sundridge'
      };

      const formData = new FormData();
      formData.append('booking', JSON.stringify(mockBooking));
      formData.append('userEmail', 'test@example.com');
      formData.append('sessionId', 'cs_test_session_123');
      formData.append('userId', 'user-123');

      const result = await createBookingAction(formData);

      expect(result.success).toBe(true);
      expect(clearBookingsCache).toHaveBeenCalledWith('user-123');
      expect(clearAvailabilitiesCache).toHaveBeenCalledTimes(1);
    });
  });
});
