import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteField, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil'
});

async function createFailedBooking(
  session: Stripe.Checkout.Session,
  lessonData: any,
  errorReason: string
) {
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
      console.log('Webhook debug - No lesson ID found in metadata:', session.metadata);
      return NextResponse.json({ error: 'No lesson ID in session metadata' }, { status: 400 });
    }

    // Get the lesson
    const lessonRef = doc(db, 'availabilities', lessonId);
    const lessonDoc = await getDoc(lessonRef);
    
    if (!lessonDoc.exists()) {
      // Lesson doesn't exist anymore
      await stripe.refunds.create({
        payment_intent: session.payment_intent as string,
        reason: 'requested_by_customer'
      });
      await createFailedBooking(session, {}, 'Lesson no longer exists');
      return NextResponse.json({ 
        error: 'Lesson no longer exists, payment refunded' 
      }, { status: 400 });
    }

    const lessonData = lessonDoc.data();
    
    if (lessonData.status === 'booked') {
      // Lesson was booked by someone else
      await stripe.refunds.create({
        payment_intent: session.payment_intent as string,
        reason: 'requested_by_customer'
      });
      await createFailedBooking(session, lessonData, 'Lesson was booked by someone else');
      return NextResponse.json({ 
        error: 'Lesson was booked by someone else, payment refunded' 
      }, { status: 400 });
    }

    if (lessonData.status === 'pending') {
      const pendingUntil = lessonData.pendingUntil?.toDate().getTime();
      const now = Date.now();
      const isSameSession = lessonData.pendingSessionId === session.id;
      
      console.log('Webhook debug - Pending check:', {
        now,
        pendingUntil,
        isStillPending: pendingUntil && now < pendingUntil,
        isSameSession,
        sessionId: session.id,
        pendingSessionId: lessonData.pendingSessionId,
        sessionMetadata: session.metadata,
        lessonData: {
          status: lessonData.status,
          pendingUntil: lessonData.pendingUntil,
          pendingSessionId: lessonData.pendingSessionId
        }
      });
      
      if (isSameSession) {
        console.log('Webhook debug - This is the same session that created the pending status');
        // This is the same session, proceed with booking
      } else if (pendingUntil && now >= pendingUntil) {
        console.log('Webhook debug - Pending status has expired');
        // The pending status has expired, we can proceed with the booking
      } else {
        console.log('Webhook debug - Lesson is still pending for another session');
        // This is a different pending session
        await stripe.refunds.create({
          payment_intent: session.payment_intent as string,
          reason: 'requested_by_customer'
        });
        await createFailedBooking(session, lessonData, 'Lesson is pending for another customer');
        return NextResponse.json({ 
          error: 'Lesson is pending for another customer, payment refunded',
          debug: {
            now,
            pendingUntil,
            isSameSession,
            sessionId: session.id,
            pendingSessionId: lessonData.pendingSessionId
          }
        }, { status: 400 });
      }
    }

    // If we get here, either:
    // 1. The lesson was available (not pending)
    // 2. The lesson was pending but this is the same session that created it
    // 3. The lesson was pending but the pending status has expired
    console.log('Webhook debug - Proceeding with booking:', {
      lessonId,
      sessionId: session.id,
      status: lessonData.status,
      pendingSessionId: lessonData.pendingSessionId
    });
    
    // Create a booking document
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
    
    // Update the availability document
    await updateDoc(lessonRef, {
      status: 'booked',
      pendingUntil: deleteField(),
      pendingSessionId: deleteField()
    });

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
} 