import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@/lib/test-utils';
import { BookingCard } from './BookingCard';
import type { Booking } from '@/services/booking';
import { TEST_DATES, setupMockDate, resetMockDate, createMockTimestamp } from '@/lib/test-utils';

// Mock the StatusCard component
vi.mock('./StatusCard', () => ({
  StatusCard: ({
    title,
    description,
    actionText,
    statusText,
    statusColor,
    disabled,
    onClick,
    children
  }: any) => (
    <div
      data-testid="status-card"
      data-status={statusText}
      data-color={statusColor}
      data-disabled={disabled}
      onClick={onClick}
    >
      <h3 data-testid="card-title">{title}</h3>
      <p data-testid="card-description">{description}</p>
      {actionText && <button data-testid="card-action">{actionText}</button>}
      <div data-testid="card-content">{children}</div>
    </div>
  )
}));

describe('BookingCard', () => {
  const createMockBooking = (overrides: Partial<Booking> = {}): Booking => ({
    id: 'booking-1',
    startDateTime: createMockTimestamp(new Date('2023-07-15T10:00:00')),
    endDateTime: createMockTimestamp(new Date('2023-07-15T11:00:00')),
    createdAt: createMockTimestamp(new Date('2023-07-10T09:00:00')),
    location: 'sundridge',
    price: 50,
    status: 'confirmed',
    type: 'private',
    refunded: false,
    ...overrides
  });

  beforeEach(() => {
    setupMockDate(TEST_DATES.FIXED_DATE);
  });

  afterEach(() => {
    resetMockDate();
    vi.clearAllMocks();
  });

  test('renders upcoming booking with correct information', () => {
    const futureDate = new Date('2025-12-15T10:00:00');
    const booking = createMockBooking({
      startDateTime: createMockTimestamp(futureDate),
      endDateTime: createMockTimestamp(new Date('2025-12-15T11:00:00'))
    });

    render(<BookingCard booking={booking} />);

    expect(screen.getByTestId('status-card')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toHaveTextContent('Monday, December 15 2025');
    expect(screen.getByTestId('card-description')).toHaveTextContent('Your lesson is confirmed.');
    expect(screen.getByTestId('status-card')).toHaveAttribute('data-status', 'Upcoming');
    expect(screen.getByTestId('status-card')).toHaveAttribute('data-color', 'green');
    expect(screen.getByTestId('status-card')).toHaveAttribute('data-disabled', 'false');
  });

  test('renders past booking with correct status', () => {
    const booking = createMockBooking({
      startDateTime: createMockTimestamp(new Date('2023-01-15T10:00:00')),
      endDateTime: createMockTimestamp(new Date('2023-01-15T11:00:00'))
    });

    render(<BookingCard booking={booking} />);

    expect(screen.getByTestId('card-description')).toHaveTextContent(
      'This lesson has been completed.'
    );
    expect(screen.getByTestId('status-card')).toHaveAttribute('data-status', 'Past');
    expect(screen.getByTestId('status-card')).toHaveAttribute('data-color', 'gray');
    expect(screen.getByTestId('status-card')).toHaveAttribute('data-disabled', 'true');
  });

  test('renders cancelled booking with correct status', () => {
    const booking = createMockBooking({
      status: 'cancelled'
    });

    render(<BookingCard booking={booking} />);

    expect(screen.getByTestId('card-description')).toHaveTextContent(
      'This lesson has been cancelled.'
    );
    expect(screen.getByTestId('status-card')).toHaveAttribute('data-status', 'Cancelled');
    expect(screen.getByTestId('status-card')).toHaveAttribute('data-color', 'red');
    expect(screen.getByTestId('status-card')).toHaveAttribute('data-disabled', 'true');
  });

  test('renders failed booking with correct status', () => {
    const booking = createMockBooking({
      status: 'failed',
      failureReason: 'Payment processing failed'
    });

    render(<BookingCard booking={booking} />);

    expect(screen.getByTestId('card-description')).toHaveTextContent('Payment processing failed');
    expect(screen.getByTestId('status-card')).toHaveAttribute('data-status', 'Failed');
    expect(screen.getByTestId('status-card')).toHaveAttribute('data-color', 'red');
    expect(screen.getByTestId('status-card')).toHaveAttribute('data-disabled', 'true');
  });

  test('renders failed booking with default failure reason', () => {
    const booking = createMockBooking({
      status: 'failed'
    });

    render(<BookingCard booking={booking} />);

    expect(screen.getByTestId('card-description')).toHaveTextContent(
      'This booking could not be completed.'
    );
  });

  test('displays booking details correctly', () => {
    const booking = createMockBooking();

    render(<BookingCard booking={booking} />);

    const content = screen.getByTestId('card-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('10:00 AM - 11:00 AM');
    expect(content).toHaveTextContent('Sundridge');
    expect(content).toHaveTextContent('Private Lesson');
    expect(content).toHaveTextContent('£50');
    expect(content).toHaveTextContent('Jul 10, 2023');
  });

  test('displays refunded status when booking is refunded', () => {
    const booking = createMockBooking({
      refunded: true
    });

    render(<BookingCard booking={booking} />);

    const content = screen.getByTestId('card-content');
    expect(content).toHaveTextContent('Payment Refunded');
  });

  test('handles booking without type', () => {
    const booking = createMockBooking({
      type: undefined
    });

    render(<BookingCard booking={booking} />);

    const content = screen.getByTestId('card-content');
    expect(content).not.toHaveTextContent('Type:');
  });

  test('handles booking without price', () => {
    const booking = createMockBooking({
      price: undefined
    });

    render(<BookingCard booking={booking} />);

    const content = screen.getByTestId('card-content');
    expect(content).not.toHaveTextContent('Price:');
  });

  test('calls onClick handler when card is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const booking = createMockBooking();

    render(<BookingCard booking={booking} />);

    const card = screen.getByTestId('status-card');
    card.click();

    expect(consoleSpy).toHaveBeenCalledWith('View booking details:', 'booking-1');
    consoleSpy.mockRestore();
  });

  test('formats location name correctly', () => {
    const booking = createMockBooking({
      location: 'tennis-court-central'
    });

    render(<BookingCard booking={booking} />);

    const content = screen.getByTestId('card-content');
    expect(content).toHaveTextContent('Tennis-court-central');
  });

  test('formats lesson type correctly', () => {
    const booking = createMockBooking({
      type: 'group'
    });

    render(<BookingCard booking={booking} />);

    const content = screen.getByTestId('card-content');
    expect(content).toHaveTextContent('Group Lesson');
  });
});
