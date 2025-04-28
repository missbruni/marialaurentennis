import React from 'react';
import { ThemeProvider } from 'next-themes';

import { ReactQueryProvider } from './react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingFormProvider } from '../app/hooks/useBookingForm';
import { AuthProvider } from '../app/hooks/useAuth';

function customRender(ui: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: ({ children }) => (
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <AuthProvider>
              <BookingFormProvider>{children}</BookingFormProvider>
            </AuthProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      )
    })
  };
}

export * from '@testing-library/react';
export { customRender as render };
