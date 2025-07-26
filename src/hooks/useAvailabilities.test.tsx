import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAvailabilities } from './useAvailabilities';

vi.mock('@/lib/data', () => ({
  getAvailabilitiesData: vi.fn()
}));

vi.mock('@/lib/serialize', () => ({
  deserializeAvailabilities: vi.fn()
}));

const mockGetAvailabilitiesData = vi.hoisted(() => vi.fn());
const mockDeserializeAvailabilities = vi.hoisted(() => vi.fn());

vi.mock('@/lib/data', () => ({ getAvailabilitiesData: mockGetAvailabilitiesData }));
vi.mock('@/lib/serialize', () => ({ deserializeAvailabilities: mockDeserializeAvailabilities }));

describe('useAvailabilities', () => {
  let queryClient: QueryClient;

  const mockAvailabilities = [
    {
      id: '1',
      startDateTime: {
        toDate: () => new Date('2023-07-15T10:00:00'),
        toMillis: () => 1689415200000,
        isEqual: () => false,
        toJSON: () => ({ seconds: 1689415200, nanoseconds: 0, type: 'timestamp' }),
        valueOf: () => '1689415200',
        seconds: 1689415200,
        nanoseconds: 0
      },
      endDateTime: {
        toDate: () => new Date('2023-07-15T11:00:00'),
        toMillis: () => 1689418800000,
        isEqual: () => false,
        toJSON: () => ({ seconds: 1689418800, nanoseconds: 0, type: 'timestamp' }),
        valueOf: () => '1689418800',
        seconds: 1689418800,
        nanoseconds: 0
      },
      location: 'sundridge',
      price: 50,
      status: 'available',
      players: 1,
      type: 'private'
    }
  ];

  const mockSerializedAvailabilities = [
    {
      id: '1',
      startDateTime: { seconds: 1689415200, nanoseconds: 0 },
      endDateTime: { seconds: 1689418800, nanoseconds: 0 },
      location: 'sundridge',
      price: 50,
      status: 'available' as const,
      players: 1,
      type: 'private'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  test('returns loading state initially', () => {
    mockGetAvailabilitiesData.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useAvailabilities(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.availabilities).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  test('returns availabilities when data is fetched successfully', async () => {
    mockGetAvailabilitiesData.mockResolvedValue(mockAvailabilities);

    const { result } = renderHook(() => useAvailabilities(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.availabilities).toEqual(mockAvailabilities);
    expect(result.current.error).toBeNull();
    expect(mockGetAvailabilitiesData).toHaveBeenCalledTimes(1);
  });

  test('returns error when data fetching fails', async () => {
    const mockError = new Error('Failed to fetch availabilities');
    mockGetAvailabilitiesData.mockRejectedValue(mockError);

    const { result } = renderHook(() => useAvailabilities(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.availabilities).toBeUndefined();
    expect(result.current.error).toBeDefined();
  });

  test('uses initial data when provided', () => {
    mockDeserializeAvailabilities.mockReturnValue(mockAvailabilities);

    const { result } = renderHook(
      () => useAvailabilities({ initialData: mockSerializedAvailabilities }),
      { wrapper }
    );

    expect(result.current.availabilities).toEqual(mockAvailabilities);
    expect(mockDeserializeAvailabilities).toHaveBeenCalledWith(mockSerializedAvailabilities);
  });

  test('does not use initial data when not provided', () => {
    const { result } = renderHook(() => useAvailabilities(), { wrapper });

    expect(result.current.availabilities).toBeUndefined();
    expect(mockDeserializeAvailabilities).not.toHaveBeenCalled();
  });

  test('refreshAvailabilities invalidates queries and refetches', async () => {
    mockGetAvailabilitiesData.mockResolvedValue(mockAvailabilities);

    const { result } = renderHook(() => useAvailabilities(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockGetAvailabilitiesData.mockClear();

    result.current.refreshAvailabilities();

    await waitFor(() => {
      expect(mockGetAvailabilitiesData).toHaveBeenCalled();
    });
  });

  test('handles empty availabilities array', async () => {
    mockGetAvailabilitiesData.mockResolvedValue([]);

    const { result } = renderHook(() => useAvailabilities(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.availabilities).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  test('handles null availabilities', async () => {
    mockGetAvailabilitiesData.mockResolvedValue(null);

    const { result } = renderHook(() => useAvailabilities(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.availabilities).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('caches data and does not refetch unnecessarily', async () => {
    mockGetAvailabilitiesData.mockResolvedValue(mockAvailabilities);

    const { result: result1 } = renderHook(() => useAvailabilities(), { wrapper });

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false);
    });

    const { result: result2 } = renderHook(() => useAvailabilities(), { wrapper });

    await waitFor(() => {
      expect(result2.current.isLoading).toBe(false);
    });

    expect(mockGetAvailabilitiesData).toHaveBeenCalled();
    expect(result1.current.availabilities).toEqual(result2.current.availabilities);
  });

  test('handles network errors gracefully', async () => {
    const networkError = new Error('Network error');
    mockGetAvailabilitiesData.mockRejectedValue(networkError);

    const { result } = renderHook(() => useAvailabilities(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.availabilities).toBeUndefined();
  });

  test('handles timeout errors', async () => {
    const timeoutError = new Error('Request timeout');
    mockGetAvailabilitiesData.mockRejectedValue(timeoutError);

    const { result } = renderHook(() => useAvailabilities(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.availabilities).toBeUndefined();
  });
});
