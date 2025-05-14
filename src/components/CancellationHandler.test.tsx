import { describe, test, expect, vi, beforeEach, type Mock } from 'vitest';
import { render } from '@/lib/test-utils';
import CancellationHandler from './CancellationHandler';
import { releaseAvailability } from '@/services/availabilities';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

vi.mock('@/services/availabilities', () => ({
  releaseAvailability: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
  usePathname: vi.fn().mockReturnValue('/')
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn().mockReturnValue({
    invalidateQueries: vi.fn()
  }),
  QueryClient: vi.fn().mockImplementation(() => ({
    invalidateQueries: vi.fn()
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('CancellationHandler', () => {
  const mockReplace = vi.fn();
  const mockInvalidateQueries = vi.fn();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mocks
    (useRouter as unknown as Mock).mockReturnValue({
      replace: mockReplace
    });

    (useSearchParams as unknown as Mock).mockReturnValue({
      get: mockGet
    });

    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: mockInvalidateQueries
    } as any);
  });

  test('should not call releaseAvailability when no releaseLesson param exists', () => {
    mockGet.mockReturnValue(null);

    render(<CancellationHandler />);

    expect(releaseAvailability).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('should call releaseAvailability when releaseLesson param exists', async () => {
    const lessonId = 'test-lesson-id';
    mockGet.mockReturnValue(lessonId);

    render(<CancellationHandler />);

    await vi.waitFor(() => {
      expect(releaseAvailability).toHaveBeenCalledWith(lessonId);
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['availabilities'] });
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });
});
