import Hero from '@/components/Hero';
import BookingForm from '@/components/BookingForm';
import React from 'react';
import ContactForm from '../components/ContactForm';
import SuspenseLoading from '../components/SuspenseLoading';
import CancellationHandler from '@/components/CancellationHandler';
import { BookingStatusProvider } from '@/components/BookingStatusProvider';

export default function HomePage() {
  return (
    <main className="relative flex w-full flex-col items-center justify-start">
      <SuspenseLoading>
        <BookingStatusProvider>
          <CancellationHandler />
        </BookingStatusProvider>
      </SuspenseLoading>

      <Hero />
      <div className="bg-background flex w-full items-center">
        <BookingForm />
      </div>
      <div className="w-full">
        <ContactForm />
      </div>
    </main>
  );
}
