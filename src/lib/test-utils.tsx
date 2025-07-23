import React from 'react';
import { ThemeProvider } from 'next-themes';

import { ReactQueryProvider } from './react-query';
import { render } from '@testing-library/react';
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

export * from '@testing-library/react';
export { customRender as render };
