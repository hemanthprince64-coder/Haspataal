"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = ({ isOpen, onClose }) => {
    const pathname = usePathname() || "";
    const sidebarRef = useRef(null);

    const navLinks = [
        { name: "Home", href: "/home", icon: "🏠" },
        { name: "MedChat AI", href: "/medchat", icon: "🤖" },
        { name: "Find Doctors", href: "/search", icon: "🔍" },
        { name: "Hospitals", href: "/hospitals", icon: "🏥" },
        { name: "Lab Tests", href: "/lab-tests", icon: "🔬" },
        { name: "My Records", href: "/records", icon: "📋" },
        { name: "My Profile", href: "/profile", icon: "👤" },
        { name: "Medical History", href: "/medical-history", icon: "🩺" },
        { name: "Medications", href: "/medications", icon: "💊" },
        { name: "Vitals", href: "/vitals", icon: "❤️" },
        { name: "Vaccinations", href: "/vaccinations", icon: "💉" },
        { name: "Pregnancy", href: "/tracker", icon: "🤰" },
        { name: "Insurance", href: "/insurance", icon: "🛡️" },
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
                    <Link href="/home" className="flex items-center gap-2 no-underline" onClick={onClose}>
                        <img src="/logo.svg" alt="Haspataal" className="w-7 h-9 object-contain" />
                        <span className="text-lg font-extrabold text-slate-900 tracking-tight">Haspataal</span>
                        <span className="text-lg font-extrabold text-medical-600 -ml-1">.</span>
                    </Link>
                    <button
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 focus-ring"
                        onClick={onClose}
                        aria-label="Close menu"
                        suppressHydrationWarning
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
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
                            const isExactActive = pathname === link.href || (pathname === '/' && link.href === '/home');
                            const active = isActive || isExactActive;
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
                                        <span className={`text-lg w-6 text-center ${active ? "" : "grayscale opacity-70"}`}>{link.icon}</span>
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
                        <span>🚑</span>
                        <span>Emergency SOS</span>
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
