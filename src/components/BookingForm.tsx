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
import { useSectionRef } from '@/hooks/useSectionRef';

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
  const { bookingFormRef } = useSectionRef();

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
      className="p-8 md:p-16 lg:p-24 dark:bg-background min-h-[calc(100vh-72px)] w-full relative overflow-hidden flex flex-col gap-8"
    >
      <div className="hidden lg:block">
        <TennisBall left="-100px" />
      </div>

      <div>
        <div className="flex flex-col xl:flex-row w-full relative z-1 gap-10 lg:gap-30">
          <div className="flex-1 p-2">
            <Typography.H2 className="mb-5 text-2xl lg:text-4xl text-tennis-green lg:px-3">
              Improve your game
            </Typography.H2>

            <div className="flex flex-col gap-5 lg:gap-10">
              <Typography.H1 className="text-2xl lg:text-4xl text-foreground lg:backdrop-blur-md rounded-lg lg:p-3">
                {`Whether you're picking up a racket for the first time or looking to refine your
                technique, our private tennis lessons are tailored to your level and goals.`}
              </Typography.H1>
              <Typography.H1 className="text-2xl lg:text-4xl text-foreground lg:backdrop-blur-md rounded-lg lg:p-3">
                Book a session today and take the next step in your tennis journey.
              </Typography.H1>
            </div>
          </div>

          <div className="p-2 flex-2 flex-col items-start">
            <Form {...form}>
              <div className="flex flex-col gap-6 w-full lg:w-96 backdrop-blur-md rounded-lg p-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                        <SelectTrigger className="w-full bg-white/80 dark:bg-gray-800/80">
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
            {error && (
              <Typography.P className="text-red-500 relative z-10 px-4">
                Error loading lessons. Please try again later.
              </Typography.P>
            )}

            {selectedDate && (
              <div className="relative z-10 mt-10 lg:mt-20">
                <AvailableLessons availableLessons={availableLessons} date={selectedDate} />
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
