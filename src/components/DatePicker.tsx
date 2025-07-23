import React from 'react';
import type { FieldValues } from 'react-hook-form';
import { FormItem } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { isEqual, startOfDay, isBefore, startOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';
import { Button } from './ui/button';

type DatePickerProps = {
  field: FieldValues;
  helperText?: string;
  numberOfMonths?: number;
  availableDates?: Date[];
  disabled: boolean;
  onNextAvailableSlot?: (date: Date) => void;
  nextAvailableDate: Date | null;
};

const DatePicker: React.FC<DatePickerProps> = React.memo(
  ({ field, disabled, availableDates, onNextAvailableSlot, nextAvailableDate }) => {
    const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

    // Memoize the date change handler
    const onDateChange = React.useCallback(
      (date?: Date) => {
        field.onChange(date);
      },
      [field]
    );

    const isDayDisabled = React.useCallback(
      (date: Date) => {
        const dateToCheck = startOfDay(date);
        const today = startOfDay(new Date());

        if (!availableDates) {
          return isBefore(dateToCheck, today);
        }

        const isDisabled = !availableDates.some((availableDate) =>
          isEqual(startOfDay(availableDate), dateToCheck)
        );

        return isDisabled;
      },
      [availableDates]
    );

    const isDateAvailable = React.useCallback(
      (date: Date) => {
        if (!availableDates) return false;
        const dateToCheck = startOfDay(date);

        return availableDates.some((availableDate) =>
          isEqual(startOfDay(availableDate), dateToCheck)
        );
      },
      [availableDates]
    );

    const onNextAvailableClick = React.useCallback(() => {
      if (nextAvailableDate) {
        onDateChange(nextAvailableDate);
        setCurrentMonth(nextAvailableDate);
        onNextAvailableSlot?.(nextAvailableDate);
      }
    }, [nextAvailableDate, onDateChange, onNextAvailableSlot]);

    return (
      <FormItem className="mx-auto flex flex-col md:mx-0">
        <Calendar
          mode="single"
          numberOfMonths={1}
          month={currentMonth}
          selected={new Date(field.value)}
          disabled={isDayDisabled}
          onSelect={onDateChange}
          onMonthChange={setCurrentMonth}
          fromMonth={startOfMonth(new Date())}
          modifiers={{
            available: (date) => isDateAvailable(date)
          }}
          modifiersClassNames={{
            selected: 'border-2 border-tennis-green',
            available:
              '!font-extrabold text-tennis-green rounded-sm cursor-pointer hover:bg-transparent hover:border-2 hover:border-tennis-green hover:text-tennis-green'
          }}
          classNames={{
            day_outside: '',
            day: 'border-0 h-12 w-12 text-base font-medium p-0 bg-transparent focus:bg-transparent focus:text-tennis-green sm:h-15 sm:w-15 sm:text-lg transition-colors duration-300',
            day_disabled: 'cursor-not-allowed text-gray-400',
            day_range_middle: 'text-base sm:text-lg',
            day_today: 'text-base sm:text-lg',
            caption: 'flex justify-center pt-1 relative items-center',
            caption_label: 'text-base font-bold sm:text-lg',
            cell: 'text-center text-base p-0 relative sm:text-lg',
            head_cell: 'w-10 text-base font-medium text-muted-foreground sm:w-15 sm:text-lg',
            table: 'w-full border-collapse',
            nav_button: cn(
              buttonVariants({ variant: 'outline' }),
              'size-7 md:size-10 bg-transparent p-0 opacity-50 hover:opacity-100 cursor-pointer'
            )
          }}
        />
        <Button
          onClick={onNextAvailableClick}
          disabled={!nextAvailableDate || disabled}
          variant="outline"
          size="lg"
          className="text-md text-tennis-green hover:text-tennis-green hover:border-tennis-green disabled:text-muted-foreground disabled:hover:text-muted-foreground w-full hover:bg-transparent"
        >
          {nextAvailableDate ? 'Next available date' : 'No future dates available'}
        </Button>
      </FormItem>
    );
  }
);

DatePicker.displayName = 'DatePicker';
export default DatePicker;
