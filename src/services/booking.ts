import type { Availability } from './availabilities';

export const createBooking = async (
  booking: Availability,
  sessionId: string,
  userEmail: string,
  userId: string
) => {
  return fetch('/api/create-booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      booking,
      sessionId,
      userEmail,
      userId
    })
  });
};
