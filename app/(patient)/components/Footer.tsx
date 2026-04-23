"use client";

import React from "react";
import { HeartPulse } from "lucide-react";
import FooterLinks from "./FooterLinks";
import PortalCards from "./PortalCards";

export default function Footer() {
    const [mounted, setMounted] = React.useState(false);
    
    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <footer className="bg-slate-950 text-slate-300 pt-20 pb-12 border-t border-slate-900 shadow-2xl overflow-hidden relative">
            {/* Background Glow - Forced refresh comment */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] -z-10 rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[150px] -z-10 rounded-full" />

            <div className="flex flex-col gap-8">
                {/* 1. Link Columns */}
                <FooterLinks />

                {/* 2. Portal Cards Section */}
                <PortalCards />

                {/* 3. Bottom Bar */}
                <div className="max-w-7xl mx-auto w-full px-6 pt-12 border-t border-slate-900/80 text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8">
                        <p>© {mounted ? new Date().getFullYear() : '2026'} Haspataal Healthcare Labs. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
                            <a href="#" className="hover:text-slate-300 transition-colors">Cookies</a>
                        </div>
                    </div>
                    <p className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800/50">
                        Made with <HeartPulse className="w-4 h-4 text-red-500 animate-pulse"/> in India
                    </p>
                </div>
            </div>
        </footer>
    );
}
