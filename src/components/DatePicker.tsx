import React from 'react';

import { FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, isEqual, endOfMonth, addMonths, subMonths } from 'date-fns';

type DatePickerProps = {
  field: FieldValues;
  availableDates?: Date[];
  isLoading: boolean;
  disabled: boolean;
};

const DatePicker: React.FC<DatePickerProps> = ({
  field,
  availableDates = [],
  isLoading,
  disabled
}) => {
  console.log('🚀 ~ availableDates:', availableDates);
  const [open, setOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  const lastAvailableMonth = addMonths(endOfMonth(availableDates[availableDates.length - 1]), 1);

  const onDateChange = (date?: Date) => {
    field.onChange(date);
    setOpen(false);
  };

  const isDayDisabled = (date: Date) => {
    if (availableDates.length > 0) {
      return !availableDates.some((availableDate) =>
        isEqual(new Date(availableDate.setHours(0, 0, 0, 0)), new Date(date.setHours(0, 0, 0, 0)))
      );
    }
    return true;
  };

  return (
    <FormItem className="flex flex-col">
      <FormLabel>Select Date</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              disabled={disabled}
              variant="outline"
              className={cn(
                'w-full pl-3 text-left font-normal border border-input',
                !field.value && 'text-muted-foreground'
              )}
            >
              {field.value ? format(field.value, 'PPP') : 'Pick a date'}
              {isLoading ? (
                <Loader2 className="ml-auto h-4 w-4 animate-spin" />
              ) : (
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              )}
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            initialFocus
            numberOfMonths={2}
            month={currentMonth}
            selected={field.value}
            disabled={isDayDisabled}
            onSelect={onDateChange}
            toMonth={lastAvailableMonth}
            onMonthChange={setCurrentMonth}
            fromMonth={subMonths(availableDates[0], 1)}
          />
        </PopoverContent>
      </Popover>
      <FormDescription>Choose a date to see available lessons.</FormDescription>
      <FormMessage />
    </FormItem>
  );
};

export default DatePicker;
