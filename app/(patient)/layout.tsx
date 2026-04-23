"use client";

import React, { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Avatar from "@/app/components/Avatar";
import { getPatientFullProfile } from "@/app/actions";
import { Menu, Siren, Mail, MapPin, Phone, ShieldCheck, HeartPulse, Hospital, FileText, Activity } from "lucide-react";
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
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* Hamburger */}
                        <button
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 p-2.5 rounded-xl transition-all duration-200"
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Open menu"
                            suppressHydrationWarning
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group decoration-transparent no-underline">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300 shadow-md shadow-blue-600/20">
                                <Hospital className="w-6 h-6 text-white" />
                            </div>
                            <div className="hidden sm:flex items-baseline">
                                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">Haspataal</span>
                                <span className="text-3xl font-extrabold text-blue-600 leading-none">.</span>
                            </div>
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/emergency"
                            className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all duration-300 border border-red-100 hover:border-red-600 group no-underline"
                        >
                            <Siren className="w-4 h-4 group-hover:animate-pulse" /> 
                            <span className="hidden sm:inline uppercase tracking-widest text-xs">Emergency</span>
                        </Link>
                        {!isAuthPage && (
                            <Link href="/profile" className="ml-2 hover:scale-105 transition-transform duration-200 ring-4 ring-transparent hover:ring-blue-50 rounded-full">
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
            <div className="flex-1 flex flex-col relative w-full">
                {!isAuthPage && (
                    <Sidebar
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 pb-32 md:pb-16 animate-fade-in text-senior-base">
                    {children}
                </main>

                {/* ── FOOTER ── */}
                <Footer />
            </div>

            {/* ── BOTTOM NAV (FORCE VISIBLE FOR DEBUG) ── */}
            <BottomNav />
        </div>
    );
}
