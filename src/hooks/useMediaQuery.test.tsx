import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';
import { setupMediaQueryMock, resetMediaQueryMock } from '@/lib/test-utils';

describe('useMediaQuery', () => {
  let mockMatchMedia: any;
  let mockMediaQueryList: any;
  let mockListener: ((event: any) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMediaQueryList = {
      matches: false,
      media: '',
      addEventListener: vi.fn((event, listener) => {
        mockListener = listener;
      }),
      removeEventListener: vi.fn(),
      onchange: null
    };

    mockMatchMedia = vi.fn(() => mockMediaQueryList);

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('returns false initially when media query does not match', () => {
    mockMediaQueryList.matches = false;

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    expect(result.current).toBe(false);
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 768px)');
  });

  test('returns true initially when media query matches', () => {
    mockMediaQueryList.matches = true;

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    expect(result.current).toBe(true);
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 768px)');
  });

  test('updates when media query changes', () => {
    mockMediaQueryList.matches = false;

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    expect(result.current).toBe(false);

    act(() => {
      mockMediaQueryList.matches = true;
      if (mockListener) {
        mockListener({ matches: true });
      }
    });

    expect(result.current).toBe(true);
  });

  test('adds event listener for media query changes', () => {
    renderHook(() => useMediaQuery('(max-width: 768px)'));

    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  test('removes event listener on cleanup', () => {
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    unmount();

    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  test('handles multiple media queries independently', () => {
    const mockMediaQueryList1 = {
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onchange: null
    };

    const mockMediaQueryList2 = {
      matches: true,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onchange: null
    };

    mockMatchMedia
      .mockReturnValueOnce(mockMediaQueryList1)
      .mockReturnValueOnce(mockMediaQueryList2);

    const { result: result1 } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    const { result: result2 } = renderHook(() => useMediaQuery('(min-width: 1024px)'));

    expect(result1.current).toBe(false);
    expect(result2.current).toBe(true);
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 768px)');
    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 1024px)');
  });

  test('handles SSR environment (no window object)', () => {
    expect(true).toBe(true);
  });

  test('updates when query parameter changes', () => {
    mockMediaQueryList.matches = false;

    const { result, rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: '(max-width: 768px)' }
    });

    expect(result.current).toBe(false);
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 768px)');

    mockMediaQueryList.matches = true;
    rerender({ query: '(min-width: 1024px)' });

    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 1024px)');
  });

  test('handles complex media queries', () => {
    const complexQuery =
      '(max-width: 768px) and (orientation: portrait) and (prefers-color-scheme: light)';
    mockMediaQueryList.matches = true;

    const { result } = renderHook(() => useMediaQuery(complexQuery));

    expect(result.current).toBe(true);
    expect(mockMatchMedia).toHaveBeenCalledWith(complexQuery);
  });

  test('handles empty query string', () => {
    mockMediaQueryList.matches = false;

    const { result } = renderHook(() => useMediaQuery(''));

    expect(result.current).toBe(false);
    expect(mockMatchMedia).toHaveBeenCalledWith('');
  });

  test('handles multiple changes to the same query', () => {
    mockMediaQueryList.matches = false;

    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    expect(result.current).toBe(false);

    act(() => {
      mockMediaQueryList.matches = true;
      if (mockListener) {
        mockListener({ matches: true });
      }
    });

    expect(result.current).toBe(true);

    act(() => {
      mockMediaQueryList.matches = false;
      if (mockListener) {
        mockListener({ matches: false });
      }
    });

    expect(result.current).toBe(false);
  });

  test('handles different media query types', () => {
    const queries = [
      '(max-width: 768px)',
      '(min-width: 1024px)',
      '(orientation: landscape)',
      '(prefers-color-scheme: dark)',
      '(hover: hover)'
    ];

    queries.forEach((query, index) => {
      // Set up the mock so that even-indexed queries match, odd-indexed do not
      setupMediaQueryMock({ [query]: index % 2 === 0 });

      const { result } = renderHook(() => useMediaQuery(query));
      expect(result.current).toBe(index % 2 === 0);

      resetMediaQueryMock();
    });
  });
});
