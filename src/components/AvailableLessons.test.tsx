import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@/lib/test-utils';
import AvailableLessons from './AvailableLessons';
import { Timestamp } from 'firebase/firestore';
import type { Availability } from '@/services/availabilities';

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
  const mockLessons = [
    {
      id: '1',
      startDateTime: Timestamp.fromDate(new Date('2023-07-15T10:00:00')),
      endDateTime: Timestamp.fromDate(new Date('2023-07-15T11:00:00')),
      price: 50,
      location: 'sundridge',
      players: 1,
      type: 'private'
    },
    {
      id: '2',
      startDateTime: Timestamp.fromDate(new Date('2023-07-15T11:30:00')),
      endDateTime: Timestamp.fromDate(new Date('2023-07-15T12:30:00')),
      price: 45,
      location: 'sundridge',
      players: 1,
      type: 'group'
    },
    {
      id: '3',
      startDateTime: Timestamp.fromDate(new Date('2023-07-15T13:00:00')),
      endDateTime: Timestamp.fromDate(new Date('2023-07-15T14:00:00')),
      price: 50,
      location: 'sundridge',
      players: 1,
      type: 'private'
    }
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-07-15T10:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('renders available lessons correctly', () => {
    render(<AvailableLessons availableLessons={mockLessons} date={mockDate} nextAvailableSlot={null} />);

    expect(screen.getByTestId('lesson-1')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-2')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-3')).toBeInTheDocument();
  });

  test('filters lessons based on nextAvailableSlot for future dates', () => {
    const nextAvailableSlot = new Date('2023-07-15T11:00:00');
    render(
      <AvailableLessons 
        availableLessons={mockLessons} 
        date={mockDate} 
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
        availableLessons={mockLessons} 
        date={mockDate} 
        nextAvailableSlot={nextAvailableSlot} 
      />
    );

    expect(screen.queryByTestId('lesson-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('lesson-2')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-3')).toBeInTheDocument();
  });
});
