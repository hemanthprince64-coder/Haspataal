"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";

export default function PatientLayout({ children }) {
    const pathname = usePathname() || "";
    const isAuthPage = pathname === "/login" || pathname === "/register";

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <div className="min-h-screen flex flex-col bg-surface text-slate-900">
            {/* ── TOP HEADER ── */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-nav">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Hamburger */}
                    <button
                        className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-all duration-200 mr-2 sm:mr-4 flex items-center justify-center focus-ring"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Logo */}
                    <Link href="/home" className="flex items-center gap-2 no-underline">
                        <img src="/logo.svg" alt="Haspataal" className="w-7 h-9 object-contain" />
                        <span className="text-xl font-extrabold text-slate-900 tracking-tight">Haspataal</span>
                        <span className="text-xl font-extrabold text-medical-600 -ml-1">.</span>
                    </Link>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/emergency"
                            className="hidden sm:inline-flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-1.5 px-3.5 rounded-xl text-sm transition-all duration-200 border border-red-200"
                        >
                            🚑 <span className="hidden md:inline">Emergency</span>
                        </Link>
                        {!isAuthPage && (
                            <Link
                                href="/profile"
                                className="flex items-center justify-center w-9 h-9 rounded-xl bg-medical-50 text-medical-700 font-bold text-sm hover:bg-medical-100 transition-all duration-200 border border-medical-200"
                            >
                                R
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

                <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 pb-20 md:pb-8">
                    {children}
                </main>
            </div>

            {/* ── BOTTOM NAV (Mobile) ── */}
            {!isAuthPage && (
                <div className="md:hidden block">
                    <BottomNav />
                </div>
            )}
        </div>
    );
}
