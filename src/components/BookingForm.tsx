import { useQuery } from '@tanstack/react-query';
import { getAvailability } from '@/services/availabilities';
import { useForm } from 'react-hook-form';
import React from 'react';
import DatePicker from './DatePicker';
import { parseISO, format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import AvailableLessons from './AvailableLessons';
import { z } from 'zod';
import { Form, FormDescription, FormField, FormItem, FormLabel } from './ui/form';
import TennisBall from './TennisBall';
import { Typography } from './ui/typography';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { useBookingForm } from '@/components/hooks/useBookingForm';

const DATE_FORMAT = 'yyyy-MM-dd';

const FIVE_MINUTES = 5 * 60 * 1000;
const BookingFormSchema = z.object({
  location: z.string({
    required_error: 'Please select a location.'
  }),
  date: z
    .string({
      required_error: 'Please select a date.'
    })
    .optional()
});

const BookingForm: React.FC = () => {
  const { bookingFormRef } = useBookingForm();

  const form = useForm<z.infer<typeof BookingFormSchema>>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      date: undefined,
      location: 'sundridge'
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
  const selectedLocation = form.watch('location');

  const datesByLocation = React.useMemo(() => {
    if (!availabilities || !selectedLocation) return;

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
    if (!datesByLocation) return [];

    const uniqueDates = new Set<string>();
    datesByLocation.forEach((availability) => {
      uniqueDates.add(format(availability.startDateTime.toDate(), DATE_FORMAT));
    });

    return Array.from(uniqueDates).map((dateString) => parseISO(dateString));
  }, [datesByLocation]);

  React.useEffect(() => {
    form.setValue('date', undefined);
  }, [selectedLocation, form]);

  return (
    <section
      ref={bookingFormRef}
      className="dark:bg-background min-h-screen w-full relative overflow-hidden"
    >
      <div className="hidden md:block">
        <TennisBall />
      </div>

      <div className="flex flex-col lg:flex-row w-full p-24 relative z-1 gap-6">
        <div className="flex-1 p-2">
          <Typography.H2 className="mb-6 text-foreground">
            <span className="font-bold text-lime-500">Lessons:</span> Improve your game
          </Typography.H2>
          <Typography.P className="text-sm md:text-base text-foreground">
            {`Whether you're picking up a racket for the first time or looking to refine your
            technique, our private tennis lessons are tailored to your level and goals. Book a
            session today and take the next step in your tennis journey.`}
          </Typography.P>
        </div>

        {/* TODO: show date only after location is selected, with animation and human language, from bottom to top */}

        <div className="p-2 flex flex-1 items-start justify-start md:justify-end">
          <Form {...form}>
            <div className="flex flex-col gap-6 w-96">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Locations</SelectLabel>
                          <SelectItem value="sundridge">Sundridge Park</SelectItem>
                          <SelectItem value="muswell">Muswell Hill Methodist (LTC)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose a tennis club.</FormDescription>
                  </FormItem>
                )}
              ></FormField>
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
                  />
                )}
              />
            </div>
          </Form>
        </div>
      </div>

      {isLoading && (
        <Typography.P className="text-center text-foreground relative z-10">
          Loading...
        </Typography.P>
      )}
      {error && (
        <Typography.P className="text-center text-red-500 relative z-10">
          Error loading lessons
        </Typography.P>
      )}

      {selectedDate && (
        <div className="ml-[180px] relative z-10">
          <AvailableLessons availableLessons={availableLessons} date={selectedDate} />
        </div>
      )}
    </section>
  );
};

export default BookingForm;
