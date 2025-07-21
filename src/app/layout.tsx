import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ReactQueryProvider } from '../lib/react-query';
import { ThemeProvider } from '../components/ThemeProvider';
import ClientLayout from './client-layout';
import { Toaster } from '../components/ui/sonner';

export const metadata: Metadata = {
  title: 'Maria Lauren Tennis',
  description: 'Book your tennis lesson with Maria Lauren',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Maria Lauren Tennis'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/tennis-hero-3.webp" as="image" type="image/webp" />
      </head>
      <body className="relative min-h-screen overflow-x-hidden" suppressHydrationWarning>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="bottom-right" richColors closeButton expand={true} />
            <ClientLayout>{children}</ClientLayout>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
