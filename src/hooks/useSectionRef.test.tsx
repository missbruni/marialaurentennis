import React from 'react';
import { renderHook } from '@testing-library/react';
import { SectionRefProvider, useSectionRef } from './useSectionRef';
import { beforeEach, afterEach, vi, describe, test, expect } from 'vitest';

const originalConsoleWarn = console.warn;
beforeEach(() => {
  console.warn = vi.fn();
});
afterEach(() => {
  console.warn = originalConsoleWarn;
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SectionRefProvider>{children}</SectionRefProvider>
);

describe('useSectionRef', () => {
  test('should throw error when used outside of BookingFormProvider', () => {
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      renderHook(() => useSectionRef());
    }).toThrow('useSectionRef must be used within a SectionRefProvider');

    console.error = originalError;
  });

  test('should provide bookingFormRef and scrollToBookingForm', () => {
    const { result } = renderHook(() => useSectionRef(), { wrapper });

    expect(result.current.bookingFormRef).toBeDefined();
    expect(typeof result.current.scrollToBookingForm).toBe('function');
  });

  test('scrollToBookingForm should call scrollIntoView when ref is available', () => {
    const { result } = renderHook(() => useSectionRef(), { wrapper });

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
    const { result } = renderHook(() => useSectionRef(), { wrapper });

    Object.defineProperty(result.current.bookingFormRef, 'current', {
      value: null,
      writable: true
    });

    result.current.scrollToBookingForm();

    expect(console.warn).toHaveBeenCalledWith('Section reference is not available');
  });
});
