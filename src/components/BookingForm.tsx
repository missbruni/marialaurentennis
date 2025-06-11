import { useQuery } from '@tanstack/react-query';
import { getAvailability } from '@/services/availabilities';
import { useForm } from 'react-hook-form';
import React from 'react';
import DatePicker from './DatePicker';
import { parseISO, format, startOfDay, isAfter, isEqual, isBefore } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import AvailableLessons from './AvailableLessons';
import { z } from 'zod';
import { Form, FormField } from './ui/form';
import TennisBall from './TennisBall';
import { Typography } from './ui/typography';
import { useSectionRef } from '@/hooks/useSectionRef';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const DATE_FORMAT = 'yyyy-MM-dd';

const FIVE_MINUTES = 5 * 60 * 1000;
const BookingFormSchema = z.object({
  date: z
    .string({
      required_error: 'Please select a date.'
    })
    .optional()
});

const BookingForm: React.FC = () => {
  const { bookingFormRef, availableLessonsRef, scrollToAvailableLessons } = useSectionRef();
  const [nextAvailableSlot, setNextAvailableSlot] = React.useState<Date | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const form = useForm<z.infer<typeof BookingFormSchema>>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      date: undefined
    }
  });

  const {
    data: availabilities,
    isLoading,
    error
  } = useQuery({
    queryKey: ['availabilities'],
    queryFn: getAvailability,
    staleTime: FIVE_MINUTES,
    refetchOnWindowFocus: false
  });

  const selectedDate = form.watch('date');
  const selectedLocation = 'sundridge';

  const datesByLocation = React.useMemo(() => {
    if (!availabilities || !selectedLocation) return [];

    return availabilities.filter((availability) =>
      availability.location.toLowerCase().includes(selectedLocation)
    );
  }, [availabilities, selectedLocation]);

  const availableLessons = React.useMemo(() => {
    if (!datesByLocation || !selectedDate) return [];

    return datesByLocation.filter((availability) => {
      return (
        availability.startDateTime.toDate().toISOString().split('T')[0] ===
        format(selectedDate, DATE_FORMAT)
      );
    });
  }, [datesByLocation, selectedDate]);

  const availableUniqueDates = React.useMemo(() => {
    if (!datesByLocation || datesByLocation.length === 0) return [];

    const uniqueDates = new Set<string>();
    const now = new Date();
    const today = startOfDay(now);

    datesByLocation.forEach(availability => {
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
    const nextDate = availableUniqueDates.find(date => 
      isAfter(startOfDay(date), selectedDateStart)
    );
    
    if (nextDate) return nextDate;

    return null;
  }, [availableUniqueDates, selectedDate]);

  const handleNextAvailableSlot = (date: Date) => {
    form.setValue('date', format(date, DATE_FORMAT));
  };

  React.useEffect(() => {
    if (!availableUniqueDates || availableUniqueDates.length === 0) {
      setNextAvailableSlot(null);
      return;
    }
    
    const today = startOfDay(new Date());
    const nextAvailable = availableUniqueDates
      .filter(date => {
        const dateToCheck = startOfDay(date);
        return isAfter(dateToCheck, today) || isEqual(dateToCheck, today);
      })
      .sort((a, b) => a.getTime() - b.getTime())[0] || null;

    setNextAvailableSlot(nextAvailable);
  }, [availableUniqueDates]);

  React.useEffect(() => {
    if (selectedDate && isMobile) {
      scrollToAvailableLessons(-100);
    }
  }, [selectedDate, isMobile, scrollToAvailableLessons]);

  return (
    <section
      ref={bookingFormRef}
      className="p-8 md:p-16 lg:p-24 dark:bg-background min-h-[calc(100vh-72px)] w-full relative overflow-hidden flex flex-col gap-8"
    >
      <div className="hidden lg:block">
        <TennisBall left="-100px" />
      </div>

      <div>
        <div className="flex flex-col xl:flex-row w-full relative z-1 gap-4">
          <div className="flex-1 p-2">
            <Typography.H2 className="mb-5 text-2xl lg:text-4xl text-tennis-green lg:px-3">
              Improve your game
            </Typography.H2>

            <div className="flex flex-col gap-5 md:gap-8 lg:gap-10">
              <Typography.H1 className="text-2xl lg:text-4xl text-foreground lg:backdrop-blur-md rounded-lg lg:p-3">
                Book a session today and take the next step in your tennis journey.
              </Typography.H1>
            </div>
          </div>

          <div className="p-2 flex-2 flex flex-col md:flex-row flex-wrap gap-5 lg:gap-20">
            <Form {...form} >
              <div className="flex flex-col gap-2 backdrop-blur-md rounded-lg">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <DatePicker
                      field={field}
                      availableDates={availableUniqueDates}
                      isLoading={isLoading}
                      disabled={!selectedLocation}
                      helperText="Choose a date to see available lessons."
                      nextAvailableDate={nextAvailableDate}
                      onNextAvailableSlot={handleNextAvailableSlot}
                    />
                  )}
                />
              </div>
            </Form>
            {error && (
              <Typography.P className="text-red-500 relative z-10 px-4">
                Error loading lessons. Please try again later.
              </Typography.P>
            )}

            {selectedDate && (
              <div className="relative z-10 flex-1" ref={availableLessonsRef}>
                <AvailableLessons 
                  availableLessons={availableLessons} 
                  date={selectedDate} 
                  nextAvailableSlot={nextAvailableSlot}
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
};

export default BookingForm;
