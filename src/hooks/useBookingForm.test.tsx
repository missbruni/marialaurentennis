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

    const mockGetBoundingClientRect = vi.fn().mockReturnValue({ top: 100 });
    const mockScrollTo = vi.fn();

    const originalScrollTo = window.scrollTo;

    window.scrollTo = mockScrollTo;
    Object.defineProperty(window, 'pageYOffset', { value: 50, configurable: true });

    Object.defineProperty(result.current.bookingFormRef, 'current', {
      value: {
        getBoundingClientRect: mockGetBoundingClientRect
      },
      writable: true
    });

    result.current.scrollToBookingForm();

    expect(mockGetBoundingClientRect).toHaveBeenCalled();
    expect(mockScrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: 'smooth'
    });

    window.scrollTo = originalScrollTo;
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
