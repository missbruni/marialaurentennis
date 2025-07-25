import React, { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { format, parseISO, startOfDay, isAfter, isEqual, isBefore } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import AvailableLessons from './AvailableLessons';
import { z } from 'zod';
import { Form, FormField } from './ui/form';
import DatePicker from './DatePicker';
import TennisBall from './TennisBall';
import { Typography } from './ui/typography';
import { useSectionRef } from '@/hooks/useSectionRef';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Skeleton } from './ui/skeleton';
import { ErrorBoundary } from './ErrorBoundary';
import type { Availability } from '@/services/availabilities';
import { use } from 'react';
import { getAvailabilitiesData } from '@/lib/data';

const DATE_FORMAT = 'yyyy-MM-dd';

export const BookingFormSchema = z.object({
  date: z
    .date({
      required_error: 'Please select a date.'
    })
    .optional()
});

const availabilitiesPromise = getAvailabilitiesData();

const BookingForm: React.FC = React.memo(() => {
  const { bookingFormRef, availableLessonsRef, scrollToAvailableLessons } = useSectionRef();

  const isMobile = useMediaQuery('(max-width: 768px)');

  const [nextAvailableSlot, setNextAvailableSlot] = React.useState<Date | null>(null);

  const form = useForm<z.infer<typeof BookingFormSchema>>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      date: undefined
    }
  });

  const availabilities = use(availabilitiesPromise);

  const selectedDate = form.watch('date');
  const selectedLocation = 'sundridge';

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

  const handleNextAvailableSlot = React.useCallback(
    (date: Date) => {
      form.setValue('date', date);
    },
    [form]
  );

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

  const scrollToAvailableLessonsCallback = React.useCallback(() => {
    scrollToAvailableLessons(-100);
  }, [scrollToAvailableLessons]);

  React.useEffect(() => {
    if (selectedDate && isMobile) {
      scrollToAvailableLessonsCallback();
    }
  }, [selectedDate, isMobile, scrollToAvailableLessonsCallback]);

  return (
    <section
      ref={bookingFormRef}
      data-testid="booking-form-section"
      className="dark:bg-background relative flex min-h-[calc(100vh-72px)] w-full flex-col gap-8 overflow-hidden p-8 md:p-16 lg:p-24"
    >
      <div className="hidden lg:block">
        <TennisBall left="-100px" />
      </div>

      <div>
        <div className="relative z-1 flex w-full flex-col gap-4 xl:flex-row">
          <div className="flex-1 p-2">
            <Typography.H2
              data-testid="booking-form-title"
              className="text-tennis-green mb-5 text-2xl lg:px-3 lg:text-4xl"
            >
              Improve your game
            </Typography.H2>

            <div className="flex flex-col gap-5 md:gap-8 lg:gap-10">
              <Typography.H1
                data-testid="booking-form-subtitle"
                className="text-foreground rounded-lg text-2xl lg:p-3 lg:text-4xl lg:backdrop-blur-md"
              >
                Book a session today and take the next step in your tennis journey.
              </Typography.H1>
            </div>
          </div>

          <div className="flex flex-2 flex-col flex-wrap gap-5 p-2 md:flex-row lg:gap-20">
            <Form {...form}>
              <div
                data-testid="date-picker-container"
                className="flex flex-col gap-2 rounded-lg backdrop-blur-md"
              >
                <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                  <ErrorBoundary
                    fallback={
                      <div className="relative z-10 px-4 text-red-500">
                        Error loading lessons. Please try again later.
                      </div>
                    }
                  >
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
                  </ErrorBoundary>
                </Suspense>
              </div>
            </Form>

            {selectedDate && (
              <div
                data-testid="available-lessons-container"
                className="relative z-10 flex-1"
                ref={availableLessonsRef}
              >
                <AvailableLessons
                  selectedDate={selectedDate ? format(selectedDate, DATE_FORMAT) : ''}
                  selectedLocation={selectedLocation}
                  nextAvailableSlot={nextAvailableSlot}
                  availabilities={availabilities}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <TennisBall right="-20px" width="100px" topPercent={130} bottomPercent={0} />
      </div>
    </section>
  );
});

BookingForm.displayName = 'BookingForm';
export default BookingForm;
