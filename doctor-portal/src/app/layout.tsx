import React, { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Haspataal — Doctor Portal',
  description: 'Your practice management hub on doctor.haspataal.com',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen flex`}>
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-6 shrink-0">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-cyan-400">Haspataal</h1>
            <p className="text-xs text-gray-500 mt-1">doctor.haspataal.com</p>
          </div>
          <nav className="flex flex-col gap-2 flex-1">
            <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 font-medium text-sm">
              <span>🏠</span> Dashboard
            </Link>
            <Link href="/appointments" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">
              <span>📅</span> Appointments
            </Link>
            <Link href="/patients" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">
              <span>👥</span> My Patients
            </Link>
            <Link href="/prescriptions" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">
              <span>💊</span> Prescriptions
            </Link>
            <Link href="/telemedicine" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">
              <span>📹</span> Telemedicine
            </Link>
            <Link href="/analytics" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">
              <span>📊</span> Analytics
            </Link>
          </nav>
          <div className="mt-auto">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold">D</div>
              <div>
                <p className="text-xs font-semibold">Dr. Profile</p>
                <p className="text-[10px] text-gray-500">doctor.haspataal.com</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
