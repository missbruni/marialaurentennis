import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLessonFromParams } from './useLessonFromParams';
import type { Availability } from '@/services/availabilities';

const mockUseSearchParams = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useSearchParams: mockUseSearchParams
}));

describe('useLessonFromParams', () => {
  const mockAvailability: Availability = {
    id: 'lesson-1',
    startDateTime: {
      seconds: 1689415200,
      nanoseconds: 0,
      type: 'timestamp'
    } as any,
    endDateTime: {
      seconds: 1689418800,
      nanoseconds: 0,
      type: 'timestamp'
    } as any,
    location: 'sundridge',
    price: 50,
    status: 'available',
    players: 1,
    type: 'private'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns null when no lesson parameter is present', () => {
    const mockSearchParams = {
      get: vi.fn().mockReturnValue(null)
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useLessonFromParams());

    expect(result.current).toBeNull();
    expect(mockSearchParams.get).toHaveBeenCalledWith('lesson');
  });

  test('returns null when lesson parameter is empty string', () => {
    const mockSearchParams = {
      get: vi.fn().mockReturnValue('')
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useLessonFromParams());

    expect(result.current).toBeNull();
  });

  test('successfully parses valid lesson parameter', () => {
    const lessonJson = JSON.stringify(mockAvailability);
    const encodedLesson = Buffer.from(lessonJson).toString('base64');
    const urlEncodedLesson = encodeURIComponent(encodedLesson);

    const mockSearchParams = {
      get: vi.fn().mockReturnValue(urlEncodedLesson)
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useLessonFromParams());

    expect(result.current).toEqual(mockAvailability);
  });

  test('handles lesson parameter without URL encoding', () => {
    const lessonJson = JSON.stringify(mockAvailability);
    const encodedLesson = Buffer.from(lessonJson).toString('base64');

    const mockSearchParams = {
      get: vi.fn().mockReturnValue(encodedLesson)
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useLessonFromParams());

    expect(result.current).toEqual(mockAvailability);
  });

  test('returns null when lesson parameter is invalid base64', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const invalidBase64 = 'invalid-base64-string';

    const mockSearchParams = {
      get: vi.fn().mockReturnValue(invalidBase64)
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useLessonFromParams());

    expect(result.current).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to parse booking details:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('returns null when lesson parameter is invalid JSON', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const invalidJson = 'invalid-json';
    const encodedInvalidJson = Buffer.from(invalidJson).toString('base64');

    const mockSearchParams = {
      get: vi.fn().mockReturnValue(encodedInvalidJson)
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useLessonFromParams());

    expect(result.current).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to parse booking details:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('returns null when lesson parameter contains malformed data', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const malformedData = { invalid: 'data' };
    const encodedMalformedData = Buffer.from(JSON.stringify(malformedData)).toString('base64');

    const mockSearchParams = {
      get: vi.fn().mockReturnValue(encodedMalformedData)
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useLessonFromParams());

    expect(result.current).toEqual(malformedData);
    consoleSpy.mockRestore();
  });

  test('handles lesson parameter with special characters', () => {
    const lessonWithSpecialChars = {
      ...mockAvailability,
      location: 'tennis-court & sports-center'
    };
    const lessonJson = JSON.stringify(lessonWithSpecialChars);
    const encodedLesson = Buffer.from(lessonJson).toString('base64');
    const urlEncodedLesson = encodeURIComponent(encodedLesson);

    const mockSearchParams = {
      get: vi.fn().mockReturnValue(urlEncodedLesson)
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useLessonFromParams());

    expect(result.current).toEqual(lessonWithSpecialChars);
  });

  test('handles lesson parameter with unicode characters', () => {
    const lessonWithUnicode = {
      ...mockAvailability,
      location: 'tennis-court-éñ'
    };
    const lessonJson = JSON.stringify(lessonWithUnicode);
    const encodedLesson = Buffer.from(lessonJson).toString('base64');
    const urlEncodedLesson = encodeURIComponent(encodedLesson);

    const mockSearchParams = {
      get: vi.fn().mockReturnValue(urlEncodedLesson)
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useLessonFromParams());

    expect(result.current).toEqual(lessonWithUnicode);
  });

  test('handles lesson parameter with complex availability data', () => {
    const complexAvailability: Availability = {
      ...mockAvailability,
      id: 'complex-lesson-123',
      price: 75.5,
      players: 2,
      type: 'group',
      status: 'pending'
    };
    const lessonJson = JSON.stringify(complexAvailability);
    const encodedLesson = Buffer.from(lessonJson).toString('base64');
    const urlEncodedLesson = encodeURIComponent(encodedLesson);

    const mockSearchParams = {
      get: vi.fn().mockReturnValue(urlEncodedLesson)
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useLessonFromParams());

    expect(result.current).toEqual(complexAvailability);
  });

  test('memoizes result when lesson parameter does not change', () => {
    const lessonJson = JSON.stringify(mockAvailability);
    const encodedLesson = Buffer.from(lessonJson).toString('base64');

    const mockSearchParams = {
      get: vi.fn().mockReturnValue(encodedLesson)
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result, rerender } = renderHook(() => useLessonFromParams());

    const firstResult = result.current;

    rerender();

    expect(result.current).toBe(firstResult);
    expect(result.current).toEqual(mockAvailability);
  });

  test('updates result when lesson parameter changes', () => {
    const lessonJson1 = JSON.stringify(mockAvailability);
    const encodedLesson1 = Buffer.from(lessonJson1).toString('base64');

    const mockSearchParams = {
      get: vi.fn().mockReturnValue(encodedLesson1)
    };
    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result, rerender } = renderHook(() => useLessonFromParams());

    expect(result.current).toEqual(mockAvailability);

    const differentAvailability = { ...mockAvailability, id: 'lesson-2', price: 60 };
    const lessonJson2 = JSON.stringify(differentAvailability);
    const encodedLesson2 = Buffer.from(lessonJson2).toString('base64');

    mockSearchParams.get.mockReturnValue(encodedLesson2);

    rerender();

    expect(result.current).toEqual(differentAvailability);
  });
});
