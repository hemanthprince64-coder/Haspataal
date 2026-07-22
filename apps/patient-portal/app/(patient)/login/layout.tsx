import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Patient Login',
  description:
    'Sign in to your Haspataal patient account. Access your appointments, prescriptions, medical records, and health history securely.',
  openGraph: {
    title: 'Patient Login | Haspataal',
    description:
      'Sign in to your Haspataal patient account to manage appointments, records, and health history.',
    url: 'https://haspataal.com/login',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Haspataal Patient Login' }],
  },
  twitter: {
    card: 'summary',
    title: 'Patient Login | Haspataal',
    description: 'Sign in to your Haspataal patient account.',
  },
  alternates: {
    canonical: 'https://haspataal.com/login',
  },
  // Login page should not be indexed — avoid duplicate session pages in search results
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
