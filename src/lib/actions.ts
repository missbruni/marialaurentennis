'use server';

import { revalidatePath } from 'next/cache';

import Stripe from 'stripe';
import { format } from 'date-fns';

import { capitalizeWords } from '@/lib/string';
import { z } from 'zod';

import { clearBookingsCache } from './data';
import { withAuth, type AuthenticatedUser } from './auth-utils';
import type { Firestore } from 'firebase-admin/firestore';

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

const SetUserRoleSchema = z.object({
  uid: z.string().min(1, 'User ID is required'),
  role: z.enum(['admin', 'user'], {
    errorMap: () => ({ message: 'Role must be either "admin" or "user"' })
  })
});

const CreateBookingSchema = z.object({
  booking: z.object({
    startDateTime: z.object({
      seconds: z.number()
    }),
    endDateTime: z.object({
      seconds: z.number()
    }),
    location: z.string(),
    id: z.string().optional()
  }),
  userEmail: z.string().email(),
  sessionId: z.string(),
  userId: z.string()
});

async function _createAvailabilityAction(
  formData: FormData,
  db: Firestore,
  user: AuthenticatedUser
) {
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
    const [startHours, startMinutes] = validatedData.availabilityStartTime.split(':').map(Number);
    const startDate = new Date(validatedData.availabilityDate);
    startDate.setHours(startHours, startMinutes, 0, 0);

    const [endHours, endMinutes] = validatedData.availabilityEndTime.split(':').map(Number);
    const endDate = new Date(validatedData.availabilityDate);
    endDate.setHours(endHours, endMinutes, 0, 0);

    if (validatedData.createHourlySlots) {
      const hourDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

      if (hourDiff <= 0) {
        throw new Error('End time must be at least 1 hour after start time for hourly slots');
      }

      const batch = db.batch();
      let availabilityHourSlots = 0;

      for (let i = 0; i < hourDiff; i++) {
        const slotStart = new Date(startDate.getTime() + i * 60 * 60 * 1000);
        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

        const newAvailability = {
          startDateTime: slotStart,
          endDateTime: slotEnd,
          players: validatedData.players,
          price: validatedData.price,
          location: validatedData.location,
          type: validatedData.type,
          currency: 'GBP',
          status: 'available',
          createdBy: user.uid,
          createdAt: new Date()
        };

        const docRef = db.collection('availabilities').doc();
        batch.set(docRef, newAvailability);
        availabilityHourSlots++;
      }

      await batch.commit();

      revalidatePath('/admin/availability');
      return { success: true, count: availabilityHourSlots };
    } else {
      const newAvailability = {
        startDateTime: startDate,
        endDateTime: endDate,
        players: validatedData.players,
        price: validatedData.price,
        location: validatedData.location,
        type: validatedData.type,
        currency: 'GBP',
        status: 'available',
        createdBy: user.uid,
        createdAt: new Date()
      };

      const docRef = await db.collection('availabilities').add(newAvailability);

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

async function _createCheckoutSessionAction(
  formData: FormData,
  db: Firestore,
  _user: AuthenticatedUser
) {
  const rawData = {
    lesson: JSON.parse(formData.get('lesson') as string),
    userId: formData.get('userId') || undefined,
    userEmail: formData.get('userEmail') || undefined
  };

  const validatedData = CheckoutSessionSchema.parse(rawData);

  try {
    const lessonRef = db.collection('availabilities').doc(validatedData.lesson.id);
    const lessonDoc = await lessonRef.get();

    if (!lessonDoc.exists || lessonDoc.data()?.status !== 'available') {
      return { success: false, error: 'Lesson is no longer available' };
    }

    const startDateTime = new Date(validatedData.lesson.startDateTime.seconds * 1000);
    const endDateTime = new Date(validatedData.lesson.endDateTime.seconds * 1000);

    const date = startDateTime;
    const formattedDate = format(date, 'EEEE, MMMM d yyyy');
    const formattedStartTime = startDateTime
      .toLocaleTimeString('en-GB', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      .toUpperCase();
    const formattedEndTime = endDateTime
      .toLocaleTimeString('en-GB', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      .toUpperCase();

    const description = `
        ${formattedDate} | ${formattedStartTime} - ${formattedEndTime}
    `.trim();

    const pendingUntil = new Date(Date.now() + THIRTY_MINUTES);
    await lessonRef.update({
      status: 'pending',
      pendingUntil: pendingUntil,
      pendingSessionId: null
    });

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
            unit_amount: validatedData.lesson.price * 100
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

    await lessonRef.update({
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

async function _createBookingAction(formData: FormData, _db: Firestore, _user: AuthenticatedUser) {
  const rawData = {
    booking: JSON.parse(formData.get('booking') as string),
    userEmail: formData.get('userEmail') as string,
    sessionId: formData.get('sessionId') as string,
    userId: formData.get('userId') as string
  };

  try {
    const validatedData = CreateBookingSchema.parse(rawData);
    const newBooking = {
      startDateTime: new Date(validatedData.booking.startDateTime.seconds * 1000),
      endDateTime: new Date(validatedData.booking.endDateTime.seconds * 1000),
      location: validatedData.booking.location,
      userEmail: validatedData.userEmail,
      stripeSessionId: validatedData.sessionId,
      status: 'confirmed',
      createdAt: new Date(),
      userId: validatedData.userId
    };

    const docRef = await _db.collection('bookings').add(newBooking);

    if (validatedData.booking.id) {
      const availabilityRef = _db.collection('availabilities').doc(validatedData.booking.id);
      await availabilityRef.update({ status: 'booked' });
    }

    clearBookingsCache(validatedData.userId);

    revalidatePath('/confirmation');
    return { success: true, booking: { id: docRef.id } };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: 'Failed to create booking' };
  }
}

async function _setUserRoleAction(formData: FormData, _db: Firestore, _user: AuthenticatedUser) {
  const rawData = {
    uid: formData.get('uid') as string,
    role: formData.get('role') as string
  };

  try {
    const validatedData = SetUserRoleSchema.parse(rawData);
    const { getAdminAuth } = await import('@/lib/firebase-admin');
    const adminAuth = getAdminAuth();

    if (!adminAuth) {
      return { success: false, error: 'Authentication service unavailable' };
    }

    await adminAuth.setCustomUserClaims(validatedData.uid, { role: validatedData.role });

    return { success: true, message: `User role updated to ${validatedData.role}` };
  } catch (error) {
    console.error('Error setting user role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set user role'
    };
  }
}

export const createBookingAction = withAuth(_createBookingAction, false);
export const createAvailabilityAction = withAuth(_createAvailabilityAction, true);
export const createCheckoutSessionAction = withAuth(_createCheckoutSessionAction, false);
export const setUserRoleAction = withAuth(_setUserRoleAction, true);
