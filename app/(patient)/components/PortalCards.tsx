"use client";

import React from "react";
import PortalCard from "./PortalCard";

export default function PortalCards() {
    return (
        <section className="relative py-8">
            {/* Soft Divider */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
            
            <div className="max-w-6xl mx-auto px-6">
                <div className="mb-8 text-center">
                    {/* Header section - Forced refresh */}
                    <h2 className="text-slate-100 font-bold text-xl tracking-tight mb-1">Quick Access Portals</h2>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Connect to your Haspataal Workspace</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PortalCard type="patient" />
                    <PortalCard type="doctor" />
                    <PortalCard type="hospital" />
                </div>
            </div>

            {/* Background Atmosphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/[0.02] blur-[100px] -z-10 pointer-events-none" />
        </section>
    );
}
