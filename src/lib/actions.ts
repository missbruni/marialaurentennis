'use server';

import { revalidatePath } from 'next/cache';

import Stripe from 'stripe';
import { format } from 'date-fns';
import { formatTime } from '@/lib/date';

import {
  doc,
  getDoc,
  Timestamp,
  updateDoc,
  deleteField,
  collection,
  addDoc
} from 'firebase/firestore';
import { capitalizeWords } from '@/lib/string';
import { getFirestore } from '@/lib/firebase';
import { z } from 'zod';

import { clearBookingsCache, clearAvailabilitiesCache } from './data';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-06-30.basil'
});

const THIRTY_MINUTES = 30 * 60 * 1000;
const THIRTY_MINUTES_IN_SECONDS = 30 * 60;

const AvailabilityFormSchema = z.object({
  type: z.enum(['private', 'group']),
  availabilityDate: z.date().min(new Date(), 'Date must be in the future'),
  availabilityStartTime: z.string().min(1, 'Start time is required'),
  availabilityEndTime: z.string().min(1, 'End time is required'),
  players: z.number().min(1, 'At least 1 player is required'),
  location: z.enum(['sundridge', 'muswell']),
  price: z.number().min(0, 'Price must be 0 or higher'),
  createHourlySlots: z.boolean().default(true).optional()
});

const CheckoutSessionSchema = z.object({
  lesson: z.object({
    id: z.string(),
    startDateTime: z.object({
      seconds: z.number(),
      nanoseconds: z.number()
    }),
    endDateTime: z.object({
      seconds: z.number(),
      nanoseconds: z.number()
    }),
    price: z.number(),
    location: z.string(),
    players: z.number(),
    type: z.string()
  }),
  userId: z.string().optional(),
  userEmail: z.string().email().optional()
});

export async function createAvailabilityAction(formData: FormData) {
  const rawData = {
    type: formData.get('type') as string,
    availabilityDate: new Date(formData.get('availabilityDate') as string),
    availabilityStartTime: formData.get('availabilityStartTime') as string,
    availabilityEndTime: formData.get('availabilityEndTime') as string,
    players: parseInt(formData.get('players') as string),
    location: formData.get('location') as string,
    price: parseInt(formData.get('price') as string),
    createHourlySlots: formData.get('createHourlySlots') === 'on'
  };

  const validatedData = AvailabilityFormSchema.parse(rawData);

  try {
    const db = await getFirestore();

    // Parse the start time
    const [startHours, startMinutes] = validatedData.availabilityStartTime.split(':').map(Number);
    const startDate = new Date(validatedData.availabilityDate);
    startDate.setHours(startHours, startMinutes, 0, 0);

    // Parse the end time
    const [endHours, endMinutes] = validatedData.availabilityEndTime.split(':').map(Number);
    const endDate = new Date(validatedData.availabilityDate);
    endDate.setHours(endHours, endMinutes, 0, 0);

    if (validatedData.createHourlySlots) {
      const hourDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

      if (hourDiff <= 0) {
        throw new Error('End time must be at least 1 hour after start time for hourly slots');
      }

      const { writeBatch } = await import('firebase/firestore');
      const availabilityBatch = writeBatch(db);
      let availabilityHourSlots = 0;

      for (let i = 0; i < hourDiff; i++) {
        const slotStart = new Date(startDate.getTime() + i * 60 * 60 * 1000);
        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

        const newAvailability = {
          startDateTime: Timestamp.fromDate(slotStart),
          endDateTime: Timestamp.fromDate(slotEnd),
          players: validatedData.players,
          price: validatedData.price,
          location: validatedData.location,
          type: validatedData.type,
          currency: 'GBP',
          status: 'available'
        };

        const newDocRef = doc(collection(db, 'availabilities'));
        availabilityBatch.set(newDocRef, newAvailability);
        availabilityHourSlots++;
      }

      await availabilityBatch.commit();

      clearAvailabilitiesCache();
      revalidatePath('/admin/availability');
      return { success: true, count: availabilityHourSlots };
    } else {
      const newAvailability = {
        startDateTime: Timestamp.fromDate(startDate),
        endDateTime: Timestamp.fromDate(endDate),
        players: validatedData.players,
        price: validatedData.price,
        location: validatedData.location,
        type: validatedData.type,
        currency: 'GBP',
        status: 'available'
      };

      const availabilitiesCollection = collection(db, 'availabilities');
      const docRef = await addDoc(availabilitiesCollection, newAvailability);

      clearAvailabilitiesCache();

      revalidatePath('/admin/availability');
      return { success: true, id: docRef.id, count: 1 };
    }
  } catch (error) {
    console.error('Error creating availability:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function createCheckoutSessionAction(formData: FormData) {
  const rawData = {
    lesson: JSON.parse(formData.get('lesson') as string),
    userId: formData.get('userId') || undefined,
    userEmail: formData.get('userEmail') || undefined
  };

  const validatedData = CheckoutSessionSchema.parse(rawData);

  try {
    const db = await getFirestore();

    const lessonRef = doc(db, 'availabilities', validatedData.lesson.id);
    const lessonDoc = await getDoc(lessonRef);

    if (!lessonDoc.exists() || lessonDoc.data()?.status !== 'available') {
      return { success: false, error: 'Lesson is no longer available' };
    }

    const startDateTime = new Timestamp(
      validatedData.lesson.startDateTime.seconds,
      validatedData.lesson.startDateTime.nanoseconds
    );
    const endDateTime = new Timestamp(
      validatedData.lesson.endDateTime.seconds,
      validatedData.lesson.endDateTime.nanoseconds
    );

    const date = startDateTime.toDate();
    const formattedDate = format(date, 'EEEE, MMMM d yyyy');
    const formattedStartTime = formatTime(startDateTime);
    const formattedEndTime = formatTime(endDateTime);

    const description = `
        ${formattedDate} | ${formattedStartTime} - ${formattedEndTime}
    `.trim();

    const pendingUntil = new Date(Date.now() + THIRTY_MINUTES);
    await updateDoc(lessonRef, {
      status: 'pending',
      pendingUntil: Timestamp.fromDate(pendingUntil),
      pendingSessionId: null
    });

    clearAvailabilitiesCache();

    const encodedLesson = encodeURIComponent(
      Buffer.from(JSON.stringify(validatedData.lesson)).toString('base64')
    );

    const expiresAt = Math.floor(Date.now() / 1000) + THIRTY_MINUTES_IN_SECONDS;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      expires_at: expiresAt,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: capitalizeWords(
                `${validatedData.lesson.type} Tennis Lesson - ${validatedData.lesson.location}`
              ),
              description
            },
            unit_amount: validatedData.lesson.price * 100 // Stripe expects amount in pence
          },
          quantity: 1
        }
      ],
      metadata: {
        lesson_id: validatedData.lesson.id,
        lesson_date: formattedDate,
        lesson_time: `${formattedStartTime} - ${formattedEndTime}`,
        location: validatedData.lesson.location,
        source: 'mlt-tennis-app',
        timestamp: currentTimestamp.toString(),
        user_id: validatedData.userId || '',
        user_email: validatedData.userEmail || ''
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/confirmation?lesson=${encodedLesson}&sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}?releaseLesson=${validatedData.lesson.id}`
    });

    await updateDoc(lessonRef, {
      pendingSessionId: session.id
    });

    revalidatePath('/');
    return { success: true, url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function createBookingAction(formData: FormData) {
  const booking = JSON.parse(formData.get('booking') as string);
  const userEmail = formData.get('userEmail') as string;
  const sessionId = formData.get('sessionId') as string;
  const userId = formData.get('userId') as string;

  try {
    const db = await getFirestore();

    const newBooking = {
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
      userId: userId
    };

    const bookingsCollection = collection(db, 'bookings');
    const docRef = await addDoc(bookingsCollection, newBooking);

    if (booking.id) {
      const availabilityRef = doc(db, 'availabilities', booking.id);
      await updateDoc(availabilityRef, { status: 'booked', pendingUntil: deleteField() });
    }

    clearBookingsCache(userId);
    clearAvailabilitiesCache();

    revalidatePath('/confirmation');
    return { success: true, booking: { id: docRef.id } };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: 'Failed to create booking' };
  }
}
