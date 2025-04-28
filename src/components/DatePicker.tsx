import React from 'react';

import type { FieldValues } from 'react-hook-form';
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
import { CalendarIcon, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import {
  format,
  isEqual,
  endOfMonth,
  addMonths,
  startOfDay,
  isBefore,
  subMonths,
  isSameMonth,
  startOfMonth,
  isAfter
} from 'date-fns';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';

type DatePickerProps = {
  field: FieldValues;
  helperText?: string;
  isLoading: boolean;
  numberOfMonths?: number;
  availableDates?: Date[];
  disabled: boolean;
};

const DatePicker: React.FC<DatePickerProps> = ({
  field,
  helperText,
  isLoading,
  disabled,
  availableDates,
  numberOfMonths = 2
}) => {
  const [open, setOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const isMobile = useMediaQuery('(max-width: 640px)');
  const calendarRef = React.useRef<HTMLDivElement>(null);

  const fromMonth = React.useMemo(() => {
    const currentDate = new Date();

    if (availableDates && availableDates.length > 0) {
      const firstAvailableDate = availableDates[0];
      return isBefore(firstAvailableDate, currentDate) ? firstAvailableDate : currentDate;
    }

    return currentDate;
  }, [availableDates]);

  const lastAvailableMonth = React.useMemo(
    () =>
      availableDates && availableDates.length > 0
        ? addMonths(endOfMonth(availableDates[availableDates.length - 1]), 1)
        : addMonths(new Date(), 12),
    [availableDates]
  );

  const onDateChange = (date?: Date) => {
    field.onChange(date);
    setOpen(false);
  };

  const isDayDisabled = (date: Date) => {
    const dateToCheck = startOfDay(date);
    const today = startOfDay(new Date());

    if (!availableDates) {
      return isBefore(dateToCheck, today);
    }

    return !availableDates.some((availableDate) => isEqual(startOfDay(availableDate), dateToCheck));
  };

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const isPreviousMonthDisabled = React.useMemo(() => {
    const prevMonth = startOfMonth(subMonths(currentMonth, 1));
    const minMonth = startOfMonth(fromMonth);

    return isBefore(prevMonth, minMonth) && !isSameMonth(prevMonth, minMonth);
  }, [currentMonth, fromMonth]);

  const isNextMonthDisabled = React.useMemo(() => {
    const nextMonth = startOfMonth(addMonths(currentMonth, 1));
    const maxMonth = startOfMonth(lastAvailableMonth);

    return isAfter(nextMonth, maxMonth) && !isSameMonth(nextMonth, maxMonth);
  }, [currentMonth, lastAvailableMonth]);

  const MobileCalendarComponent = (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-2 px-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousMonth}
          disabled={isPreviousMonthDisabled}
          className="h-7 w-7"
        >
          <ChevronUp className="h-4 w-4" />
          <span className="sr-only">Previous month</span>
        </Button>
        <div className="text-sm font-medium">{format(currentMonth, 'MMMM yyyy')}</div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          disabled={isNextMonthDisabled}
          className="h-7 w-7"
        >
          <ChevronDown className="h-4 w-4" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>
      <div ref={calendarRef} className="overflow-y-auto">
        <Calendar
          mode="single"
          initialFocus
          numberOfMonths={numberOfMonths}
          month={currentMonth}
          selected={field.value}
          disabled={isDayDisabled}
          onSelect={onDateChange}
          toMonth={lastAvailableMonth}
          onMonthChange={setCurrentMonth}
          fromMonth={fromMonth}
          className={cn('p-0')}
          classNames={{
            months: 'flex flex-col gap-8 justify-center',
            month: 'space-y-4 mx-auto',
            caption: 'hidden',
            caption_label: 'text-sm font-medium',
            nav: 'hidden',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex',
            head_cell: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
            row: 'flex w-full mt-2',
            cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20'
          }}
          components={{
            Caption: ({ displayMonth }) => {
              if (isSameMonth(displayMonth, currentMonth)) {
                return null;
              }
              return (
                <div className="flex justify-center pt-1 relative items-center w-full">
                  <span className="text-sm font-medium">{format(displayMonth, 'MMMM yyyy')}</span>
                </div>
              );
            }
          }}
          showOutsideDays={false}
        />
      </div>
    </div>
  );

  return (
    <FormItem className="flex flex-col">
      <FormLabel>Select Date</FormLabel>
      {isMobile ? (
        <>
          <FormControl>
            <Button
              disabled={disabled}
              variant="outline"
              onClick={() => setOpen(true)}
              className={cn(
                'w-full pl-3 text-left font-normal border border-input bg-transparent',
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] p-0 h-[80vh] flex flex-col">
              <div className="p-4 flex items-center justify-between border-b">
                <h2 className="text-lg font-semibold">Select Date</h2>
              </div>
              <div className="p-4 flex-grow overflow-hidden flex flex-col">
                {MobileCalendarComponent}
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                disabled={disabled}
                variant="outline"
                className={cn(
                  'w-full pl-3 text-left font-normal border border-input bg-transparent',
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
              numberOfMonths={numberOfMonths}
              month={currentMonth}
              selected={field.value}
              disabled={isDayDisabled}
              onSelect={onDateChange}
              toMonth={lastAvailableMonth}
              onMonthChange={setCurrentMonth}
              fromMonth={fromMonth}
            />
          </PopoverContent>
        </Popover>
      )}
      {helperText && <FormDescription>{helperText}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
};

export default DatePicker;
