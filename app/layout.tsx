import React, { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Haspataal — Healthcare Assistance Platform",
  description: "India's smart hospital assistance platform connecting patients with local hospitals for outpatient consultations, diagnostic services and inpatient services.",
  keywords: "healthcare, hospital, doctor, appointment, OPD, India, Haspataal",
  icons: {
    icon: "/logo.svg",
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
