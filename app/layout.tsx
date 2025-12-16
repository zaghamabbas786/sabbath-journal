import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sabbath Journal',
  description: 'A contemplative, desktop-class journaling application based on the Immanuel approach.',
  icons: {
    icon: '/favicon.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="text-ink antialiased h-screen overflow-hidden">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}







