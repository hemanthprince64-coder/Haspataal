"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";
import { getPatientFullProfile } from "@/app/actions";

export default function PatientLayout({ children }) {
    const pathname = usePathname() || "";
    const isAuthPage = pathname === "/login" || pathname === "/register";

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [patient, setPatient] = useState(null);

    useEffect(() => {
        if (!isAuthPage) {
            getPatientFullProfile().then(setPatient);
        }
    }, [isAuthPage]);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isSidebarOpen]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
            {/* ── TOP HEADER ── */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Hamburger */}
                        <button
                            className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-2xl transition-all duration-200 focus-ring"
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Open menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 no-underline group scale-110">
                            <img src="/logo.svg" alt="Haspataal" className="w-8 h-10 object-contain group-hover:scale-110 transition-transform" />
                            <span className="text-2xl font-black text-[#0D2B55] tracking-tight">Haspataal</span>
                            <span className="text-2xl font-black text-blue-600 -ml-1">.</span>
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/emergency"
                            className="bg-red-600 text-white hover:bg-red-700 px-6 py-2.5 rounded-2xl text-sm font-black tracking-widest flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                            🚑 <span className="hidden md:inline uppercase">Emergency</span>
                        </Link>
                        {!isAuthPage && (
                            <Link
                                href="/profile"
                                className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 font-black border-2 border-blue-100 hover:border-blue-300 transition-all overflow-hidden shadow-sm"
                            >
                                {patient?.profilePhotoUrl ? (
                                    <img src={patient.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    (patient?.name || 'R').charAt(0).toUpperCase()
                                )}
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* ── MAIN AREA ── */}
            <div className="flex-1 flex flex-col relative">
                {!isAuthPage && (
                    <Sidebar
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 pb-32 md:pb-16 animate-fade-in text-senior-base">
                    {children}
                </main>
            </div>

            {/* ── BOTTOM NAV (Mobile Only) ── */}
            {!isAuthPage && (
                <div className="md:hidden">
                    <BottomNav />
                </div>
            )}
        </div>
    );
}
