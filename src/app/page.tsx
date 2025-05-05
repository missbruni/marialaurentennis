'use client';

import Hero from '@/components/Hero';
import BookingForm from '@/components/BookingForm';
import React from 'react';
import ContactForm from '../components/ContactForm';

export default function HomePage() {
  return (
    <main className="relative w-full flex flex-col items-center justify-start">
      <Hero />
      <div className="bg-background flex items-center w-full">
        <BookingForm />
      </div>
      <div className="w-full">
        <ContactForm />
      </div>
    </main>
  );
}
