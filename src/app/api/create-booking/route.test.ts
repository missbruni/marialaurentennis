import { describe, expect, vi, test, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import * as firestore from 'firebase/firestore';
import { POST } from './route';

vi.mock('firebase/firestore', () => {
  const TimestampMock = function (seconds: number, nanoseconds: number) {
    return { seconds, nanoseconds };
  };
  TimestampMock.fromDate = vi.fn((date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000
  }));
  TimestampMock.now = vi.fn(() => ({
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: (Date.now() % 1000) * 1000000
  }));

  return {
    ...vi.importActual('firebase/firestore'),
    collection: vi.fn(),
    addDoc: vi.fn().mockResolvedValue({ id: 'mock-booking-id' }),
    deleteDoc: vi.fn().mockResolvedValue(undefined),
    doc: vi.fn().mockReturnValue({
      /* mock document reference */
    }),
    Timestamp: TimestampMock
  };
});

vi.mock('@/lib/firebase', () => ({
  db: {}
}));

describe('POST /api/create-booking', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      json: vi.fn().mockResolvedValue({
        booking: {
          id: 'mock-availability-id',
          startDateTime: { seconds: 1234567890, nanoseconds: 123456789 },
          endDateTime: { seconds: 1234571490, nanoseconds: 123456789 },
          location: 'sundridge'
        },
        userEmail: 'test@example.com',
        sessionId: 'mock-stripe-session-id',
        userId: 'mock-user-id'
      })
    } as unknown as NextRequest;
  });

  test('should create a booking and delete the availability', async () => {
    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(200);
    expect(responseData).toEqual({ booking: { id: 'mock-booking-id' } });

    // Verify that deleteDoc was called with the correct document reference
    expect(firestore.doc).toHaveBeenCalledWith(
      expect.anything(),
      'availabilities',
      'mock-availability-id'
    );
    expect(firestore.deleteDoc).toHaveBeenCalled();
  });

  test('should handle errors gracefully', async () => {
    const mockCollectionRef = {};
    vi.mocked(firestore.collection).mockReturnValue(mockCollectionRef as unknown as any);
    vi.mocked(firestore.addDoc).mockRejectedValueOnce(new Error('Database error'));

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: 'Failed to create booking' });
  });
});
