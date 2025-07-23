import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import {
  doc,
  getDoc,
  updateDoc,
  deleteField,
  collection,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { getFirestore } from '../../../../lib/firebase';
import type { Availability } from '../../../../services/availabilities';
import { clearBookingsCache, clearAvailabilitiesCache } from '../../../../lib/data';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil'
});

async function createFailedBooking(
  session: Stripe.Checkout.Session,
  lessonData: Partial<Availability>,
  errorReason: string
) {
  const db = await getFirestore();
  const bookingsCollection = collection(db, 'bookings');
  const newBooking = {
    startDateTime: lessonData.startDateTime,
    endDateTime: lessonData.endDateTime,
    location: lessonData.location,
    type: lessonData.type,
    price: lessonData.price,
    status: 'failed',
    stripeId: session.id,
    createdAt: Timestamp.now(),
    userId: session.metadata?.user_id || null,
    userEmail: session.metadata?.user_email || null,
    failureReason: errorReason,
    refunded: true
  };

  await addDoc(bookingsCollection, newBooking);
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const lessonId = session.metadata?.lesson_id;

    if (!lessonId) {
      return NextResponse.json({ error: 'No lesson ID in session metadata' }, { status: 400 });
    }

    try {
      const db = await getFirestore();
      const lessonRef = doc(db, 'availabilities', lessonId);
      const lessonDoc = await getDoc(lessonRef);

      if (!lessonDoc.exists()) {
        await stripe.refunds.create({
          payment_intent: session.payment_intent as string,
          reason: 'requested_by_customer'
        });
        await createFailedBooking(session, {}, 'Lesson no longer exists');
        return NextResponse.json(
          {
            error: 'Lesson no longer exists, payment refunded'
          },
          { status: 400 }
        );
      }

      const lessonData = lessonDoc.data();

      if (lessonData.status === 'booked') {
        await stripe.refunds.create({
          payment_intent: session.payment_intent as string,
          reason: 'requested_by_customer'
        });
        await createFailedBooking(session, lessonData, 'Lesson was booked by someone else');
        return NextResponse.json(
          {
            error: 'Lesson was booked by someone else, payment refunded'
          },
          { status: 400 }
        );
      }

      if (lessonData.status === 'pending') {
        const pendingUntil = lessonData.pendingUntil?.toDate().getTime();
        const now = Date.now();
        const isSameSession = lessonData.pendingSessionId === session.id;

        if (!isSameSession && (!pendingUntil || now < pendingUntil)) {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            reason: 'requested_by_customer'
          });
          await createFailedBooking(session, lessonData, 'Lesson is pending for another player');
          return NextResponse.json(
            {
              error: 'Lesson is pending for another player, payment refunded',
              debug: {
                now,
                pendingUntil,
                isSameSession,
                sessionId: session.id,
                pendingSessionId: lessonData.pendingSessionId
              }
            },
            { status: 400 }
          );
        }
      }

      const bookingsCollection = collection(db, 'bookings');
      const newBooking = {
        startDateTime: lessonData.startDateTime,
        endDateTime: lessonData.endDateTime,
        location: lessonData.location,
        type: lessonData.type,
        price: lessonData.price,
        status: 'confirmed',
        stripeId: session.id,
        createdAt: Timestamp.now(),
        userId: session.metadata?.user_id || null,
        userEmail: session.metadata?.user_email || null
      };

      await addDoc(bookingsCollection, newBooking);

      await updateDoc(lessonRef, {
        status: 'booked',
        pendingUntil: deleteField(),
        pendingSessionId: deleteField()
      });

      const userId = session.metadata?.user_id;
      if (userId) {
        clearBookingsCache(userId);
      }
      clearAvailabilitiesCache();

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('Error processing checkout.session.completed webhook:', error);

      try {
        if (session?.payment_intent) {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            reason: 'requested_by_customer'
          });
        }
      } catch (refundError) {
        console.error('Error creating refund:', refundError);
      }

      return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
