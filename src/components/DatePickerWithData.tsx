import React from 'react';
import { useForm } from 'react-hook-form';
import { parseISO, format, startOfDay, isAfter, isEqual, isBefore } from 'date-fns';
import { z } from 'zod';
import { FormField } from './ui/form';
import DatePicker from './DatePicker';
import { use } from 'react';
import { getAvailabilitiesData } from '@/lib/data';
import type { Availability } from '@/services/availabilities';
import { BookingFormSchema } from './BookingForm';

const DATE_FORMAT = 'yyyy-MM-dd';
const availabilitiesPromise = getAvailabilitiesData();

type DatePickerWithDataProps = {
  form: ReturnType<typeof useForm<z.infer<typeof BookingFormSchema>>>;
  selectedLocation: string;
  handleNextAvailableSlot: (date: Date) => void;
  setNextAvailableSlot: (date: Date | null) => void;
};

export function DatePickerWithData({
  form,
  selectedLocation,
  handleNextAvailableSlot,
  setNextAvailableSlot
}: DatePickerWithDataProps) {
  const availabilities = use(availabilitiesPromise);
  const selectedDate = form.watch('date');

  const datesByLocation = React.useMemo(() => {
    if (!availabilities || !selectedLocation) return [];

    return availabilities.filter((availability: Availability) =>
      availability.location.toLowerCase().includes(selectedLocation)
    );
  }, [availabilities, selectedLocation]);

  const availableUniqueDates = React.useMemo(() => {
    if (!datesByLocation || datesByLocation.length === 0) return [];

    const uniqueDates = new Set<string>();
    const now = new Date();
    const today = startOfDay(now);

    datesByLocation.forEach((availability: Availability) => {
      const date = startOfDay(availability.startDateTime.toDate());
      const dateString = format(date, DATE_FORMAT);
      const isToday = isEqual(date, today);

      if (isBefore(date, today)) return;
      if (isToday && availability.startDateTime.toDate() <= now) return;

      uniqueDates.add(dateString);
    });

    return Array.from(uniqueDates).map((dateString) => parseISO(dateString));
  }, [datesByLocation]);

  const nextAvailableDate = React.useMemo(() => {
    if (!availableUniqueDates.length) return null;
    if (!selectedDate) return availableUniqueDates[0];

    const selectedDateStart = startOfDay(selectedDate);
    const nextDate = availableUniqueDates.find((date) =>
      isAfter(startOfDay(date), selectedDateStart)
    );

    if (nextDate) return nextDate;

    return null;
  }, [availableUniqueDates, selectedDate]);

  React.useEffect(() => {
    if (!availableUniqueDates || availableUniqueDates.length === 0) {
      setNextAvailableSlot(null);
      return;
    }

    const today = startOfDay(new Date());
    const nextAvailable =
      availableUniqueDates
        .filter((date) => {
          const dateToCheck = startOfDay(date);
          return isAfter(dateToCheck, today) || isEqual(dateToCheck, today);
        })
        .sort((a, b) => a.getTime() - b.getTime())[0] || null;

    setNextAvailableSlot(nextAvailable);
  }, [availableUniqueDates, setNextAvailableSlot]);

  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field }) => (
        <DatePicker
          field={field}
          availableDates={availableUniqueDates}
          disabled={!selectedLocation}
          helperText="Choose a date to see available lessons."
          nextAvailableDate={nextAvailableDate}
          onNextAvailableSlot={handleNextAvailableSlot}
        />
      )}
    />
  );
}
