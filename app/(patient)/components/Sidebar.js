"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
    Home, Search, Bot, Building2, Microscope, FileText, 
    User, Stethoscope, Pill, HeartPulse, Syringe, 
    Baby, ShieldCheck, AlertTriangle, X 
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
    const pathname = usePathname() || "";
    const sidebarRef = useRef(null);

    const navLinks = [
        { name: "Home", href: "/", icon: Home },
        { name: "MedChat AI", href: "/medchat", icon: Bot },
        { name: "Find Doctors", href: "/search", icon: Search },
        { name: "Hospitals", href: "/hospitals", icon: Building2 },
        { name: "Lab Tests", href: "/lab-tests", icon: Microscope },
        { name: "My Records", href: "/records", icon: FileText },
        { name: "My Profile", href: "/profile", icon: User },
        { name: "Medical History", href: "/medical-history", icon: Stethoscope },
        { name: "Medications", href: "/medications", icon: Pill },
        { name: "Vitals", href: "/vitals", icon: HeartPulse },
        { name: "Vaccinations", href: "/vaccinations", icon: Syringe },
        { name: "Pregnancy", href: "/tracker", icon: Baby },
        { name: "Insurance", href: "/insurance", icon: ShieldCheck },
    ];

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;
        const focusableElements = sidebarRef.current?.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        if (!focusableElements || focusableElements.length === 0) return;
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];
        const handleTabKey = (e) => {
            if (e.key === "Tab") {
                if (e.shiftKey && document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                } else if (!e.shiftKey && document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        };
        firstEl.focus();
        window.addEventListener("keydown", handleTabKey);
        return () => window.removeEventListener("keydown", handleTabKey);
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[200] bg-slate-900/30 backdrop-blur-[2px] transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <aside
                ref={sidebarRef}
                className={`fixed inset-y-0 left-0 z-[210] w-[280px] sm:w-[300px] bg-white border-r border-slate-200 shadow-elevated flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
                role="dialog"
                aria-modal="true"
                aria-label="Sidebar Navigation"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-2 no-underline" onClick={onClose}>
                        <Image src="/logo.svg" alt="Haspataal" width={28} height={36} />
                        <span className="text-lg font-extrabold text-slate-900 tracking-tight">Haspataal</span>
                        <span className="text-lg font-extrabold text-medical-600 -ml-1">.</span>
                    </Link>
                    <button
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 focus-ring"
                        onClick={onClose}
                        aria-label="Close menu"
                        suppressHydrationWarning
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Section Label */}
                <div className="px-5 pt-4 pb-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Navigation</span>
                </div>

                {/* Links */}
                <nav className="flex-1 overflow-y-auto px-3 pb-4" role="navigation">
                    <ul className="flex flex-col gap-0.5 m-0 p-0 list-none">
                        {navLinks.map((link) => {
                            const isActive = pathname.startsWith(link.href) && link.href !== '/';
                            const isExactActive = pathname === link.href;
                            const active = isActive || isExactActive;
                            const Icon = link.icon;
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline ${active
                                            ? "bg-medical-50 text-medical-700 font-semibold border-l-[3px] border-medical-600 pl-[9px]"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                            }`}
                                        onClick={onClose}
                                    >
                                        <Icon className={`w-5 h-5 ${active ? "text-medical-600" : "text-slate-400"}`} />
                                        <span>{link.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Divider */}
                <div className="mx-4 border-t border-slate-100" />

                {/* Footer */}
                <div className="p-3">
                    <Link
                        href="/emergency"
                        className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-semibold py-2.5 rounded-xl transition-all duration-200 no-underline text-sm focus-ring"
                        onClick={onClose}
                    >
                        <AlertTriangle className="w-5 h-5" />
                        <span>Emergency SOS</span>
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
