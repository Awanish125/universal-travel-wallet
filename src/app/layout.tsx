import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ServiceWorkerRegistration } from '../components/providers/ServiceWorkerRegistration';
import { SmoothScrollProvider } from '../components/providers/SmoothScrollProvider';
import { LoadingScreen } from '../components/loading';

// Geist is not yet available via next/font/google on Next 14; Inter is the
// closest metric-compatible substitute, bound to the same --font-geist-sans
// token the design system specifies (design-system §8).
const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'Universal Travel Wallet',
  description: 'Universal offline-first travel money and expense management application',
};

import { BottomNav } from '../components/common/BottomNav';
import { OfflineBadge } from '../components/common/OfflineBadge';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-background text-text-primary min-h-screen">
        <ServiceWorkerRegistration />
        <OfflineBadge />
        <LoadingScreen />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <BottomNav />
      </body>
    </html>
  );
}
