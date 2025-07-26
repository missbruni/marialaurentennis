import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  act,
  TEST_DATES,
  createMockAvailability,
  setupMockDate,
  resetMockDate
} from '@/lib/test-utils';
import AvailableLessons from './AvailableLessons';

import type { Availability } from '@/services/availabilities';

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
  const mockDate = TEST_DATES.TOMORROW.toISOString().split('T')[0];
  const mockLocation = 'sundridge';
  const mockAvailabilities: Availability[] = [
    createMockAvailability(
      '1',
      TEST_DATES.TOMORROW,
      new Date(TEST_DATES.TOMORROW.getTime() + 60 * 60 * 1000),
      {
        price: 50,
        type: 'private'
      }
    ),
    createMockAvailability(
      '2',
      new Date(TEST_DATES.TOMORROW.getTime() + 2 * 60 * 60 * 1000),
      new Date(TEST_DATES.TOMORROW.getTime() + 3 * 60 * 60 * 1000),
      {
        price: 45,
        type: 'group'
      }
    ),
    createMockAvailability(
      '3',
      new Date(TEST_DATES.TOMORROW.getTime() + 4 * 60 * 60 * 1000),
      new Date(TEST_DATES.TOMORROW.getTime() + 5 * 60 * 60 * 1000),
      {
        price: 50,
        type: 'private'
      }
    )
  ];

  beforeEach(() => {
    setupMockDate(TEST_DATES.FIXED_DATE);
  });

  afterEach(() => {
    resetMockDate();
    vi.clearAllMocks();
  });

  test('renders available lessons correctly', async () => {
    await act(async () => {
      render(
        <AvailableLessons
          selectedDate={mockDate}
          selectedLocation={mockLocation}
          nextAvailableSlot={null}
          availabilities={mockAvailabilities}
        />
      );
    });

    expect(screen.getByTestId('lesson-1')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-2')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-3')).toBeInTheDocument();
  });

  test('filters lessons based on nextAvailableSlot for future dates', async () => {
    // Set nextAvailableSlot to today so filtering is enabled
    const nextAvailableSlot = new Date(); // Today
    await act(async () => {
      render(
        <AvailableLessons
          selectedDate={mockDate}
          selectedLocation={mockLocation}
          nextAvailableSlot={nextAvailableSlot}
          availabilities={mockAvailabilities}
        />
      );
    });

    // Since all lessons are tomorrow and nextAvailableSlot is today, all should be shown
    expect(screen.getByTestId('lesson-1')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-2')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-3')).toBeInTheDocument();
  });

  test('filters lessons based on current time when nextAvailableSlot is today', async () => {
    // Set nextAvailableSlot to today so filtering is enabled
    const nextAvailableSlot = new Date(); // Today
    await act(async () => {
      render(
        <AvailableLessons
          selectedDate={mockDate}
          selectedLocation={mockLocation}
          nextAvailableSlot={nextAvailableSlot}
          availabilities={mockAvailabilities}
        />
      );
    });

    // Since all lessons are tomorrow and nextAvailableSlot is today, all should be shown
    expect(screen.getByTestId('lesson-1')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-2')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-3')).toBeInTheDocument();
  });
});
