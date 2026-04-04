'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from 'boneyard-js/react';
import { getPatientFullProfile, patientLogout } from "@/app/actions";
import ProfileCard from "@/components/patient/ProfileCard";
import ClinicalServices from "@/components/patient/ClinicalServices";

const actionSections = [
    { name: "Book Appointment", href: "/search", icon: "🔍", desc: "Find doctors & hospitals" },
    { name: "My Appointments", href: "/appointments", icon: "📅", desc: "Upcoming, Past, Waitlist" },
    { name: "Emergency Help", href: "/emergency", icon: "🚑", desc: "Ambulance & SOS" }
];

export default function ProfilePage() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPatientFullProfile().then(data => {
            if (data) setPatient(data);
            setLoading(false);
        }).catch(err => {
            console.error("Profile load err:", err);
            setLoading(false);
        });
    }, []);

    const walletBalance = patient?.wallet?.balance || 0;
    const formattedBalance = parseFloat(walletBalance).toFixed(2);

    const personalSections = [
        { name: "Edit Profile", href: "/profile/edit", icon: "✏️", desc: "Personal & contact info" },
        { name: "Saved Addresses", href: "/addresses", icon: "📍", desc: "Home / Work" },
        { name: "Haspataal Wallet", href: "/wallet", icon: "💰", desc: `Balance: ₹${formattedBalance}` }
    ];

    return (
        <div className="py-4 space-y-8 animate-fade-in text-senior-base">
            {/* Profile Card — Compact Clinical */}
            <Skeleton name="patient-profile-card" loading={loading}>
                <ProfileCard patient={patient} />
            </Skeleton>

            {/* Quick Actions (Top Priority) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[#0D2B55] font-black uppercase tracking-widest text-xs opacity-60">
                        Quick Actions
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {actionSections.map((s, i) => (
                        <Link
                            key={s.href}
                            href={s.href}
                            className="card-clinical card-clinical-hover p-4 flex flex-row md:flex-col items-center md:items-start gap-4 no-underline group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                {s.icon}
                            </div>
                            <div className="space-y-0.5 min-w-0 flex-1">
                                <div className="text-lg font-black text-[#0D2B55] group-hover:text-blue-600 transition-colors truncate">
                                    {s.name}
                                </div>
                                <div className="text-xs text-slate-500 font-bold leading-tight truncate">{s.desc}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Personal Data */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[#0D2B55] font-black uppercase tracking-widest text-xs opacity-60">
                        Personal Data
                    </h2>
                </div>
                <Skeleton name="personal-data-grid" loading={loading}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {personalSections.map((s, i) => (
                            <Link
                                key={s.href}
                                href={s.href}
                                className="card-clinical card-clinical-hover p-4 flex flex-row md:flex-col items-center md:items-start gap-4 no-underline group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    {s.icon}
                                </div>
                                <div className="space-y-0.5 min-w-0 flex-1">
                                    <div className="text-lg font-black text-[#0D2B55] group-hover:text-blue-600 transition-colors truncate">
                                        {s.name}
                                    </div>
                                    <div className="text-xs text-slate-500 font-bold leading-tight truncate">{s.desc}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Skeleton>
            </div>

            {/* Section Grid — Compact Clinical Services */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[#0D2B55] font-black uppercase tracking-widest text-xs opacity-60">
                        Clinical Services
                    </h2>
                    <button
                        onClick={() => {
                            import('@/app/export').then(m => m.downloadPatientReport(patient))
                        }}
                        className="text-blue-600 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                        PDF Report ⬇️
                    </button>
                </div>
                <Skeleton name="clinical-services-grid" loading={loading}>
                    <ClinicalServices />
                </Skeleton>
            </div>

            {/* Logout — Compact Danger Action */}
            <form action={patientLogout} className="pt-4">
                <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-red-50 text-red-600 border border-red-200 font-black tracking-widest text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 uppercase"
                >
                    Safe Logout
                </button>
            </form>
        </div>
    );
}
