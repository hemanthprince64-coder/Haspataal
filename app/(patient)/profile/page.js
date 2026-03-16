'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { patientLogout, getPatientFullProfile } from "@/app/actions";

const sections = [
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

    const { name, phone, nickname, profilePhotoUrl } = patient || {};
    const displayName = nickname || name || 'Patient';
    const displayPhone = phone || '—';

    return (
        <div className="py-4 space-y-8 animate-fade-in text-senior-base">
            {/* Profile Card — Compact Clinical */}
            <div className="card-clinical p-6 relative overflow-hidden border-2 border-blue-50 shadow-md">
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 rounded-2xl border-2 border-blue-100 bg-white shadow-lg shrink-0 overflow-hidden">
                        {profilePhotoUrl ? (
                            <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-black text-blue-600 bg-blue-50">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left min-w-0 space-y-1">
                        <p className="text-blue-600 text-xs font-black uppercase tracking-[0.2em]">
                            {new Date().getHours() < 12 ? '☀️ Good Morning' : new Date().getHours() < 17 ? '🌤️ Good Afternoon' : '🌙 Good Evening'}, Welcome
                        </p>
                        <h1 className="text-3xl font-black text-[#0D2B55] tracking-tight truncate">{displayName}</h1>
                        <p className="text-slate-500 text-lg font-bold">{displayPhone}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <Link
                            href="/profile/edit"
                            className="bg-white text-blue-700 border-2 border-blue-100 px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all text-center"
                        >
                            ✏️ Edit Profile
                        </Link>
                        <Link
                            href="/profile/details"
                            className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all text-center shadow-md"
                        >
                            View Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            {/* Section Grid — Compact Senior-Friendly Services */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sections.map((s, i) => (
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
