import React, { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import AvailableLessons, { AvailableLessonsSkeleton } from './AvailableLessons';
import { z } from 'zod';
import { Form } from './ui/form';
import TennisBall from './TennisBall';
import { Typography } from './ui/typography';
import { useSectionRef } from '@/hooks/useSectionRef';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Skeleton } from './ui/skeleton';
import { ErrorBoundary } from './ErrorBoundary';
import { DatePickerWithData } from './DatePickerWithData';

const DATE_FORMAT = 'yyyy-MM-dd';

export const BookingFormSchema = z.object({
  date: z
    .date({
      required_error: 'Please select a date.'
    })
    .optional()
});

const BookingForm: React.FC = React.memo(() => {
  const { bookingFormRef, availableLessonsRef, scrollToAvailableLessons } = useSectionRef();
  const [nextAvailableSlot, setNextAvailableSlot] = React.useState<Date | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const form = useForm<z.infer<typeof BookingFormSchema>>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      date: undefined
    }
  });

  const selectedDate = form.watch('date');
  const selectedLocation = 'sundridge';

  const handleNextAvailableSlot = React.useCallback(
    (date: Date) => {
      form.setValue('date', date);
    },
    [form]
  );

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
                    <DatePickerWithData
                      form={form}
                      selectedLocation={selectedLocation}
                      handleNextAvailableSlot={handleNextAvailableSlot}
                      setNextAvailableSlot={setNextAvailableSlot}
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
                <Suspense fallback={<AvailableLessonsSkeleton />}>
                  <ErrorBoundary
                    fallback={
                      <div className="relative z-10 px-4 text-red-500">
                        Error loading lessons. Please try again later.
                      </div>
                    }
                  >
                    <AvailableLessons
                      selectedDate={selectedDate ? format(selectedDate, DATE_FORMAT) : ''}
                      selectedLocation={selectedLocation}
                      nextAvailableSlot={nextAvailableSlot}
                    />
                  </ErrorBoundary>
                </Suspense>
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
