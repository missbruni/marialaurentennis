import React from 'react';

import type { FieldValues } from 'react-hook-form';
import { FormItem} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { isEqual, startOfDay, isBefore, startOfMonth } from 'date-fns';

type DatePickerProps = {
  field: FieldValues;
  helperText?: string;
  isLoading: boolean;
  numberOfMonths?: number;
  availableDates?: Date[];
  disabled: boolean;
};

const DatePicker: React.FC<DatePickerProps> = ({ field, availableDates}) => {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  const onDateChange = (date?: Date) => {
    field.onChange(date);
  };

  const isDayDisabled = (date: Date) => {
    const dateToCheck = startOfDay(date);
    const today = startOfDay(new Date());

    if (!availableDates) {
      return isBefore(dateToCheck, today);
    }

    const isDisabled = !availableDates.some((availableDate) =>
      isEqual(startOfDay(availableDate), dateToCheck)
    );

    return isDisabled;
  };

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

  return (
    <FormItem className="flex m-auto">
      <Calendar
        mode="single"
        initialFocus
        numberOfMonths={1}
        month={currentMonth}
        selected={field.value}
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
          day_outside: "",
          day: 'border-0 h-15 w-15 text-lg font-medium p-0 bg-transparent focus:bg-transparent focus:text-tennis-green',
          day_disabled: 'cursor-not-allowed text-gray-400',
          day_range_middle: 'text-lg',
          day_today: 'text-lg',
          caption: 'flex justify-center pt-1 relative items-center',
          caption_label: 'text-lg font-bold',
          cell: 'text-center text-lg p-0 relative',
          head_cell: 'w-15 text-lg font-medium text-muted-foreground',
          table: 'w-full border-collapse'
        }}
      />
    </FormItem>
  );
};

export default DatePicker;
