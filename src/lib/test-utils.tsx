import React from 'react';
import { ThemeProvider } from 'next-themes';
import { vi } from 'vitest';

import { ReactQueryProvider } from './react-query';
import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionRefProvider } from '@/hooks/useSectionRef';
import { AuthProvider } from '@/hooks/useAuth';
import { LoginDialogProvider } from '@/providers/LoginDialogProvider';

import MockDate from 'mockdate';

export const MEDIA_QUERIES = {
  MOBILE: '(max-width: 767px)',
  TABLET: '(min-width: 768px) and (max-width: 1023px)',
  DESKTOP: '(min-width: 1024px)',
  LARGE_DESKTOP: '(min-width: 1440px)'
} as const;

export type MediaQueryType = keyof typeof MEDIA_QUERIES;

let mockMatchMedia: ReturnType<typeof vi.fn>;
let currentMediaQueryState: Record<string, boolean> = {};
let mediaQueryListCache: Record<string, any> = {};

/**
 * Set up media query mocking for tests
 * @param initialState - Initial state for media queries
 */
export const setupMediaQueryMock = (initialState: Record<string, boolean> = {}) => {
  currentMediaQueryState = { ...initialState };
  mediaQueryListCache = {};

  mockMatchMedia = vi.fn().mockImplementation((query: string) => {
    // Return cached object if it exists, otherwise create new one
    if (!mediaQueryListCache[query]) {
      const matches = currentMediaQueryState[query] ?? false;

      mediaQueryListCache[query] = {
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      };
    }

    return mediaQueryListCache[query];
  });

  // Override the global mock with our test-specific mock
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia
  });
};

/**
 * Update media query state during tests
 * @param query - The media query to update
 * @param matches - Whether the query should match
 */
export const updateMediaQuery = (query: string, matches: boolean) => {
  currentMediaQueryState[query] = matches;

  if (mediaQueryListCache[query]) {
    mediaQueryListCache[query].matches = matches;
  }

  if (mockMatchMedia) {
    const mockMediaQueryList = mockMatchMedia(query);

    if (mockMediaQueryList.addEventListener.mock.calls.length > 0) {
      const changeEvent = new Event('change');
      mockMediaQueryList.addEventListener.mock.calls.forEach(
        ([event, callback]: [string, Function]) => {
          if (event === 'change') {
            // Create a proper MediaQueryListEvent
            const mediaQueryListEvent = {
              ...changeEvent,
              matches,
              media: query,
              target: mockMediaQueryList
            } as MediaQueryListEvent;

            callback(mediaQueryListEvent);
          }
        }
      );
    }
  }
};

/**
 * Reset media query mocking
 */
export const resetMediaQueryMock = () => {
  currentMediaQueryState = {};
  mediaQueryListCache = {};
  if (mockMatchMedia) {
    mockMatchMedia.mockClear();
  }
};

/**
 * Test utilities for common media query scenarios
 */
export const mediaQueryTestUtils = {
  /**
   * Test mobile viewport
   */
  mobile: () => {
    setupMediaQueryMock({
      [MEDIA_QUERIES.MOBILE]: true,
      [MEDIA_QUERIES.TABLET]: false,
      [MEDIA_QUERIES.DESKTOP]: false,
      [MEDIA_QUERIES.LARGE_DESKTOP]: false
    });
  },

  /**
   * Test tablet viewport
   */
  tablet: () => {
    setupMediaQueryMock({
      [MEDIA_QUERIES.MOBILE]: false,
      [MEDIA_QUERIES.TABLET]: true,
      [MEDIA_QUERIES.DESKTOP]: false,
      [MEDIA_QUERIES.LARGE_DESKTOP]: false
    });
  },

  /**
   * Test desktop viewport
   */
  desktop: () => {
    setupMediaQueryMock({
      [MEDIA_QUERIES.MOBILE]: false,
      [MEDIA_QUERIES.TABLET]: false,
      [MEDIA_QUERIES.DESKTOP]: true,
      [MEDIA_QUERIES.LARGE_DESKTOP]: false
    });
  },

  /**
   * Test large desktop viewport
   */
  largeDesktop: () => {
    setupMediaQueryMock({
      [MEDIA_QUERIES.MOBILE]: false,
      [MEDIA_QUERIES.TABLET]: false,
      [MEDIA_QUERIES.DESKTOP]: true,
      [MEDIA_QUERIES.LARGE_DESKTOP]: true
    });
  }
};

export const TEST_DATES = {
  // Use dynamic dates relative to current date
  TODAY: new Date(),
  TOMORROW: new Date(Date.now() + 24 * 60 * 60 * 1000), // +1 day
  NEXT_WEEK: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
  NEXT_MONTH: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
  // For tests that need a fixed reference point, use a recent date
  FIXED_DATE: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  PAST_DATE: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
  FUTURE_DATE: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  // For booking tests, use tomorrow and day after tomorrow
  BOOKING_DATE: new Date(Date.now() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // tomorrow 10am
  BOOKING_DATE_END: new Date(Date.now() + 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // tomorrow 11am
  BOOKING_DATE_NEXT: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // day after tomorrow 2pm
  BOOKING_DATE_NEXT_END: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000) // day after tomorrow 3pm
} as const;

/**
 * Set up MockDate with a fixed date for consistent testing
 * @param date - The date to mock (defaults to FIXED_DATE)
 */
export const setupMockDate = (date: Date = TEST_DATES.FIXED_DATE) => {
  MockDate.set(date);
};

/**
 * Reset MockDate to real time
 */
export const resetMockDate = () => {
  MockDate.reset();
};

/**
 * Create a mock Firestore timestamp
 */
export const createMockTimestamp = (date: Date) => ({
  toDate: () => date,
  toMillis: () => date.getTime(),
  isEqual: () => false,
  toJSON: () => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: (date.getTime() % 1000) * 1000000,
    type: 'timestamp'
  }),
  valueOf: () => Math.floor(date.getTime() / 1000).toString(),
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: (date.getTime() % 1000) * 1000000
});

/**
 * Create a mock availability object with timestamps
 */
export const createMockAvailability = (
  id: string,
  startDate: Date,
  endDate: Date,
  options: {
    price?: number;
    location?: string;
    players?: number;
    type?: string;
    status?: string;
  } = {}
) => ({
  id,
  startDateTime: createMockTimestamp(startDate),
  endDateTime: createMockTimestamp(endDate),
  price: options.price ?? 45,
  location: options.location ?? 'sundridge',
  players: options.players ?? 1,
  type: options.type ?? 'private',
  status: options.status ?? 'available'
});

function customRender(ui: React.ReactElement) {
  const user = userEvent.setup();
  const result = render(ui, {
    wrapper: ({ children }) => (
      <ReactQueryProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <LoginDialogProvider>
              <SectionRefProvider>{children}</SectionRefProvider>
            </LoginDialogProvider>
          </AuthProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    )
  });

  return {
    ...result,
    user
  };
}

// Helper function to wait for auth state to settle
async function waitForAuth() {
  await act(async () => {
    // Wait for the next tick to allow auth state to settle
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
}

// Helper function to render and wait for auth initialization
async function renderWithAuth(ui: React.ReactElement) {
  const result = customRender(ui);
  await waitForAuth();
  return result;
}

export * from '@testing-library/react';
export { customRender as render, waitForAuth, renderWithAuth };

// Re-export the original render for cases where we don't need the custom wrapper
export { render as renderWithoutWrapper } from '@testing-library/react';

// Also export a synchronous version for backward compatibility
export const renderSync = (ui: React.ReactElement) => {
  const user = userEvent.setup();
  let result: any;

  act(() => {
    result = render(ui, {
      wrapper: ({ children }) => (
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <AuthProvider>
              <LoginDialogProvider>
                <SectionRefProvider>{children}</SectionRefProvider>
              </LoginDialogProvider>
            </AuthProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      )
    });
  });

  return {
    ...result,
    user
  };
};
