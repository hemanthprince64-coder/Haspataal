"use client";

import React, { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";
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
                <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 pb-24 md:pb-0">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <Hospital className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-2xl font-extrabold text-white tracking-tight">Haspataal</span>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                India&apos;s ultimate healthcare discovery and continuous care platform. Assisting patients transparently from triage to recovery.
                            </p>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"><Activity className="w-4 h-4"/></div>
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors cursor-pointer"><ShieldCheck className="w-4 h-4"/></div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-6 tracking-wide">For Patients</h3>
                            <ul className="space-y-4 text-sm">
                                <li><Link href="/search" className="hover:text-blue-400 transition-colors no-underline">Find Doctors</Link></li>
                                <li><Link href="/hospitals" className="hover:text-blue-400 transition-colors no-underline">Top Hospitals</Link></li>
                                <li><Link href="/medchat" className="hover:text-blue-400 transition-colors no-underline">MedChat AI Consult</Link></li>
                                <li><Link href="/records" className="hover:text-blue-400 transition-colors no-underline">Health Records Vault</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-6 tracking-wide">Legal & Support</h3>
                            <ul className="space-y-4 text-sm">
                                <li><Link href="#" className="hover:text-blue-400 transition-colors no-underline">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-blue-400 transition-colors no-underline">Terms of Service</Link></li>
                                <li><Link href="/emergency" className="text-red-400 hover:text-red-300 transition-colors no-underline">Emergency Protocol</Link></li>
                                <li><Link href="#" className="hover:text-blue-400 transition-colors no-underline">Help Center</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-white font-bold mb-6 tracking-wide">Contact Us</h3>
                            <ul className="space-y-4 text-sm">
                                <li className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
                                    <span>Haspataal HQ, BKC<br/>Mumbai, India 400051</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-slate-500" />
                                    <span>1800-HASPATAAL</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-slate-500" />
                                    <span>care@haspataal.com</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-slate-800/50 text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p suppressHydrationWarning>© {new Date().getFullYear()} Haspataal Healthcare Labs. All rights reserved.</p>
                        <p className="flex items-center gap-1">Made with <HeartPulse className="w-4 h-4 text-red-500"/> in India</p>
                    </div>
                </footer>
            </div>

            {/* ── BOTTOM NAV (FORCE VISIBLE FOR DEBUG) ── */}
            <BottomNav />
        </div>
    );
}
