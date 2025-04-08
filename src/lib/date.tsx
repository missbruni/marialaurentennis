import { format, parseISO } from 'date-fns';
import { LessonAvailability } from '../graphql/availabilities';
import { DATE_FORMAT } from '../components/BookingForm';

/**
 * Formats a time string (HH:MM:SS) into a user-friendly AM/PM format.
 *
 * @param timeString - Time string in 24-hour format (e.g., "14:30:00")
 * @returns Formatted time string in 12-hour format with AM/PM (e.g., "2:30 PM")
 * Always includes minutes (e.g., "2:00 PM" instead of "2 PM")
 */
export const formatTime = (timeString: string) => {
  const date = new Date(`2000-01-01T${timeString}`);
  return date.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
  });
};
