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
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, isEqual, addMonths, startOfDay, isBefore } from 'date-fns';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

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
  const [visibleMonths, setVisibleMonths] = React.useState<Date[]>([]);
  const [loadedMonthsCount, setLoadedMonthsCount] = React.useState(6);

  const fromMonth = React.useMemo(() => {
    const currentDate = new Date();

    if (availableDates && availableDates.length > 0) {
      const firstAvailableDate = availableDates[0];
      return isBefore(firstAvailableDate, currentDate) ? firstAvailableDate : currentDate;
    }

    return currentDate;
  }, [availableDates]);

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

  // array of months to display on mobile
  React.useEffect(() => {
    if (isMobile && open) {
      const months: Date[] = [];
      let currentDate = new Date(fromMonth);

      // generate only loadedMonthsCount months instead of 24
      for (let i = 0; i < loadedMonthsCount; i++) {
        months.push(new Date(currentDate));
        currentDate = addMonths(currentDate, 1);
      }

      setVisibleMonths(months);
    }
  }, [isMobile, open, fromMonth, currentMonth, loadedMonthsCount]);

  const handleLoadMoreMonths = () => {
    setLoadedMonthsCount((prevCount) => prevCount + 6);
  };

  const MobileCalendarComponent = (
    <div className="flex flex-col h-full">
      <div
        ref={calendarRef}
        className="overflow-y-auto flex-grow"
        style={{ scrollBehavior: 'smooth' }}
      >
        {visibleMonths.map((monthDate, index) => (
          <div key={index} className="mb-8">
            <div className="text-base font-medium text-center mb-2">
              {format(monthDate, 'MMMM yyyy')}
            </div>
            <Calendar
              mode="single"
              month={monthDate}
              selected={field.value}
              disabled={isDayDisabled}
              onSelect={onDateChange}
              showOutsideDays={false}
              className={cn('p-0')}
              modifiers={{
                available: (date) => isDateAvailable(date)
              }}
              modifiersClassNames={{
                available: '!font-bold text-lime-800 rounded-sm hover:text-lime-800 cursor-pointer'
              }}
              classNames={{
                months: 'flex flex-col gap-4 justify-center',
                month: 'space-y-4 mx-auto',
                caption: 'hidden',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-muted-foreground rounded-md w-10 font-normal text-[0.95rem]',
                row: 'flex w-full mt-2',
                cell: 'relative p-0 text-center text-base focus-within:relative focus-within:z-20',
                day: 'h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground',
                day_disabled: 'cursor-not-allowed'
              }}
            />
          </div>
        ))}

        <Button variant="outline" className="w-full mb-4" onClick={handleLoadMoreMonths}>
          Load more dates
        </Button>
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
                'w-full pl-3 text-left font-normal border border-input bg-white dark:bg-transparent',
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
            <DialogContent className="sm:max-w-[425px] p-0 h-[80vh] flex flex-col custom-dialog-close">
              <DialogTitle>
                <VisuallyHidden>Select a date</VisuallyHidden>
              </DialogTitle>
              <DialogDescription>
                <VisuallyHidden>Choose from available dates</VisuallyHidden>
              </DialogDescription>
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
                  'w-full pl-3 text-left font-normal border border-input bg-white dark:bg-transparent',
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
              onMonthChange={setCurrentMonth}
              fromMonth={fromMonth}
              modifiers={{
                available: (date) => isDateAvailable(date)
              }}
              modifiersClassNames={{
                available:
                  '!font-extrabold text-tennis-green rounded-sm hover:text-tennis-green cursor-pointer'
              }}
              classNames={{
                day_disabled: 'cursor-not-allowed text-gray-400'
              }}
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
