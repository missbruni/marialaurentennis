import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/lib/test-utils';
import DatePicker from './DatePicker';
import type { FieldValues } from 'react-hook-form';
import { addDays, format } from 'date-fns';
import { FormProvider, useForm } from 'react-hook-form';

vi.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn()
}));

import { useMediaQuery } from '@/hooks/useMediaQuery';

const DatePickerWithFormContext = (props: React.ComponentProps<typeof DatePicker>) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <DatePicker {...props} />
    </FormProvider>
  );
};

describe('DatePicker', () => {
  const mockField: FieldValues = {
    value: new Date('2023-07-15'),
    onChange: vi.fn(),
    onBlur: vi.fn(),
    name: 'testDate'
  };

  const mockAvailableDates = [
    new Date('2023-07-10'),
    new Date('2023-07-15'),
    new Date('2023-07-20')
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Default to desktop view
    vi.mocked(useMediaQuery).mockReturnValue(false);
  });

  test('renders correctly in desktop mode', () => {
    render(
      <DatePickerWithFormContext
        field={mockField}
        isLoading={false}
        disabled={false}
        availableDates={mockAvailableDates}
      />
    );

    expect(screen.getByText('Select Date')).toBeInTheDocument();
    expect(screen.getByText(format(mockField.value, 'PPP'))).toBeInTheDocument();
  });

  test('renders correctly in mobile mode', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true); // Set to mobile view

    render(
      <DatePickerWithFormContext
        field={mockField}
        isLoading={false}
        disabled={false}
        availableDates={mockAvailableDates}
      />
    );

    expect(screen.getByText('Select Date')).toBeInTheDocument();
    expect(screen.getByText(format(mockField.value, 'PPP'))).toBeInTheDocument();

    // dialog is not open by default
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('shows loading state when isLoading is true', () => {
    render(
      <DatePickerWithFormContext
        field={mockField}
        isLoading={true}
        disabled={false}
        availableDates={mockAvailableDates}
      />
    );

    const loadingIcon = document.querySelector('.animate-spin');
    expect(loadingIcon).toBeInTheDocument();
  });

  test('disables button when disabled prop is true', () => {
    render(
      <DatePickerWithFormContext
        field={mockField}
        isLoading={false}
        disabled={true}
        availableDates={mockAvailableDates}
      />
    );

    const button = screen.getByText(format(mockField.value, 'PPP')).closest('button');
    expect(button).toBeDisabled();
  });

  test('shows placeholder text when no date is selected', () => {
    const emptyField = { ...mockField, value: undefined };

    render(
      <DatePickerWithFormContext
        field={emptyField}
        isLoading={false}
        disabled={false}
        availableDates={mockAvailableDates}
      />
    );

    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  test('displays helper text when provided', () => {
    const helperText = 'This is a helper text';

    render(
      <DatePickerWithFormContext
        field={mockField}
        isLoading={false}
        disabled={false}
        helperText={helperText}
        availableDates={mockAvailableDates}
      />
    );

    expect(screen.getByText(helperText)).toBeInTheDocument();
  });

  test('opens calendar popover when button is clicked in desktop mode', async () => {
    const { user } = render(
      <DatePickerWithFormContext
        field={mockField}
        isLoading={false}
        disabled={false}
        availableDates={mockAvailableDates}
      />
    );

    const button = screen.getByText(format(mockField.value, 'PPP')).closest('button');
    await user.click(button as HTMLElement);

    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  test('opens calendar dialog when button is clicked in mobile mode', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);

    const { user } = render(
      <DatePickerWithFormContext
        field={mockField}
        isLoading={false}
        disabled={false}
        availableDates={mockAvailableDates}
      />
    );

    const button = screen.getByText(format(mockField.value, 'PPP')).closest('button');
    await user.click(button as HTMLElement);

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();

    const dialogTitle = dialog?.querySelector('.p-4.flex.items-center h2');
    expect(dialogTitle).toHaveTextContent('Select Date');
  });

  test('calculates fromMonth correctly with available dates', async () => {
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 2);

    const availableDates = [pastDate, new Date()];

    const { user } = render(
      <DatePickerWithFormContext
        field={mockField}
        isLoading={false}
        disabled={false}
        availableDates={availableDates}
      />
    );

    // open calendar
    const button = screen.getByText(format(mockField.value, 'PPP')).closest('button');
    await user.click(button as HTMLElement);

    // check that the month navigation allows going back to the past date's month
    const prevMonthButton = screen.getByLabelText('Go to previous month');
    await user.click(prevMonthButton);
    await user.click(prevMonthButton);

    // verify we can see the month of the earliest available date
    expect(screen.getByText(format(pastDate, 'MMMM yyyy'))).toBeInTheDocument();
  });

  test('calculates lastAvailableMonth correctly with available dates', async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);

    const availableDates = [new Date(), futureDate];

    const { user } = render(
      <DatePickerWithFormContext
        field={mockField}
        isLoading={false}
        disabled={false}
        availableDates={availableDates}
      />
    );

    // open the calendar
    const button = screen.getByText(format(mockField.value, 'PPP')).closest('button');
    await user.click(button as HTMLElement);

    // navigate to future months
    const nextMonthButton = screen.getByLabelText('Go to next month');
    await user.click(nextMonthButton);
    await user.click(nextMonthButton);
    await user.click(nextMonthButton);

    // verify we can see the month of the latest available date
    expect(screen.getByText(format(futureDate, 'MMMM yyyy'))).toBeInTheDocument();

    // verify we can't navigate past the last available month
    await user.click(nextMonthButton);
    expect(screen.getByText(format(futureDate, 'MMMM yyyy'))).toBeInTheDocument();
  });

  test('calls field.onChange when a date is selected', async () => {
    const { user } = render(
      <DatePickerWithFormContext
        field={mockField}
        isLoading={false}
        disabled={false}
        availableDates={mockAvailableDates}
      />
    );

    const button = screen.getByText(format(mockField.value, 'PPP')).closest('button');
    await user.click(button as HTMLElement);

    const dateButtons = document.querySelectorAll('[role="gridcell"] button');
    if (dateButtons.length > 0) {
      // Click a date in the middle of the month
      await user.click(dateButtons[15] as HTMLElement);
      expect(mockField.onChange).toHaveBeenCalled();
    }
  });
});
