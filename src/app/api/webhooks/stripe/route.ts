import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '../../../../lib/firebase-admin';
import type { Availability } from '../../../../services/availabilities';
import { clearBookingsCache } from '../../../../lib/data';

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil'
    });
  }
  return stripeInstance;
}

async function createFailedBooking(
  session: Stripe.Checkout.Session,
  lessonData: Partial<Availability>,
  errorReason: string
) {
  console.log('[WEBHOOK] Creating failed booking:', {
    sessionId: session.id,
    errorReason,
    lessonData: lessonData ? 'exists' : 'missing'
  });

  const db = getAdminFirestore();
  if (!db) {
    throw new Error('Firebase Admin not initialized');
  }

  const newBooking = {
    startDateTime: lessonData.startDateTime,
    endDateTime: lessonData.endDateTime,
    location: lessonData.location,
    type: lessonData.type,
    price: lessonData.price,
    status: 'failed',
    stripeId: session.id,
    createdAt: new Date(),
    userId: session.metadata?.user_id || null,
    userEmail: session.metadata?.user_email || null,
    failureReason: errorReason,
    refunded: true
  };

  await db.collection('bookings').add(newBooking);
  console.log('[WEBHOOK] Failed booking created successfully');
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('[WEBHOOK] Received webhook request at:', new Date().toISOString());

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    console.error('[WEBHOOK] No signature provided');
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  const body = await req.text();
  console.log('[WEBHOOK] Request body length:', body.length);

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log('[WEBHOOK] Event constructed successfully:', {
      type: event.type,
      id: event.id
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('[WEBHOOK] Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    console.log('[WEBHOOK] Processing checkout.session.completed event');
    const session = event.data.object as Stripe.Checkout.Session;
    const lessonId = session.metadata?.lesson_id;

    console.log('[WEBHOOK] Session details:', {
      sessionId: session.id,
      lessonId,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email,
      metadata: session.metadata
    });

    if (!lessonId) {
      console.error('[WEBHOOK] No lesson ID in session metadata');
      return NextResponse.json({ error: 'No lesson ID in session metadata' }, { status: 400 });
    }

    try {
      const db = getAdminFirestore();
      if (!db) {
        throw new Error('Firebase Admin not initialized');
      }

      console.log('[WEBHOOK] Fetching lesson from Firestore:', lessonId);
      const lessonRef = db.collection('availabilities').doc(lessonId);
      const lessonDoc = await lessonRef.get();

      if (!lessonDoc.exists) {
        console.error('[WEBHOOK] Lesson no longer exists:', lessonId);
        const stripe = getStripe();
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
      console.log('[WEBHOOK] Lesson data retrieved:', {
        lessonId,
        status: lessonData?.status,
        pendingSessionId: lessonData?.pendingSessionId,
        pendingUntil: lessonData?.pendingUntil?.toDate?.()
      });

      if (!lessonData) {
        console.error('[WEBHOOK] Lesson data is missing');
        const stripe = getStripe();
        await stripe.refunds.create({
          payment_intent: session.payment_intent as string,
          reason: 'requested_by_customer'
        });
        await createFailedBooking(session, {}, 'Lesson data is missing');
        return NextResponse.json(
          {
            error: 'Lesson data is missing, payment refunded'
          },
          { status: 400 }
        );
      }

      if (lessonData.status === 'booked') {
        console.error('[WEBHOOK] Lesson was already booked by someone else');
        const stripe = getStripe();
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
        const pendingUntil = lessonData.pendingUntil?.toDate?.()?.getTime();
        const now = Date.now();
        const isSameSession = lessonData.pendingSessionId === session.id;

        console.log('[WEBHOOK] Checking pending status:', {
          now,
          pendingUntil,
          isSameSession,
          sessionId: session.id,
          pendingSessionId: lessonData.pendingSessionId,
          timeRemaining: pendingUntil ? pendingUntil - now : 'no pending time'
        });

        if (!isSameSession && (!pendingUntil || now < pendingUntil)) {
          console.error('[WEBHOOK] Lesson is pending for another player');
          const stripe = getStripe();
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

      console.log('[WEBHOOK] Creating new booking');
      const newBooking = {
        startDateTime: lessonData.startDateTime,
        endDateTime: lessonData.endDateTime,
        location: lessonData.location,
        type: lessonData.type,
        price: lessonData.price,
        status: 'confirmed',
        stripeId: session.id,
        createdAt: new Date(),
        userId: session.metadata?.user_id || null,
        userEmail: session.metadata?.user_email || null
      };

      const bookingRef = await db.collection('bookings').add(newBooking);
      console.log('[WEBHOOK] Booking created successfully:', {
        bookingId: bookingRef.id,
        sessionId: session.id,
        userId: session.metadata?.user_id
      });

      console.log('[WEBHOOK] Updating lesson status to booked');
      await lessonRef.update({
        status: 'booked',
        pendingUntil: null,
        pendingSessionId: null
      });

      const userId = session.metadata?.user_id;
      if (userId) {
        console.log('[WEBHOOK] Clearing bookings cache for user:', userId);
        clearBookingsCache(userId);
      }

      const processingTime = Date.now() - startTime;
      console.log('[WEBHOOK] Webhook processed successfully in', processingTime, 'ms');

      return NextResponse.json({ received: true });
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('[WEBHOOK] Error processing checkout.session.completed webhook:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        processingTime,
        sessionId: session.id,
        lessonId
      });

      try {
        if (session?.payment_intent) {
          console.log('[WEBHOOK] Attempting to create refund for failed webhook');
          const stripe = getStripe();
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            reason: 'requested_by_customer'
          });
          console.log('[WEBHOOK] Refund created successfully');
        }
      } catch (refundError) {
        console.error('[WEBHOOK] Error creating refund:', refundError);
      }

      return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
    }
  }

  console.log('[WEBHOOK] Event type not handled:', event.type);
  return NextResponse.json({ received: true });
}
