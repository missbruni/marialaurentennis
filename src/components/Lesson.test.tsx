import { describe, expect, vi, beforeEach, test } from 'vitest';

import Lesson from './Lesson';
import { Timestamp } from 'firebase/firestore';
import { render, screen } from '../lib/test-utils';
import type { Availability } from '@/services/availabilities';

describe('Lesson', () => {
  const mockLesson: Availability = {
    id: '123',
    startDateTime: Timestamp.fromDate(new Date('2023-07-15T10:00:00')),
    endDateTime: Timestamp.fromDate(new Date('2023-07-15T11:00:00')),
    price: 40,
    type: 'private',
    players: 1,
    location: 'sundridge'
  };

  const mockOnLessonSelected = vi.fn();

  beforeEach(() => {
    mockOnLessonSelected.mockReset();
  });

  test('renders lesson details correctly', () => {
    render(<Lesson lesson={mockLesson} onLessonSelected={mockOnLessonSelected} />);

    expect(screen.getByText('Sat, July 15')).toBeInTheDocument();
    expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
    expect(screen.getByText('£40')).toBeInTheDocument();
  });

  test('calls onLessonSelected when clicked', async () => {
    const { user } = render(<Lesson lesson={mockLesson} onLessonSelected={mockOnLessonSelected} />);

    const lessonCard = screen.getByText('Sat, July 15').closest('[data-slot="card"]');
    expect(lessonCard).toBeInTheDocument();

    await user.click(lessonCard as Element);
    expect(mockOnLessonSelected).toHaveBeenCalledWith(mockLesson);
  });
});
