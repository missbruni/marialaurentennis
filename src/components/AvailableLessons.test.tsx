import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

import AvailableLessons from './AvailableLessons';
import { Timestamp } from 'firebase/firestore';
import type { Availability } from '@/services/availabilities';
import { render, screen } from '../lib/test-utils';

vi.mock('./Lesson', () => ({
  default: ({
    lesson,
    onLessonSelected
  }: {
    lesson: Availability;
    onLessonSelected: (lesson: Availability) => void;
  }) => (
    <div data-testid={`lesson-${lesson.id}`} onClick={() => onLessonSelected(lesson)}>
      Lesson {lesson.id}
    </div>
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
    // Mock the current date to be 2023-07-15 at 10:30 AM
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-07-15T10:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
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

    // Should only show lessons at or after 11:00
    expect(screen.queryByTestId('lesson-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('lesson-2')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-3')).toBeInTheDocument();
  });

  test('filters lessons based on current time when nextAvailableSlot is today', () => {
    // Current time is mocked to 10:30 AM
    const nextAvailableSlot = new Date('2023-07-15T00:00:00'); // Today
    render(
      <AvailableLessons 
        availableLessons={mockLessons} 
        date={mockDate} 
        nextAvailableSlot={nextAvailableSlot} 
      />
    );

    // Should only show lessons after 10:30 AM
    expect(screen.queryByTestId('lesson-1')).not.toBeInTheDocument(); // 10:00 AM
    expect(screen.getByTestId('lesson-2')).toBeInTheDocument(); // 11:30 AM
    expect(screen.getByTestId('lesson-3')).toBeInTheDocument(); // 1:00 PM
  });

  test('handles lesson selection', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ url: 'https://checkout.url' }),
      ok: true
    });

    const { user } = render(
      <AvailableLessons 
        availableLessons={mockLessons} 
        date={mockDate} 
        nextAvailableSlot={null} 
      />
    );
    await user.click(screen.getByTestId('lesson-1'));

    expect(screen.getByText('Preparing your checkout...')).toBeInTheDocument();

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    vi.restoreAllMocks();
  });
});
