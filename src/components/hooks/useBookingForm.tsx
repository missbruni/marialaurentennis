'use client';

import React from 'react';

type BookingFormContextType = {
  bookingFormRef: React.RefObject<HTMLDivElement | null>;
  scrollToBookingForm: () => void;
};

const BookingFormContext = React.createContext<BookingFormContextType | undefined>(undefined);

export function BookingFormProvider({ children }: { children: React.ReactNode }) {
  const bookingFormRef = React.useRef<HTMLDivElement>(null);

  const scrollToBookingForm = React.useCallback(() => {
    if (bookingFormRef.current) {
      bookingFormRef.current.scrollIntoView({ behavior: 'smooth' });
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
