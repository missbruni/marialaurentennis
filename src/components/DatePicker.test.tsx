import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderWithAuth, screen } from '@/lib/test-utils';
import DatePicker from './DatePicker';
import type { FieldValues } from 'react-hook-form';
import { format, addDays } from 'date-fns';
import { FormProvider, useForm } from 'react-hook-form';
import userEvent from '@testing-library/user-event';

const DatePickerWithFormContext = (props: React.ComponentProps<typeof DatePicker>) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <DatePicker {...props} />
    </FormProvider>
  );
};

describe('DatePicker', () => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);

  const mockField: FieldValues = {
    value: tomorrow,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    name: 'testDate'
  };

  const mockAvailableDates = [tomorrow, nextWeek, addDays(today, 14)];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders calendar with correct initial month', async () => {
    await renderWithAuth(
      <DatePickerWithFormContext
        field={mockField}
        disabled={false}
        availableDates={mockAvailableDates}
        nextAvailableDate={tomorrow}
      />
    );

    expect(screen.getByText(format(today, 'MMMM yyyy'))).toBeInTheDocument();
  });

  test('displays next available date button', async () => {
    await renderWithAuth(
      <DatePickerWithFormContext
        field={mockField}
        disabled={false}
        availableDates={mockAvailableDates}
        nextAvailableDate={tomorrow}
      />
    );

    expect(screen.getByText('Next available date')).toBeInTheDocument();
  });

  test('disables next available date button when no dates are available', async () => {
    await renderWithAuth(
      <DatePickerWithFormContext
        field={mockField}
        disabled={false}
        availableDates={[]}
        nextAvailableDate={null}
      />
    );

    const button = screen.getByText('No future dates available');
    expect(button).toBeDisabled();
  });

  test('calls onNextAvailableSlot when next available date button is clicked', async () => {
    const onNextAvailableSlot = vi.fn();
    const user = userEvent.setup();

    await renderWithAuth(
      <DatePickerWithFormContext
        field={mockField}
        disabled={false}
        availableDates={mockAvailableDates}
        nextAvailableDate={tomorrow}
        onNextAvailableSlot={onNextAvailableSlot}
      />
    );

    const button = screen.getByText('Next available date');
    await user.click(button);

    expect(onNextAvailableSlot).toHaveBeenCalledWith(tomorrow);
    expect(mockField.onChange).toHaveBeenCalledWith(tomorrow);
  });

  test('marks available dates with correct styling', async () => {
    await renderWithAuth(
      <DatePickerWithFormContext
        field={mockField}
        disabled={false}
        availableDates={mockAvailableDates}
        nextAvailableDate={tomorrow}
      />
    );

    const availableDate = screen.getByText(format(tomorrow, 'd'));
    expect(availableDate).toHaveClass('text-tennis-green');
  });

  test('calls field.onChange when a date is selected', async () => {
    const user = userEvent.setup();
    await renderWithAuth(
      <DatePickerWithFormContext
        field={mockField}
        disabled={false}
        availableDates={mockAvailableDates}
        nextAvailableDate={tomorrow}
      />
    );

    const availableDate = screen.getByText(format(tomorrow, 'd'));
    await user.click(availableDate);

    expect(mockField.onChange).toHaveBeenCalled();
  });

  test('updates current month when navigating', async () => {
    const user = userEvent.setup();
    await renderWithAuth(
      <DatePickerWithFormContext
        field={mockField}
        disabled={false}
        availableDates={mockAvailableDates}
        nextAvailableDate={tomorrow}
      />
    );

    const nextMonthButton = screen.getByLabelText('Go to next month');
    await user.click(nextMonthButton);

    const nextMonth = addDays(today, 30);
    expect(screen.getByText(format(nextMonth, 'MMMM yyyy'))).toBeInTheDocument();
  });
});
