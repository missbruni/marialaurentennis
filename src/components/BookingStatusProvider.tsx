import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const FIVE_MINUTES = 5 * 60 * 1000;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always consider data stale for booking status
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

type BookingStatusProviderProps = {
  children: React.ReactNode;
};

export function BookingStatusProvider({ children }: BookingStatusProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
