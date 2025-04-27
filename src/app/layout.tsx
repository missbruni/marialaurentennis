import type { Metadata } from 'next';
import './globals.css';
import { ReactQueryProvider } from '../lib/react-query';
import { ThemeProvider } from '../components/ThemeProvider';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'Maria Lauren Tennis',
  description: 'Book your tennis lesson with Maria Lauren'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="relative min-h-screen overflow-x-hidden" suppressHydrationWarning>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClientLayout>{children}</ClientLayout>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
