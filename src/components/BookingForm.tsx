import { useQuery } from '@tanstack/react-query';
import { getAvailability } from '@/graphql/availabilities';
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

type BookingFormProps = {
  bookingRef: React.RefObject<HTMLDivElement | null>;
};

export const DATE_FORMAT = 'yyyy-MM-dd';
const BookingFormSchema = z.object({
  location: z.string({
    required_error: 'Please select a location.'
  }),
  date: z
    .date({
      required_error: 'Please select a date.'
    })
    .optional()
});

const BookingForm: React.FC<BookingFormProps> = ({ bookingRef }) => {
  const form = useForm<z.infer<typeof BookingFormSchema>>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      date: undefined,
      location: undefined
    }
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['availabilities'],
    queryFn: getAvailability
  });

  const selectedDate = form.watch('date');
  const selectedLocation = form.watch('location');

  const datesByLocation = React.useMemo(() => {
    if (!data || !selectedLocation) return;

    return data.filter((lesson) => lesson.location.toLowerCase().includes(selectedLocation));
  }, [data, selectedLocation]);

  const availableLessons = React.useMemo(() => {
    if (!datesByLocation || !selectedDate) return [];

    return datesByLocation.filter((lesson) => {
      return lesson.availabilityDate.split('T')[0] === format(selectedDate, DATE_FORMAT);
    });
  }, [data, selectedDate, selectedLocation]);

  const availableUniqueDates = React.useMemo(() => {
    if (!datesByLocation) return [];

    const uniqueDates = new Set<string>();
    datesByLocation.forEach((availability) => {
      uniqueDates.add(availability.availabilityDate);
    });

    return Array.from(uniqueDates).map((dateString) => parseISO(dateString));
  }, [datesByLocation]);

  React.useEffect(() => {
    form.setValue('date', undefined);
  }, [selectedLocation, form]);

  return (
    <section
      ref={bookingRef}
      className="bg-gray-100 dark:bg-background min-h-screen w-full relative overflow-hidden"
    >
      <TennisBall />

      {/* SECTION MESSAGE */}
      <div className="flex flex-col lg:flex-row w-full p-24 relative z-1 gap-2">
        <div className="flex-1 p-2">
          <Typography.H2 className="mb-6 text-foreground">
            <span className="font-bold text-lime-500">Lessons:</span> Improve your game
          </Typography.H2>
          <Typography.P className="text-sm md:text-base text-foreground">
            Whether you're picking up a racket for the first time or looking to refine your
            technique, our private tennis lessons are tailored to your level and goals. Book a
            session today and take the next step in your tennis journey.
          </Typography.P>
        </div>

        {/* TODO: show date only after location is selected, with animation and human language, from bottom to top */}

        {/* FORM */}
        <div className="p-2 flex flex-1 items-start justify-start lg:justify-center">
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
