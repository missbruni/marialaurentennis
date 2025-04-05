"use client";

import Hero from "@/components/Hero";
import BookingForm from "@/components/BookingForm";
import React from "react";

export default function HomePage() {
  const bookingRef = React.useRef<HTMLDivElement>(null);

  const handleScrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-start text-white">
      <Hero onBookLesson={handleScrollToBooking} />
      <div className="bg-gray-50 flex items-center w-full">
        <BookingForm bookingRef={bookingRef} />
      </div>
    </main>
  );
}
