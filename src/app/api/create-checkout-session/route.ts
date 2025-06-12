import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import { formatTime } from '@/lib/date';
import { Availability } from '../../../services/availabilities';
import { doc, getDoc, Timestamp, updateDoc, deleteField } from 'firebase/firestore';
import { capitalizeWords } from '../../../lib/string';
import { db } from '../../../lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil'
});

const THIRTY_MINUTES = 30 * 60 * 1000;
const THIRTY_MINUTES_IN_SECONDS = 30 * 60;

export async function POST(req: NextRequest) {
  try {
    const { lesson, userId, userEmail } = (await req.json()) as { lesson: Availability, userId: string, userEmail: string };

    const lessonRef = doc(db, 'availabilities', lesson.id);
    const lessonDoc = await getDoc(lessonRef);
  
    if (!lessonDoc.exists() || lessonDoc.data()?.status !== 'available') {
      return NextResponse.json({ error: 'Lesson is no longer available' }, { status: 400 });
    }

    const startDateTime = new Timestamp(
      lesson.startDateTime.seconds,
      lesson.startDateTime.nanoseconds
    );
    const endDateTime = new Timestamp(lesson.endDateTime.seconds, lesson.endDateTime.nanoseconds);

    const date = startDateTime.toDate();
    const formattedDate = format(date, 'EEEE, MMMM d yyyy');
    const formattedStartTime = formatTime(startDateTime);
    const formattedEndTime = formatTime(endDateTime);

    const description = `
        ${formattedDate} | ${formattedStartTime} - ${formattedEndTime}
    `.trim();

    const availabilityRef = doc(db, 'availabilities', lesson.id);
    const pendingUntil = new Date(Date.now() + THIRTY_MINUTES);
    await updateDoc(availabilityRef, {
      status: 'pending',
      pendingUntil: Timestamp.fromDate(pendingUntil),
      pendingSessionId: null
    });

    const encodedLesson = encodeURIComponent(
      Buffer.from(JSON.stringify(lesson)).toString('base64')
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
              name: capitalizeWords(`${lesson.type} Tennis Lesson - ${lesson.location}`),
              description,
            },
            unit_amount: lesson.price * 100 // Stripe expects amount in pence
          },
          quantity: 1
        }
      ],
      metadata: {
        lesson_id: lesson.id,
        lesson_date: formattedDate,
        lesson_time: `${formattedStartTime} - ${formattedEndTime}`,
        location: lesson.location,
        source: 'mlt-tennis-app',
        timestamp: currentTimestamp.toString(),
        user_id: userId,
        user_email: userEmail
      },
      success_url: `${req.nextUrl.origin}/confirmation?lesson=${encodedLesson}&sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}?releaseLesson=${lesson.id}`
    });

    await updateDoc(availabilityRef, {
      pendingSessionId: session.id
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}