import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Booking = {
  startDateTime: Timestamp;
  endDateTime: Timestamp;
  location: string;
  status: string;
  stripeSessionId: string;
  userEmail: string;
  userId: string;
  createdAt: Timestamp;
};

export async function POST(request: NextRequest) {
  const { booking, userEmail, sessionId, userId } = await request.json();

  try {
    const newBooking: Booking = {
      startDateTime: new Timestamp(
        booking.startDateTime.seconds,
        booking.startDateTime.nanoseconds
      ),
      endDateTime: new Timestamp(booking.endDateTime.seconds, booking.endDateTime.nanoseconds),
      location: booking.location,
      userEmail: userEmail,
      stripeSessionId: sessionId,
      status: 'confirmed',
      createdAt: Timestamp.now(),
      userId: userId || null
    };

    const bookingsCollection = collection(db, 'bookings');
    const docRef = await addDoc(bookingsCollection, newBooking);

    return NextResponse.json({
      booking: {
        id: docRef.id
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
