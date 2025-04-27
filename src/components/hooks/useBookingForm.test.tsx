import React from 'react';
import { renderHook } from '@testing-library/react';
import { BookingFormProvider, useBookingForm } from './useBookingForm';
import { beforeEach, afterEach, vi, describe, test, expect } from 'vitest';

const originalConsoleWarn = console.warn;
beforeEach(() => {
  console.warn = vi.fn();
});
afterEach(() => {
  console.warn = originalConsoleWarn;
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BookingFormProvider>{children}</BookingFormProvider>
);

describe('useBookingForm', () => {
  test('should throw error when used outside of BookingFormProvider', () => {
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useBookingForm());
    }).toThrow('useBookingForm must be used within a BookingFormProvider');

    console.error = originalError;
  });

  test('should provide bookingFormRef and scrollToBookingForm', () => {
    const { result } = renderHook(() => useBookingForm(), { wrapper });

    expect(result.current.bookingFormRef).toBeDefined();
    expect(typeof result.current.scrollToBookingForm).toBe('function');
  });

  test('scrollToBookingForm should call scrollIntoView when ref is available', () => {
    const { result } = renderHook(() => useBookingForm(), { wrapper });

    const mockScrollIntoView = vi.fn();
    Object.defineProperty(result.current.bookingFormRef, 'current', {
      value: {
        scrollIntoView: mockScrollIntoView
      },
      writable: true
    });

    result.current.scrollToBookingForm();

    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  test('scrollToBookingForm should log warning when ref is not available', () => {
    const { result } = renderHook(() => useBookingForm(), { wrapper });

    Object.defineProperty(result.current.bookingFormRef, 'current', {
      value: null,
      writable: true
    });

    result.current.scrollToBookingForm();

    expect(console.warn).toHaveBeenCalledWith('Booking form reference is not available');
  });
});
