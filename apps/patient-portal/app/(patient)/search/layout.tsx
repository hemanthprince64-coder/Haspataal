import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Find Doctors',
  description:
    'Search and book appointments with verified doctors across India. Filter by speciality, city, experience and availability. OPD booking in under 30 seconds.',
  openGraph: {
    title: 'Find Doctors Near You | Haspataal',
    description:
      'Search and book appointments with verified doctors across India. Filter by speciality, city, and availability.',
    url: 'https://haspataal.com/search',
    images: [
      { url: '/og-doctors.png', width: 1200, height: 630, alt: 'Find Doctors on Haspataal' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Doctors Near You | Haspataal',
    description: 'Book OPD appointments with verified doctors. Fast, easy, trusted.',
    images: ['/og-doctors.png'],
  },
  alternates: {
    canonical: 'https://haspataal.com/search',
  },
  robots: { index: true, follow: true },
};

export default function SearchLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
