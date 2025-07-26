import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import Lesson from './Lesson';
import type { Availability } from '@/services/availabilities';

// Mock the UI components
vi.mock('./ui/card', () => ({
  Card: ({ children, className, onClick, ...props }: any) => (
    <div data-testid="lesson-card" className={className} onClick={onClick} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div data-testid="lesson-card-content" className={className} {...props}>
      {children}
    </div>
  )
}));

vi.mock('./ui/typography', () => ({
  Typography: {
    P: ({ children, className, ...props }: any) => (
      <p data-testid="typography-p" className={className} {...props}>
        {children}
      </p>
    )
  }
}));

describe('Lesson', () => {
  const mockLesson: Availability = {
    id: 'lesson-1',
    startDateTime: {
      toDate: () => new Date('2023-07-15T10:00:00'),
      toMillis: () => 1689415200000,
      isEqual: () => false,
      toJSON: () => ({ seconds: 1689415200, nanoseconds: 0, type: 'timestamp' }),
      valueOf: () => '1689415200',
      seconds: 1689415200,
      nanoseconds: 0
    },
    endDateTime: {
      toDate: () => new Date('2023-07-15T11:00:00'),
      toMillis: () => 1689418800000,
      isEqual: () => false,
      toJSON: () => ({ seconds: 1689418800, nanoseconds: 0, type: 'timestamp' }),
      valueOf: () => '1689418800',
      seconds: 1689418800,
      nanoseconds: 0
    },
    location: 'sundridge',
    price: 50,
    status: 'available',
    players: 1,
    type: 'private'
  };

  const mockOnLessonSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders lesson card with correct information', () => {
    render(
      <Lesson
        lesson={mockLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={false}
        selectedLessonId={null}
      />
    );

    expect(screen.getByTestId('lesson-card')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-card-content')).toBeInTheDocument();

    const paragraphs = screen.getAllByTestId('typography-p');
    expect(paragraphs[0]).toHaveTextContent('10:00 AM - 11:00 AM');
    expect(paragraphs[1]).toHaveTextContent('£50');
  });

  test('calls onLessonSelected when card is clicked and not loading', async () => {
    const user = userEvent.setup();
    render(
      <Lesson
        lesson={mockLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={false}
        selectedLessonId={null}
      />
    );

    const card = screen.getByTestId('lesson-card');
    await user.click(card);

    expect(mockOnLessonSelected).toHaveBeenCalledWith(mockLesson);
  });

  test('does not call onLessonSelected when loading', async () => {
    const user = userEvent.setup();
    render(
      <Lesson
        lesson={mockLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={true}
        selectedLessonId={null}
      />
    );

    const card = screen.getByTestId('lesson-card');
    await user.click(card);

    expect(mockOnLessonSelected).not.toHaveBeenCalled();
  });

  test('shows loading overlay when selected and loading', () => {
    render(
      <Lesson
        lesson={mockLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={true}
        selectedLessonId="lesson-1"
      />
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.getByTestId('loader')).toHaveTextContent('Loading...');
  });

  test('does not show loading overlay when not selected', () => {
    render(
      <Lesson
        lesson={mockLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={true}
        selectedLessonId={null}
      />
    );

    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });

  test('does not show loading overlay when selected but not loading', () => {
    render(
      <Lesson
        lesson={mockLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={false}
        selectedLessonId="lesson-1"
      />
    );

    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });

  test('applies correct CSS classes to lesson card', () => {
    render(
      <Lesson
        lesson={mockLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={false}
        selectedLessonId={null}
      />
    );

    const card = screen.getByTestId('lesson-card');
    expect(card).toHaveClass(
      'relative',
      'flex',
      'h-full',
      'w-full',
      'min-w-[240px]',
      'basis-0',
      'cursor-pointer',
      'flex-col',
      'bg-white',
      'py-3',
      'shadow-md',
      'transition-transform',
      'hover:translate-y-[-4px]',
      'hover:shadow-lg',
      'md:py-4',
      'dark:bg-[#242423]'
    );
  });

  test('applies correct CSS classes to card content', () => {
    render(
      <Lesson
        lesson={mockLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={false}
        selectedLessonId={null}
      />
    );

    const content = screen.getByTestId('lesson-card-content');
    expect(content).toHaveClass('flex', 'justify-between');
  });

  test('applies correct CSS classes to time paragraph', () => {
    render(
      <Lesson
        lesson={mockLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={false}
        selectedLessonId={null}
      />
    );

    const paragraphs = screen.getAllByTestId('typography-p');
    expect(paragraphs[0]).toHaveClass(
      'text-foreground',
      'dark:text-foreground',
      'whitespace-nowrap'
    );
  });

  test('applies correct CSS classes to price paragraph', () => {
    render(
      <Lesson
        lesson={mockLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={false}
        selectedLessonId={null}
      />
    );

    const paragraphs = screen.getAllByTestId('typography-p');
    expect(paragraphs[1]).toHaveClass('text-tennis-green');
  });

  test('applies correct CSS classes to loader', () => {
    render(
      <Lesson
        lesson={mockLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={true}
        selectedLessonId="lesson-1"
      />
    );

    const loader = screen.getByTestId('loader');
    expect(loader).toHaveClass('text-tennis-green', 'h-6', 'w-6', 'animate-spin');
  });

  test('handles different lesson times correctly', () => {
    const afternoonLesson: Availability = {
      ...mockLesson,
      id: 'lesson-2',
      startDateTime: {
        toDate: () => new Date('2023-07-15T14:00:00'),
        toMillis: () => 1689429600000,
        isEqual: () => false,
        toJSON: () => ({ seconds: 1689429600, nanoseconds: 0, type: 'timestamp' }),
        valueOf: () => '1689429600',
        seconds: 1689429600,
        nanoseconds: 0
      },
      endDateTime: {
        toDate: () => new Date('2023-07-15T15:00:00'),
        toMillis: () => 1689433200000,
        isEqual: () => false,
        toJSON: () => ({ seconds: 1689433200, nanoseconds: 0, type: 'timestamp' }),
        valueOf: () => '1689433200',
        seconds: 1689433200,
        nanoseconds: 0
      }
    };

    render(
      <Lesson
        lesson={afternoonLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={false}
        selectedLessonId={null}
      />
    );

    const paragraphs = screen.getAllByTestId('typography-p');
    expect(paragraphs[0]).toHaveTextContent('2:00 PM - 3:00 PM');
  });

  test('handles different prices correctly', () => {
    const expensiveLesson: Availability = {
      ...mockLesson,
      id: 'lesson-3',
      price: 75
    };

    render(
      <Lesson
        lesson={expensiveLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={false}
        selectedLessonId={null}
      />
    );

    const paragraphs = screen.getAllByTestId('typography-p');
    expect(paragraphs[1]).toHaveTextContent('£75');
  });

  test('handles zero price correctly', () => {
    const freeLesson: Availability = {
      ...mockLesson,
      id: 'lesson-4',
      price: 0
    };

    render(
      <Lesson
        lesson={freeLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={false}
        selectedLessonId={null}
      />
    );

    const paragraphs = screen.getAllByTestId('typography-p');
    expect(paragraphs[1]).toHaveTextContent('£0');
  });

  test('handles decimal prices correctly', () => {
    const decimalLesson: Availability = {
      ...mockLesson,
      id: 'lesson-5',
      price: 49.99
    };

    render(
      <Lesson
        lesson={decimalLesson}
        onLessonSelected={mockOnLessonSelected}
        isLoading={false}
        selectedLessonId={null}
      />
    );

    const paragraphs = screen.getAllByTestId('typography-p');
    expect(paragraphs[1]).toHaveTextContent('£50');
  });
});
