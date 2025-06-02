import { differenceInHours } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

/**
 * Formats a Timestamp into a user-friendly 12-hour time format with AM/PM.
 *
 * @param timeInput - Timestamp object to format
 * @returns Formatted time string in 12-hour format with AM/PM (e.g., "2:30 PM")
 */
export const formatTime = (timeInput: Timestamp) => {
  return timeInput.toDate().toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).toUpperCase();
};

/**
 * Calculates the number of hours between two dates
 *
 * @param startTime - Start date/time
 * @param endTime - End date/time
 * @returns Number of hours between the two times (floored to nearest integer)
 */
export const calculateHourDifference = (startTime: Date, endTime: Date): number => {
  return Math.floor(differenceInHours(endTime, startTime));
};

/**
 * Formats a time string from a Date object in HH:MM format
 *
 * @param date - Date object to extract time from
 * @returns Time string in HH:MM format
 */
export const formatTimeHHMM = (date: Date): string => {
  return date.toTimeString().substring(0, 5);
};

/**
 * Creates a Date object from a date string and time string
 *
 * @param dateString - Date in yyyy-MM-dd format
 * @param timeString - Time in HH:MM format
 * @returns Date object representing the combined date and time
 */
export const createDateWithTime = (dateString: string, timeString: string): Date => {
  return new Date(`${dateString}T${timeString}`);
};

/**
 * Formats a Timestamp into a user-friendly 12-hour time format with AM/PM.
 *
 * @param timeInput - Timestamp object to format
 * @returns Formatted time string in 12-hour format with AM/PM (e.g., "2:30 PM")
 */
export const formatTimestamp = (timeInput: Timestamp) => {
  return timeInput.toDate().toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
