import { describe, test, expect, vi } from 'vitest';

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
    }
  ];

  test('renders available lessons correctly', () => {
    render(<AvailableLessons availableLessons={mockLessons} date={mockDate} />);

    expect(screen.getByTestId('lesson-1')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-2')).toBeInTheDocument();
  });

  test('handles lesson selection', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ url: 'https://checkout.url' }),
      ok: true
    });

    const { user } = render(<AvailableLessons availableLessons={mockLessons} date={mockDate} />);
    await user.click(screen.getByTestId('lesson-1'));

    expect(screen.getByText('Preparing your checkout...')).toBeInTheDocument();

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    vi.restoreAllMocks();
  });
});
