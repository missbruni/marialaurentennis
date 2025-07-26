import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '../../../../lib/firebase-admin';
import { logger } from '../../../../lib/logger';
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
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  const body = await req.text();

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const error = err as Error;
    logger.paymentFailure('stripeWebhookSignature', error, {
      action: 'stripeWebhookSignature'
    });
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const lessonId = session.metadata?.lesson_id;

    if (!lessonId) {
      return NextResponse.json({ error: 'No lesson ID in session metadata' }, { status: 400 });
    }

    try {
      const db = getAdminFirestore();
      if (!db) {
        throw new Error('Firebase Admin not initialized');
      }

      const lessonRef = db.collection('availabilities').doc(lessonId);
      const lessonDoc = await lessonRef.get();

      if (!lessonDoc.exists) {
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

      if (!lessonData) {
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

        if (!isSameSession && (!pendingUntil || now < pendingUntil)) {
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

      await db.collection('bookings').add(newBooking);

      await lessonRef.update({
        status: 'booked',
        pendingUntil: null,
        pendingSessionId: null
      });

      const userId = session.metadata?.user_id;
      if (userId) {
        clearBookingsCache(userId);
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      logger.paymentFailure(
        'processCheckoutSession',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          action: 'processCheckoutSession',
          sessionId: session.id,
          lessonId: session.metadata?.lesson_id,
          userId: session.metadata?.user_id,
          userEmail: session.metadata?.user_email
        }
      );

      try {
        if (session?.payment_intent) {
          const stripe = getStripe();
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            reason: 'requested_by_customer'
          });
        }
      } catch (refundError) {
        logger.paymentFailure(
          'createRefund',
          refundError instanceof Error ? refundError : new Error('Unknown refund error'),
          {
            action: 'createRefund',
            sessionId: session.id,
            paymentIntent: session.payment_intent as string
          }
        );
      }

      return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
