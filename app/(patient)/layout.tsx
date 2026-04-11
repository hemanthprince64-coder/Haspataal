"use client";

import React, { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";
import Avatar from "@/app/components/Avatar";
import { getPatientFullProfile } from "@/app/actions";
import "@/bones/registry";

interface PatientLayoutProps {
    children: ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
    const pathname = usePathname() || "";
    const isAuthPage = pathname === "/login" || pathname === "/register";

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [patient, setPatient] = useState<any>(null);

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
                            suppressHydrationWarning
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 no-underline group scale-110">
                            <Image src="/logo.svg" alt="Haspataal" width={32} height={40} className="group-hover:scale-110 transition-transform" />
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
                            <Link href="/profile">
                                <Avatar 
                                    size="md" 
                                    imageUrl={patient?.profilePhotoUrl} 
                                    name={patient?.name || patient?.nickname} 
                                />
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

            {/* ── BOTTOM NAV (FORCE VISIBLE FOR DEBUG) ── */}
            <BottomNav />
        </div>
    );
}
