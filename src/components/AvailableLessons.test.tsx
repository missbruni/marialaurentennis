import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@/lib/test-utils';
import AvailableLessons from './AvailableLessons';

import type { Availability } from '@/services/availabilities';

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    use: vi.fn((promise) => {
      if (promise && typeof promise.then === 'function') {
        return [
          {
            id: '1',
            startDateTime: {
              toDate: () => new Date('2023-07-15T10:00:00'),
              seconds: 1689415200,
              nanoseconds: 0
            },
            endDateTime: {
              toDate: () => new Date('2023-07-15T11:00:00'),
              seconds: 1689418800,
              nanoseconds: 0
            },
            price: 50,
            location: 'sundridge',
            players: 1,
            type: 'private'
          },
          {
            id: '2',
            startDateTime: {
              toDate: () => new Date('2023-07-15T11:30:00'),
              seconds: 1689420600,
              nanoseconds: 0
            },
            endDateTime: {
              toDate: () => new Date('2023-07-15T12:30:00'),
              seconds: 1689424200,
              nanoseconds: 0
            },
            price: 45,
            location: 'sundridge',
            players: 1,
            type: 'group'
          },
          {
            id: '3',
            startDateTime: {
              toDate: () => new Date('2023-07-15T13:00:00'),
              seconds: 1689426000,
              nanoseconds: 0
            },
            endDateTime: {
              toDate: () => new Date('2023-07-15T14:00:00'),
              seconds: 1689429600,
              nanoseconds: 0
            },
            price: 50,
            location: 'sundridge',
            players: 1,
            type: 'private'
          }
        ];
      }
      return promise;
    })
  };
});

// Mock Firebase Firestore with all required exports
vi.mock('firebase/firestore', () => {
  const TimestampMock = function (seconds: number, nanoseconds: number) {
    return {
      seconds,
      nanoseconds,
      toDate: () => new Date(seconds * 1000)
    };
  };

  TimestampMock.fromDate = vi.fn((date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000,
    toDate: () => date
  }));

  TimestampMock.now = vi.fn(() => ({
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: (Date.now() % 1000) * 1000000,
    toDate: () => new Date()
  }));

  return {
    doc: vi.fn(),
    getDoc: vi.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({ status: 'available' })
    }),
    updateDoc: vi.fn().mockResolvedValue(undefined),
    deleteField: vi.fn(),
    collection: vi.fn(),
    addDoc: vi.fn().mockResolvedValue({ id: 'mock-booking-id' }),
    Timestamp: TimestampMock,
    writeBatch: vi.fn().mockReturnValue({
      set: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined)
    }),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn().mockResolvedValue({
      docs: []
    }),
    getFirestore: vi.fn(() => ({}))
  };
});

// Mock the actions module to avoid Stripe initialization
vi.mock('@/lib/actions', () => ({
  createCheckoutSessionAction: vi.fn().mockResolvedValue({
    success: true,
    url: 'https://checkout.stripe.com/mock-session'
  })
}));

vi.mock('./Lesson', () => ({
  default: ({
    lesson,
    onLessonSelected,
    isLoading,
    selectedLessonId
  }: {
    lesson: Availability;
    onLessonSelected: (lesson: Availability) => void;
    isLoading: boolean;
    selectedLessonId: string | null;
  }) => (
    <button
      data-testid={`lesson-${lesson.id}`}
      onClick={() => onLessonSelected(lesson)}
      type="button"
      disabled={isLoading}
    >
      {isLoading && selectedLessonId === lesson.id ? 'Loading...' : `Lesson ${lesson.id}`}
    </button>
  )
}));

describe('AvailableLessons', () => {
  const mockDate = '2023-07-15';
  const mockLocation = 'sundridge';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-07-15T10:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('renders available lessons correctly', () => {
    render(
      <AvailableLessons
        selectedDate={mockDate}
        selectedLocation={mockLocation}
        nextAvailableSlot={null}
      />
    );

    expect(screen.getByTestId('lesson-1')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-2')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-3')).toBeInTheDocument();
  });

  test('filters lessons based on nextAvailableSlot for future dates', () => {
    const nextAvailableSlot = new Date('2023-07-15T11:00:00');
    render(
      <AvailableLessons
        selectedDate={mockDate}
        selectedLocation={mockLocation}
        nextAvailableSlot={nextAvailableSlot}
      />
    );

    expect(screen.queryByTestId('lesson-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('lesson-2')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-3')).toBeInTheDocument();
  });

  test('filters lessons based on current time when nextAvailableSlot is today', () => {
    const nextAvailableSlot = new Date('2023-07-15T00:00:00');
    render(
      <AvailableLessons
        selectedDate={mockDate}
        selectedLocation={mockLocation}
        nextAvailableSlot={nextAvailableSlot}
      />
    );

    expect(screen.queryByTestId('lesson-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('lesson-2')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-3')).toBeInTheDocument();
  });
});
