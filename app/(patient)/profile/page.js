'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { patientLogout, getPatientFullProfile } from "@/app/actions";

const sections = [
    { name: "Edit Profile", href: "/profile/edit", icon: "✏️", desc: "Advanced Details", color: "bg-blue-50 text-blue-600 border-blue-200" },
    { name: "Medical History", href: "/medical-history", icon: "🏥", desc: "Conditions & allergies", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    { name: "Medications", href: "/medications", icon: "💊", desc: "Current medicines", color: "bg-violet-50 text-violet-600 border-violet-200" },
    { name: "Vitals Tracker", href: "/vitals", icon: "❤️", desc: "BP, weight, sugar", color: "bg-red-50 text-red-600 border-red-200" },
    { name: "My Records", href: "/records", icon: "📋", desc: "Prescriptions & reports", color: "bg-amber-50 text-amber-600 border-amber-200" },
    { name: "Vaccinations", href: "/vaccinations", icon: "💉", desc: "Vaccine records", color: "bg-teal-50 text-teal-600 border-teal-200" },
    { name: "Pregnancy Tracker", href: "/tracker", icon: "🤰", desc: "Maternal health", color: "bg-pink-50 text-pink-600 border-pink-200" },
    { name: "Insurance", href: "/insurance", icon: "🛡️", desc: "Policy details", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
    { name: "MedChat AI", href: "/medchat", icon: "🤖", desc: "AI health assistant", color: "bg-cyan-50 text-cyan-600 border-cyan-200" },
];

export default function ProfilePage() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPatientFullProfile().then(data => {
            setPatient(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div className="py-12 text-center text-slate-500 animate-pulse font-medium">Loading profile...</div>;
    }

    const { name, phone } = patient || {};
    const displayName = name || 'Patient';
    const displayPhone = phone || '—';

    return (
        <div className="py-6 space-y-6 animate-fade-in-up">
            {/* Profile Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-medical-600 via-medical-500 to-blue-500 p-6 text-white shadow-xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
                <div className="relative flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border-2 border-white/30 shadow-lg">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold tracking-tight">{displayName}</h1>
                        <p className="text-white/80 text-sm mt-0.5">{displayPhone}</p>
                    </div>
                    <Link
                        href="/profile/edit"
                        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-semibold py-2 px-3.5 rounded-xl transition-all duration-200 no-underline border border-white/20"
                    >
                        ✏️ Edit
                    </Link>
                </div>
            </div>

            {/* Section Grid */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                        Health Sections
                    </h2>
                    <button
                        onClick={() => {
                            import('@/app/export').then(m => m.downloadPatientReport(patient))
                        }}
                        className="text-xs bg-slate-100/80 text-slate-600 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <span>⬇️</span> Export Data
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sections.map((s) => (
                        <Link
                            key={s.href}
                            href={s.href}
                            className={`group flex items-center gap-3.5 p-4 rounded-xl border bg-white hover:shadow-md transition-all duration-200 no-underline`}
                        >
                            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-lg shrink-0 border transition-transform duration-200 group-hover:scale-110`}>
                                {s.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-slate-800 truncate">{s.name}</div>
                                <div className="text-xs text-slate-400 truncate">{s.desc}</div>
                            </div>
                            <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Logout */}
            <form action={patientLogout} className="pt-2">
                <button
                    type="submit"
                    className="w-full py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all duration-200 cursor-pointer"
                >
                    Log Out
                </button>
            </form>
        </div>
    );
}
