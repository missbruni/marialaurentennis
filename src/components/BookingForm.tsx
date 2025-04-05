import { useQuery } from '@tanstack/react-query';
import { getAvailability } from '@/graphql/availabilities';
import { useForm } from 'react-hook-form';
import React from 'react';
import DatePicker from './DatePicker';
import { parseISO, format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import AvailableLessons from './AvailableLessons';
import { z } from 'zod';
import { Form, FormField } from './ui/form';

type BookingFormProps = {
  bookingRef: React.RefObject<HTMLDivElement | null>;
};

const BookingFormSchema = z.object({
  date: z.date({
    required_error: 'Please select a date.'
  })
});

export const DATE_FORMAT = 'yyyy-MM-dd';
const BookingForm: React.FC<BookingFormProps> = ({ bookingRef }) => {
  const form = useForm<z.infer<typeof BookingFormSchema>>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      date: undefined
    }
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['availabilities'],
    queryFn: getAvailability
  });

  const selectedDate = form.watch('date');

  const availableDates = React.useMemo(() => {
    if (!data) return [];

    const uniqueDates = new Set<string>();
    data.forEach((availability) => {
      uniqueDates.add(availability.lessonAvailability.availabilityDate);
    });

    return Array.from(uniqueDates).map((dateString) => parseISO(dateString));
  }, [data]);

  const availableLessonSlots = React.useMemo(() => {
    if (!data || !selectedDate) return [];

    return data.filter((availability) => {
      const availabilityDate = format(
        parseISO(availability.lessonAvailability.availabilityDate),
        DATE_FORMAT
      );
      return availabilityDate === format(selectedDate, DATE_FORMAT);
    });
  }, [data, selectedDate]);

  return (
    <section ref={bookingRef} className="bg-gray-50 min-h-screen w-full">
      <div className="flex w-full p-24">
        <div className="flex-1 p-2">
          <h2 className="text-2xl md:text-4xl mb-6 text-gray-800">
            <span className="font-bold text-lime-500">Lessons:</span> Improve your game
          </h2>
          <h6 className="text-sm md:text-base text-gray-800">
            Whether you're picking up a racket for the first time or looking to refine your
            technique, our private tennis lessons are tailored to your level and goals. Book a
            session today and take the next step in your tennis journey.
          </h6>
        </div>
        <div className="p-2 flex flex-1 justify-center items-start">
          <Form {...form}>
            <div className="flex flex-col gap-2 w-96">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <DatePicker field={field} availableDates={availableDates} isLoading={isLoading} />
                )}
              />
            </div>
          </Form>
        </div>
      </div>

      {isLoading && <p className="text-center text-gray-800">Loading...</p>}
      {error && <p className="text-center text-red-500">Error loading lessons</p>}

      <AvailableLessons availableLessons={availableLessonSlots} date={selectedDate} />
    </section>
  );
};

export default BookingForm;
