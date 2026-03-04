import { Merriweather, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const merriweather = Merriweather({
  weight: ['400', '700', '900'],
  subsets: ["latin"],
  variable: '--font-merriweather',
});

const sourceSans = Source_Sans_3({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-source-sans',
});

export const metadata = {
  title: "Haspataal — Healthcare Assistance Platform",
  description: "India's smart hospital assistance platform connecting patients with local hospitals for outpatient consultations, diagnostic services and inpatient services.",
  keywords: "healthcare, hospital, doctor, appointment, OPD, India, Haspataal",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${merriweather.variable} ${sourceSans.variable}`} suppressHydrationWarning>
      <body className={sourceSans.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}
