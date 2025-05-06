import { describe, expect, vi, test, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from './route';
import type { Availability } from '@/services/availabilities';
import { Timestamp } from 'firebase/firestore';

vi.mock('stripe', () => {
  const createMock = vi.fn().mockResolvedValue({
    url: 'https://checkout.stripe.com/mock-session'
  });

  return {
    default: vi.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: createMock
        }
      }
    }))
  };
});

vi.mock('@/lib/date', () => ({
  formatTime: vi.fn().mockReturnValue('10:00 AM')
}));

vi.mock('@/lib/string', () => ({
  capitalizeWords: vi.fn((text) => text)
}));

vi.mock('date-fns', () => ({
  format: vi.fn().mockReturnValue('Monday, January 1 2024')
}));

vi.mock('firebase/firestore', () => {
  const TimestampMock = function (seconds: number, nanoseconds: number) {
    return { seconds, nanoseconds, toDate: () => new Date() };
  };

  TimestampMock.fromDate = vi.fn((date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000
  }));

  return {
    getFirestore: vi.fn(() => ({})),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    Timestamp: TimestampMock
  };
});

import Stripe from 'stripe';

describe('POST /api/create-checkout-session', () => {
  let mockRequest: NextRequest;
  let stripeInstance: any;
  let createSessionMock: any;

  const mockLesson: Availability = {
    id: 'lesson-123',
    startDateTime: { seconds: 1234567890, nanoseconds: 123456789 } as Timestamp,
    endDateTime: { seconds: 1234571490, nanoseconds: 123456789 } as Timestamp,
    price: 50,
    location: 'sundridge',
    players: 1,
    type: 'private'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    stripeInstance = new Stripe('fake-key', { apiVersion: '2025-03-31.basil' });
    createSessionMock = stripeInstance.checkout.sessions.create;

    createSessionMock.mockResolvedValue({
      url: 'https://checkout.stripe.com/mock-session'
    });

    mockRequest = {
      json: vi.fn().mockResolvedValue({ lesson: mockLesson }),
      nextUrl: { origin: 'https://tennis-booking.example.com' }
    } as unknown as NextRequest;
  });

  test('should create a checkout session successfully', async () => {
    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(200);
    expect(responseData).toEqual({ url: 'https://checkout.stripe.com/mock-session' });
    expect(mockRequest.json).toHaveBeenCalledTimes(1);
  });

  test('should handle errors gracefully', async () => {
    createSessionMock.mockRejectedValueOnce(new Error('Stripe API error'));

    const response = await POST(mockRequest);
    const responseData = await response.json();

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(500);
    expect(responseData).toEqual({ error: 'Failed to create checkout session' });
  });

  test('should encode lesson data correctly in success URL', async () => {
    createSessionMock.mockClear();

    await POST(mockRequest);

    expect(createSessionMock).toHaveBeenCalled();
    const createSessionArgs = createSessionMock.mock.calls[0][0];
    expect(createSessionArgs.success_url).toContain('lesson=');
    expect(createSessionArgs.success_url).toContain('sessionId={CHECKOUT_SESSION_ID}');
  });

  test('should set correct metadata in Stripe session', async () => {
    createSessionMock.mockClear();

    await POST(mockRequest);

    expect(createSessionMock).toHaveBeenCalled();
    const createSessionArgs = createSessionMock.mock.calls[0][0];

    expect(createSessionArgs.metadata).toHaveProperty('lesson_id', 'lesson-123');
    expect(createSessionArgs.metadata).toHaveProperty('location', 'sundridge');
    expect(createSessionArgs.metadata).toHaveProperty('source', 'mlt-tennis-app');
    expect(createSessionArgs.line_items[0].price_data.unit_amount).toBe(5000);
    expect(createSessionArgs.line_items[0].price_data.currency).toBe('gbp');
  });
});
