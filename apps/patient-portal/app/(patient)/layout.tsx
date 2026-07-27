/* eslint-disable */
'use client';

import {
  Menu,
  Siren,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  HeartPulse,
  Hospital,
  FileText,
  Activity,
} from 'lucide-react';

import React, { useState, useEffect, ReactNode } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { getPatientFullProfile } from '@/app/actions';
import Avatar from '@/app/components/Avatar';
import '@/bones/registry';
import { PatientNavigation } from '@/components/patient-navigation';

import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

interface PatientLayoutProps {
  children: ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  const pathname = usePathname() || '';
  const isAuthPage = pathname === '/login' || pathname === '/register';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [patient, setPatient] = useState<any>(null);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!isAuthPage) {
      getPatientFullProfile().then(setPatient);
    }
  }, [isAuthPage]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>
      {!isAuthPage && (
        <PatientNavigation patient={patient} onOpenSidebar={() => setIsSidebarOpen(true)} />
      )}

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col relative w-full">
        {!isAuthPage && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

        <main
          id="main-content"
          className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 pb-32 md:pb-16 animate-fade-in text-senior-base"
        >
          {children}
        </main>

        {/* ── FOOTER ── */}
        <Footer />
      </div>
    </div>
  );
}
