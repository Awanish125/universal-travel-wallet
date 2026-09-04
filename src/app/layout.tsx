import type { Metadata } from 'next';
import './globals.css';
import { ServiceWorkerRegistration } from '../components/providers/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'Universal Travel Wallet',
  description: 'Universal offline-first travel money and expense management application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-text-primary min-h-screen">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
