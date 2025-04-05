import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "../lib/react-query";

export const metadata: Metadata = {
  title: "Maria Lauren Tennis",
  description: "Book your tennis lesson with Maria Lauren",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative min-h-screen overflow-x-hidden">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
