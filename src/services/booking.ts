import { Availability } from './availabilities';

export const createBooking = async (
  booking: Availability,
  sessionId: string,
  userEmail: string
) => {
  return fetch('/api/create-booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      booking,
      sessionId,
      userEmail
    })
  });
};
