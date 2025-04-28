'use client';

import React from 'react';
import { HEADER_HEIGHT } from '../components/AppBar';

type BookingFormContextType = {
  bookingFormRef: React.RefObject<HTMLDivElement | null>;
  scrollToBookingForm: () => void;
};

const BookingFormContext = React.createContext<BookingFormContextType | undefined>(undefined);

export function BookingFormProvider({ children }: { children: React.ReactNode }) {
  const bookingFormRef = React.useRef<HTMLDivElement>(null);

  const scrollToBookingForm = React.useCallback(() => {
    if (bookingFormRef.current) {
      const headerOffset = HEADER_HEIGHT;
      const elementPosition = bookingFormRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      console.warn('Booking form reference is not available');
    }
  }, []);

  return (
    <BookingFormContext.Provider value={{ bookingFormRef, scrollToBookingForm }}>
      {children}
    </BookingFormContext.Provider>
  );
}

export function useBookingForm() {
  const context = React.useContext(BookingFormContext);

  if (context === undefined) {
    throw new Error('useBookingForm must be used within a BookingFormProvider');
  }

  return context;
}
