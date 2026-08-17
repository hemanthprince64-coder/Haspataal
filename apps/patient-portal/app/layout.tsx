import React, { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
};

export const metadata: Metadata = {
  title: {
    default: 'Haspataal — Healthcare Assistance Platform',
    template: '%s | Haspataal',
  },
  description:
    "India's smart hospital assistance platform connecting patients with local hospitals for outpatient consultations, diagnostic services and inpatient services.",
  keywords: 'healthcare, hospital, doctor, appointment, OPD, India, Haspataal',
  metadataBase: new URL('https://haspataal.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://haspataal.com',
    siteName: 'Haspataal',
    title: 'Haspataal — Healthcare Assistance Platform',
    description:
      "India's smart hospital assistance platform connecting patients with local hospitals for outpatient consultations, diagnostic services and inpatient services.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Haspataal — Healthcare Assistance Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Haspataal — Healthcare Assistance Platform',
    description: "India's smart hospital assistance platform",
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/logo.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
