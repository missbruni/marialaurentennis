import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import { formatTime } from '@/lib/date';
import { Availability } from '../../../services/availabilities';
import { Timestamp } from 'firebase/firestore';
import { capitalizeWords } from '../../../lib/string';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil'
});

export async function POST(req: NextRequest) {
  try {
    const { lesson } = (await req.json()) as { lesson: Availability };

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

    const encodedLesson = encodeURIComponent(
      Buffer.from(JSON.stringify(lesson)).toString('base64')
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: capitalizeWords(`${lesson.type} Tennis Lesson - ${lesson.location}`),
              description,
              metadata: {
                location: lesson.location,
                lesson_date: formattedDate,
                lesson_time: `${formattedStartTime} - ${formattedEndTime}`,
                source: 'mlt-tennis-app'
              }
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
        source: 'mlt-tennis-app'
      },
      success_url: `${req.nextUrl.origin}/success?lesson=${encodedLesson}&sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/error`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
