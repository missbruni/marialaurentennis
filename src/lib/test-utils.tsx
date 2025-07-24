import React from 'react';
import { ThemeProvider } from 'next-themes';

import { ReactQueryProvider } from './react-query';
import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionRefProvider } from '@/hooks/useSectionRef';
import { AuthProvider } from '@/hooks/useAuth';
import { LoginDialogProvider } from '@/providers/LoginDialogProvider';

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
