'use client';

import React from 'react';
import { HEADER_HEIGHT } from '../components/AppBar';

type SectionRefContextType = {
  bookingFormRef: React.RefObject<HTMLDivElement | null>;
  contactRef: React.RefObject<HTMLDivElement | null>;
  scrollToBookingForm: () => void;
  scrollToContact: () => void;
};

const SectionRefContext = React.createContext<SectionRefContextType | undefined>(undefined);

export function SectionRefProvider({ children }: { children: React.ReactNode }) {
  const bookingFormRef = React.useRef<HTMLDivElement>(null);
  const contactRef = React.useRef<HTMLDivElement>(null);

  const scrollToSection = React.useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const headerOffset = HEADER_HEIGHT;
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      console.warn('Section reference is not available');
    }
  }, []);

  const scrollToBookingForm = React.useCallback(() => {
    scrollToSection(bookingFormRef);
  }, [scrollToSection]);

  const scrollToContact = React.useCallback(() => {
    scrollToSection(contactRef);
  }, [scrollToSection]);

  return (
    <SectionRefContext.Provider
      value={{ bookingFormRef, contactRef, scrollToBookingForm, scrollToContact }}
    >
      {children}
    </SectionRefContext.Provider>
  );
}

export function useSectionRef() {
  const context = React.useContext(SectionRefContext);

  if (context === undefined) {
    throw new Error('useSectionRef must be used within a SectionRefProvider');
  }

  return context;
}
