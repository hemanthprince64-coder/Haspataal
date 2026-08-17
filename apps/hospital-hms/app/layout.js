/* eslint-disable */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@haspataal/ui';

import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

import PostHogPageView from './PostHogPageView';
import './globals.css';
import { CSPostHogProvider } from './providers';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
};

export const metadata = {
  title: 'Haspataal — Hospital Partner Portal',
  description:
    "Hospital, lab, and diagnostic center management portal. Join Haspataal's network, manage your OPD, doctors, and grow your practice.",
  keywords: 'hospital management, partner portal, Haspataal, OPD, doctor management',
  icons: {
    icon: '/logo.svg',
  },
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <CSPostHogProvider>
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 h-[60px] border-b bg-white flex items-center justify-between px-6">
              <Link href="/" className="flex items-center gap-2 no-underline">
                <Image
                  src="/logo.svg"
                  alt="Haspataal"
                  width={36}
                  height={36}
                  style={{ objectFit: 'contain' }}
                />
                <span className="font-bold text-primary text-lg">Haspataal</span>
                <span className="text-[10px] font-semibold text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                  PARTNER
                </span>
              </Link>

              <nav className="flex items-center gap-4 text-sm">
                <a
                  href="https://haspataal.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Patient Portal
                </a>
                <Link href="/" className="text-primary font-semibold hover:underline">
                  Hospital Home
                </Link>
              </nav>
            </header>

            {/* Content */}
            <PostHogPageView />
            <div className="flex-1">{children}</div>
          </div>
        </CSPostHogProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </body>
    </html>
  );
}
