import React from 'react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import type { Availability } from '@/services/availabilities';
import { formatTime } from '@/lib/date';
import { capitalizeWords } from '@/lib/string';

interface BookingDetailsProps {
  lesson: Availability;
}

export function BookingDetails({ lesson }: BookingDetailsProps) {
  const startDateTime = new Timestamp(
    lesson.startDateTime.seconds,
    lesson.startDateTime.nanoseconds
  );
  const endDateTime = new Timestamp(lesson.endDateTime.seconds, lesson.endDateTime.nanoseconds);
  const date = startDateTime.toDate();

  const details = [
    { label: 'Date', value: format(date, 'EEEE, MMMM d yyyy') },
    { label: 'Time', value: `${formatTime(startDateTime)} - ${formatTime(endDateTime)}` },
    { label: 'Location', value: capitalizeWords(lesson.location) },
    { label: 'Type', value: `${capitalizeWords(lesson.type)} Lesson` },
    { label: 'Price', value: `£${lesson.price}` }
  ];

  return (
    <div className="mt-4 space-y-2 text-sm">
      {details.map(({ label, value }) => (
        <div key={label} className="flex justify-between">
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-medium">{value}</span>
        </div>
      ))}
    </div>
  );
}
