'use client';

import Hero from '@/components/Hero';
import BookingForm from '@/components/BookingForm';
import React from 'react';
import AppBar from '../components/AppBar';

export default function HomePage() {
  const bookingRef = React.useRef<HTMLDivElement>(null);

  const handleScrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-start">
      <AppBar onBookLesson={handleScrollToBooking} />
      <Hero onBookLesson={handleScrollToBooking} />
      <div className="bg-background flex items-center w-full">
        <BookingForm bookingRef={bookingRef} />
      </div>
    </main>
  );
}
